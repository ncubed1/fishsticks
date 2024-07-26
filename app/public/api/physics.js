import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier2d-compat';

export function then(resolve) {
RAPIER.init().then(() => {
    class Simulation {
        constructor(props) {
            const { timeStep = 1 / 60.0, gravity = { x: 0.0, y: 0.0 } } = props;

            let integrationParams = new RAPIER.IntegrationParameters();
            integrationParams.dt = timeStep; // 1/60
            integrationParams.maxCcdSubsteps = 50; // 50
            integrationParams.allowedLinearError = 0.001; // 0.001; 0.00001 (accuracy)
            integrationParams.erp = 0.2; // 0.2; 0.0001 (accuracy)
            integrationParams.minIslandSize = 128; // 128
            integrationParams.numAdditionalFrictionIterations = 4; // 4
            integrationParams.numInternalPgsIterations = 1; // 1
            integrationParams.numSolverIterations = 50; // 4; 50 (accuracy, most important)
            integrationParams.predictionDistance = 0.002; // 0.002; 0.00001 (accuracy)

            // accurate
            // integrationParams.dt = timeStep; // 1/60
            // integrationParams.maxCcdSubsteps = 50; // 50
            // integrationParams.allowedLinearError = 0.0000001; // 0.001; 0.00001 (accuracy)
            // integrationParams.erp = 0.0000001; // 0.2; 0.0001 (accuracy)
            // integrationParams.minIslandSize = 128; // 128
            // integrationParams.numAdditionalFrictionIterations = 4000; // 4
            // integrationParams.numInternalPgsIterations = 10; // 1
            // integrationParams.numSolverIterations = 500; // 4; 50 (accuracy, most important)
            // integrationParams.predictionDistance = 0.00001; // 0.002; 0.00001 (accuracy)

            let simulation = new RAPIER.World(gravity, integrationParams.raw);
            this.rapierSim = simulation;
            this.RAPIER = RAPIER;

            this.simulationTime = 0;
        }

        createJointParams(pos1, rot1, pos2, rot2) {
            let jointParams = RAPIER.JointData.fixed(pos1, rot1, pos2, rot2);
            return jointParams
        }

        step() {
            this.rapierSim.step();
        }

        findCollidersFromPos(pos) {
            const colliders = []
            this.rapierSim.intersectionsWithPoint(pos, (handle) => {
                colliders.push(handle);
                return true;
            });
            return colliders;
        }



        putRigidBody(rigidBodyDesc) {
            return this.rapierSim.createRigidBody(rigidBodyDesc);
        }

        addCollider(colliderDesc, rigidBody) {
            return this.rapierSim.createCollider(colliderDesc, rigidBody);
        }

        removeCollider(collider) { // unused
            this.rapierSim.removeCollider(collider);
        }

        removeRigidBody(rigidBody) { // will delete all colliders attached
            this.rapierSim.removeRigidBody(rigidBody);
        }
    }

    class ObjectPhysics {
        constructor(sim, props) {
            this.sim = sim;
            this.rapierSim = sim.rapierSim;
            const {
                pos = { x: 0, y: 0 },
                mass = 0,
                density = 0,
                restitution = 0,
                friction = 0,
                v = { x: 0, y: 0 },
                a = { x: 0, y: 0 },

                isRigidBody = false,
                isCollider = false,
                rigidBody = "dynamic",
                canSleep = true,
                ccd = true,
            } = props;

            this.pos = pos;
            this.mass = mass;
            this.density = density;
            this.restitution = restitution;
            this.friction = friction;
            this.ccd = ccd;
            this.v = v;
            this.a = a;

            this.isRigidBody = isRigidBody; // unused
            this.isCollider = isCollider;   // unused
            this.rigidBodyType = rigidBody;
            this.canSleep = canSleep;

            this.rigidBody = null
            this.collider = null;
        }

        createRigidBody() { // rigidbody defines motion
            let rigidBodyDesc;
            switch (this.rigidBodyType) {
                case "dynamic": // has motion
                    rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(this.pos.x, this.pos.y)
                    .setAdditionalMass(this.mass)
                    .setCcdEnabled(this.ccd)
                    .setLinvel(this.v.x, this.v.y)
                    .setCanSleep(this.canSleep);
                    break;
                case "fixed": // no motion
                    rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
                    .setTranslation(this.pos.x, this.pos.y)
                    .setCcdEnabled(this.ccd);
                    break;
                default:
                    console.log("unable to create rigid body, invalid type `"+this.rigidBodyType+"`");
                    return false;
            }
            return rigidBodyDesc;
        }

        createCollider() {
            let colliderDesc = RAPIER.ColliderDesc
            return colliderDesc;
        }

        putRigidBody(rigidBodyDesc) {
            this.rigidBody = this.sim.putRigidBody(rigidBodyDesc);
        }

        addCollider(colliderDesc) {
            this.collider = this.sim.addCollider(colliderDesc, this.rigidBody);
        }

        put() {
            let rigidBodyDesc = this.createRigidBody();
            this.putRigidBody(rigidBodyDesc);
            let colliderDesc = this.createCollider();
            this.addCollider(colliderDesc);
        }

        removeCollider() { // unused
            this.sim.removeCollider(this.collider);
        }

        removeRigidBody() {
            this.sim.removeRigidBody(this.rigidBody);
        }

        // get properties

        translation() {
            try {
                return this.rigidBody.translation();
            } catch (_) {
                return this.pos;
            }
        }

        rotation() {
            return this.rigidBody.rotation();
        }

        linvel() {
            try {
                return this.rigidBody.linvel();
            } catch (_) {
                return this.v;
            }
        }

        getMass() {
            try {
                return this.rigidBody.mass();
            } catch (_) {
                return this.mass;
            }
        }
    }

    class BallPhy extends ObjectPhysics {
        constructor(sim, props) {
            super(sim, props);
            const { r = 0 } = props;
            this.r = r;
        }

        createCollider() { // colliders define space
            const colliderDesc = super.createCollider()
                .ball(this.r)
                .setRestitution(this.restitution)
                .setDensity(this.density)
                .setFriction(this.friction);
            return colliderDesc;
        }
    }

    class RectPhy extends ObjectPhysics {
        constructor(sim, props) {
            super(sim, props);
            const { w = 0, h = 0 } = props;
            this.w = w;
            this.h = h;
        }

        createCollider() { // colliders define space
            const colliderDesc = super.createCollider()
                .cuboid(this.w/2, this.h/2)
                .setRestitution(this.restitution)
                .setDensity(this.density)
                .setFriction(this.friction);
            return colliderDesc;
        }
    }
    resolve({ Simulation, BallPhy, RectPhy })
});
}
