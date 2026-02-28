let RAPIER;

export class Simulation {
  timeStep: number;
  gravity: { x: number; y: number };
  simulationTime: number;
  rapierSim: any;

  constructor(props) {
    const { timeStep = 1 / 60.0, gravity = { x: 0.0, y: 0.0 } } = props;

    this.timeStep = timeStep;
    this.gravity = gravity;
    this.simulationTime = 0;
  }

  async init() {
    // RAPIER = await import('https://cdn.skypack.dev/@dimforge/rapier2d-compat');

    // BUG: rapier2d does not work but rapier2d-compat does
    // RAPIER = await import('@dimforge/rapier2d');
    RAPIER = await import("@dimforge/rapier2d-compat");
    await RAPIER.init();

    let integrationParams = new RAPIER.IntegrationParameters();
    integrationParams.dt = this.timeStep; // 1/60
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

    let simulation = new RAPIER.World(this.gravity, integrationParams.raw);
    this.rapierSim = simulation;
  }

  updateColliders() {
    this.rapierSim.updateSceneQueries();
  }

  createJointParams(pos1, rot1, pos2, rot2) {
    let jointParams = RAPIER.JointData.fixed(pos1, rot1, pos2, rot2);
    return jointParams;
  }

  step() {
    this.rapierSim.step();
  }

  findCollidersFromPos(pos) {
    const colliders = [];
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

  removeCollider(collider) {
    // unused
    this.rapierSim.removeCollider(collider);
  }

  removeRigidBody(rigidBody) {
    // will delete all colliders attached
    this.rapierSim.removeRigidBody(rigidBody);
  }
}

class ObjectPhysics {
  sim: Simulation;
  rapierSim: any;
  pos: { x: number; y: number };
  mass: number;
  density: number;
  restitution: number;
  friction: number;
  ccd: boolean;
  v: { x: number; y: number };
  a: { x: number; y: number };
  isRigidBody: boolean;
  isCollider: boolean;
  rigidBodyType: string;
  canSleep: boolean;
  rigidBody: any;
  collider: any;

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
    this.isCollider = isCollider; // unused
    this.rigidBodyType = rigidBody;
    this.canSleep = canSleep;

    this.rigidBody = null;
    this.collider = null;
  }

  createRigidBody() {
    // rigidbody defines motion
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
        console.log(
          "unable to create rigid body, invalid type `" +
            this.rigidBodyType +
            "`",
        );
        return false;
    }
    return rigidBodyDesc;
  }

  createCollider() {
    let colliderDesc = RAPIER.ColliderDesc;
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

  removeCollider() {
    // unused
    this.sim.removeCollider(this.collider);
  }

  removeRigidBody() {
    this.sim.removeRigidBody(this.rigidBody);
  }

  // get properties

  getBodyType() {
    const bodyType = this.rigidBody.bodyType();
    if (bodyType === RAPIER.RigidBodyType.Dynamic) {
      return "dynamic";
    } else if (bodyType === RAPIER.RigidBodyType.static) {
      return "static";
    }
  }

  getTranslation() {
    try {
      return this.rigidBody.translation();
    } catch (_) {
      return this.pos;
    }
  }

  getRotation() {
    return this.rigidBody.rotation();
  }

  getLinvel() {
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

  getRestitution() {
    return this.collider.restitution();
  }

  getCCD() {
    return this.rigidBody.isCcdEnabled();
  }

  isSleeping() {
    return this.rigidBody.isSleeping();
  }

  setBodyType(bodyTypeStr) {
    let bodyType;
    if (bodyTypeStr === "dynamic") {
      bodyType = RAPIER.RigidBodyType.Dynamic;
      console.log("b");
    } else if (bodyTypeStr === "fixed") {
      bodyType = RAPIER.RigidBodyType.Fixed;
      console.log("a");
    }
    if (bodyType) {
      this.rigidBody.setBodyType(bodyType);
    }
  }

  setTranslation({ x, y }) {
    this.rigidBody.setTranslation({ x, y });
  }

  setLinvel({ x, y }) {
    this.rigidBody.setLinvel({ x, y });
  }

  setMass(mass) {
    this.rigidBody.setAdditionalMass(mass);
  }

  setRestitution(restitution) {
    this.collider.setRestitution(restitution);
  }

  setCCD(ccd) {
    this.rigidBody.enableCcd(ccd);
  }

  setSleeping(sleeping) {
    sleeping ? this.rigidBody.sleep() : this.rigidBody.wakeUp();
  }
}

export class BallPhy extends ObjectPhysics { r: any;
  constructor(sim, props) {
    super(sim, props);
    const { r = 0 } = props;
    this.r = r;
  }

  createCollider() {
    // colliders define space
    const colliderDesc = super
      .createCollider()
      .ball(this.r)
      .setRestitution(this.restitution)
      .setDensity(this.density)
      .setFriction(this.friction);
    return colliderDesc;
  }

  getRadius() {
    return this.collider.shape.radius;
  }

  setRadius(r) {
    this.collider.setShape(new RAPIER.Ball(r));
  }
}

export class RectPhy extends ObjectPhysics { w: any; h: any;
  constructor(sim, props) {
    super(sim, props);
    const { w = 0, h = 0 } = props;
    this.w = w;
    this.h = h;
  }

  createCollider() {
    // colliders define space
    const colliderDesc = super
      .createCollider()
      .cuboid(this.w / 2, this.h / 2)
      .setRestitution(this.restitution)
      .setDensity(this.density)
      .setFriction(this.friction);
    return colliderDesc;
  }

  getWidth() {
    return this.collider.shape.halfExtents.x * 2;
  }

  getHeight() {
    return this.collider.shape.halfExtents.y * 2;
  }

  setWidth(w) {
    this.collider.setShape(new RAPIER.Cuboid(w / 2, this.getHeight() / 2));
  }

  setHeight(h) {
    this.collider.setShape(new RAPIER.Cuboid(this.getWidth() / 2, h / 2));
  }
}
