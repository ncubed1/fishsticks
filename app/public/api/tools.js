// performs various calculations and practical functions

class Tools {
    constructor(objects) {
        this.objects = objects;
        this.mousePos = {x: 0, y: 0};

        this.objects.view.addEventListener('mousemove', (e) => {
            let rect = e.target.getBoundingClientRect();
            this.mousePos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
        });
    }

    calculateTotalMomentum(objects) {
        let dynamicRigidBodies = objects.filter(obj => obj.physicsObj.rigidBody.isDynamic());

        let totalMomentumVec = { x: 0.0, y: 0.0 };
        dynamicRigidBodies.forEach(obj => {
            totalMomentumVec.x += Math.abs(obj.physicsObj.rigidBody.linvel().x * obj.physicsObj.rigidBody.mass());
            totalMomentumVec.y += Math.abs(obj.physicsObj.rigidBody.linvel().y * obj.physicsObj.rigidBody.mass());
        });
        return totalMomentumVec;
    }

    calculateTotalEnergy(objects) {
        let dynamicRigidBodies = objects.filter(obj => obj.physicsObj.rigidBody.isDynamic());
        let totalEnergy = 0;
        let gravity = 9.8100000;

        dynamicRigidBodies.forEach(obj => {
        let velocity = obj.physicsObj.linvel();
        let kineticEnergy = 0.5 * obj.physicsObj.rigidBody.mass() * (velocity.x ** 2 + velocity.y ** 2);

        let position = obj.physicsObj.translation();
        let potentialEnergy = obj.physicsObj.rigidBody.mass() * gravity * position.y;

        totalEnergy += kineticEnergy + potentialEnergy;
    });

    // console.log("total energy: ", totalEnergy);
        return totalEnergy;
    }

    calculateCenterOfMass(objects) {
        let dynamicRigidBodies = objects.filter(obj => obj.physicsObj.rigidBody.isDynamic());
        console.log(dynamicRigidBodies.length)
        let centerOfMass = { x: 0, y: 0 };
        let totalMass = 0;

        dynamicRigidBodies.forEach(obj => {
            let mass = obj.physicsObj.rigidBody.mass();
            let position = obj.physicsObj.translation();
            totalMass += mass;
            centerOfMass.x += mass * position.x;
            centerOfMass.y += mass * position.y;
        });
        centerOfMass.x /= totalMass;
        centerOfMass.y /= totalMass;
        return centerOfMass;

    }

    stopAll() {
        let dynamicRigidBodies = this.objects.objects.filter(obj => obj.physicsObj.rigidBody.isDynamic());
        dynamicRigidBodies.forEach(obj => {
            obj.physicsObj.rigidBody.setLinvel({ x: 0, y: 0 });
            obj.physicsObj.rigidBody.setAngvel(0);
        });
    }

}

export default Tools;