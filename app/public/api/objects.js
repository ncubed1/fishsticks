// api for object management

import { Canvas, BallG, RectG } from './graphics.js';
import { Vectors } from './vectors.js';
import { ewResize } from './panZoom.js';

export function then(resolve) {
    import('./physics.js').then(mod => {
        const { Simulation, BallPhy, RectPhy } = mod;

        class Objects {
            constructor(simulationProps, canvasProps) {
                const { timeStep = 1 / 60 } = simulationProps;
                this.timeStep = timeStep;
                this.canvas = new Canvas(canvasProps);
                this.simulation = new Simulation(simulationProps);
                this.view = this.canvas.app.view;
                this.objects = [];

                this.timeStep = timeStep;
                this.totalPausedTime = 0;
                this.mainLoop;

                this.tickerFunc = () => {
                    this.objects.forEach(obj => {
                        obj.vectors.updateVectorsScale();

                    })
                }

                ewResize(this.view, 0.002, (e, factor) => {
                    if (e.ctrlKey) {
                        this.view.style.cursor = "ew-resize";
                        this.changeAllVectorsRelativeScale(factor);
                    }
                });
            }

            start() {
                this.canvas.addTicker(this.tickerFunc);
                // this.canvas.start();
            }

            stop() {
                clearInterval(this.mainLoop);
                this.canvas.removeTicker(this.tickerFunc);
                // this.canvas.stop();
            }

            play() {
                let startTime = performance.now() / 1000.0;
                this.totalPausedTime = startTime - this.simulation.simulationTime;

                this.mainLoop = setInterval(() => {
                    let startElapsedTime = performance.now() / 1000.0;
                    while (startElapsedTime - this.simulation.simulationTime - this.totalPausedTime > this.timeStep) {
                        this.step();
                    }
                }, 1000.0 * this.timeStep);
            }

            pause() {
                clearInterval(this.mainLoop);
            }

            step() {
                // let dynamicRigidBody = this.objects.find(obj => obj.physicsObj.rigidBody.isDynamic());
                // let linvel = dynamicRigidBody.physicsObj.rigidBody.linvel();
                // if (linvel.y < 0.002 && linvel.y > -0.002) {
                //     console.log("max height: " + dynamicRigidBody.physicsObj.rigidBody.translation().y);
                // }
                // let tolerance = 0.00001;
                // if (Math.abs(totalMomentum.x.toFixed(3) - 2.000) > tolerance) {
                //     console.log("total momentum: ", totalMomentum);
                // }
                // let totalEnergy = this.calculateTotalEnergy();
                // if (Math.abs(totalEnergy.toFixed(4) - 45.) > tolerance) {
                    // console.log("total energy: ", totalEnergy);
                // }

                this.simulation.step();
                this.objects.forEach(obj => {
                    obj.updatePosition();
                    obj.updateRotation();
                    obj.updateVectors();
                });

                this.simulation.simulationTime += this.timeStep;
            }

            createBall(props) {
                return new Ball(this, props);
            }

            createRect(props) {
                return new Rect(this, props);
            }

            putObject(obj) { // add object to simulation
                this.objects.push(obj);
                obj.physicsObj.put();
                obj.graphicsObj.put();
            }

            removeObject(obj) {
                const index = this.objects.indexOf(obj);
                if (index !== -1) {
                    this.objects.splice(index, 1);
                }
                obj.physicsObj.removeRigidBody();
                obj.graphicsObj.remove();
                obj.removeAllVectors();
            }

            removeFromPos(pos) {
                let colliders = this.simulation.findCollidersFromPos(pos);
                colliders.forEach(collider => {
                    let rigidBody = collider.parent();
                    let obj = this.objects.find(obj => obj.physicsObj.rigidBody === rigidBody);
                    this.removeObject(obj);
                });
            }

            changeAllVectorsRelativeScale(scale) {
                this.objects.forEach(obj => {
                    obj.changeVectorsRelativeScale(scale);
                    obj.updateVectorsRelativeScale();
                });
            }
        }

        class Object {
            constructor(objects, props) {
                this.objectsPut = objects.putObject.bind(objects);
                this.objectsRemove = objects.removeObject.bind(objects);
                // this.objectsAddVector = objects.addVector.bind(objects);
                this.sim = objects.simulation;
                this.canvas = objects.canvas;
                this.props = props;
                this.physicsObj = null;
                this.graphicsObj = null;
            }

            put() {
                this.objectsPut(this);
            }

            remove() {
                this.objectsRemove(this);
            }

            addVector(id, vecProps) {
                let vec = this.vectors.createVector(id, vecProps);
                vec.put();
            }

            updateVectors() {
                this.vectors.updateVectors();
            }

            removeVector(vec) {
                vec.remove();
            }

            removeVectorsFromId(id) {
                this.vectors.removeVectorsFromId(id);
            }

            removeAllVectors() {
                this.vectors.removeAllVectors();
            }

            changeVectorsRelativeScale(scale) {
                this.vectors.changeRelativeScale(scale);
            }

            updateVectorsRelativeScale() {
                this.vectors.updateVectorsRelativeScale();
            }

            updatePosition() {
                this.graphicsObj.position(this.physicsObj.translation());
            }
            updateRotation() {
                this.graphicsObj.rotation(this.physicsObj.rotation());

            }
        }

        class Ball extends Object {
            constructor(objects, props) {
                super(objects, props);
                this.physicsObj = new BallPhy(this.sim, this.props);
                this.graphicsObj = new BallG(this.canvas, this.props);
                this.vectors = new Vectors(this, objects.simulation, objects.canvas);
            }
        }

        class Rect extends Object {
            constructor(objects, props) {
                super(objects, props)
                this.physicsObj = new RectPhy(this.sim, this.props);
                this.graphicsObj = new RectG(this.canvas, this.props);
                this.vectors = new Vectors(this, objects.simulation, objects.canvas);
            }
        }


        resolve(Objects)
    });
};