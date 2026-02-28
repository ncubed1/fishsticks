// api for object management

import { Canvas, BallG, RectG } from "./graphics.js";
import Vectors from "./vectors.js";
import { ewResize } from "./panZoom.js";

import { Simulation, BallPhy, RectPhy } from "./physics.js";

const s = 100;

function m2pos(pos) {
  let x = pos.x * s;
  let y = -pos.y * s;
  return { x, y };
}

export default class Objects {canvas: any; graphicsObj: any; mainLoop: any; objects: any; objectsPut: any; objectsRemove: any; physicsObj: any; props: any; sim: any; simulation: any; speed: any; tickerFunc: any; timeStep: any; totalPausedTime: any; vectors: any; view: any;
















  constructor(simulationProps, canvasProps) {
    const { timeStep = 1 / 60 } = simulationProps;
    this.timeStep = timeStep;

    this.speed = 1;

    this.objects = [];

    this.timeStep = timeStep;
    this.totalPausedTime = 0;
    this.mainLoop;

    canvasProps.s = s;

    this.canvas = new Canvas(canvasProps);
    this.view = this.canvas.view;

    this.simulation = new Simulation(simulationProps);
    this.simulation.init();

    this.tickerFunc = () => {
      this.objects.forEach((obj) => {
        obj.vectors.updateVectorsScale();
      });
    };
  }

  async init() {
    await this.canvas.init();
    ewResize(this.view, 0.002, (e, factor) => {
      if (e.ctrlKey) {
        this.view.style.cursor = "ew-resize";
        this.changeAllVectorsRelativeScale(factor);
      }
    });
  }

  moveCanvasBy({ x: dx, y: dy }) {
    const { x, y } = this.canvas.getCanvasPosition();
    this.canvas.moveCanvas({ x: x + dx, y: y + dy });
    this.canvas.updateCanvas();
  }

  multiplyCanvasScale({ mulX, mulY }) {
    const { x, y } = this.canvas.getCanvasScale();
    this.canvas.scaleCanvas({ x: x * mulX, y: y * mulY });
    this.canvas.updateCanvas();
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
      let timeElapsed =
        startElapsedTime -
        this.totalPausedTime -
        this.simulation.simulationTime;
      for (let i = 0; i < timeElapsed / this.timeStep; i++) {
        this.step();
      }
    }, 1000.0 * this.timeStep);
  }

  setSpeed(speed) {
    this.speed = speed;
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
    this.objects.forEach((obj) => {
      obj.updatePosition();
      obj.updateRotation();
      obj.updateVectors();
    });

    this.simulation.simulationTime += this.timeStep;
  }

  updateColliders() {
    this.simulation.updateColliders();
  }

  createBall(props) {
    return new Ball(this, props);
  }

  createRect(props) {
    return new Rect(this, props);
  }

  putObject(obj) {
    // add object to simulation
    this.objects.push(obj);
    obj.physicsObj.put();
    obj.graphicsObj.put();
  }

  removeObject(obj) {
    const index = this.objects.indexOf(obj);
    obj.physicsObj.removeRigidBody();
    obj.graphicsObj.remove();
    obj.removeAllVectors();
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }

  getObjectFromPos(pos) {
    let colliders = this.simulation.findCollidersFromPos(pos);
    let hit = null;
    for (let collider of colliders) {
      let rigidBody = collider.parent();
      let obj = this.objects.find(
        (obj) => obj.physicsObj.rigidBody === rigidBody,
      );
      if (obj) {
        hit = obj;
        break;
      }
    }
    return hit;
  }

  removeFromPos(pos) {
    let obj = this.getObjectFromPos(pos);
    this.removeObject(obj);
  }

  changeAllVectorsRelativeScale(scale) {
    this.objects.forEach((obj) => {
      obj.changeVectorsRelativeScale(scale);
      obj.updateVectorsRelativeScale();
    });
  }
}

class Object {canvas: any; graphicsObj: any; mainLoop: any; objects: any; objectsPut: any; objectsRemove: any; physicsObj: any; props: any; sim: any; simulation: any; speed: any; tickerFunc: any; timeStep: any; totalPausedTime: any; vectors: any; view: any;
















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
    this.graphicsObj.setPosition(m2pos(this.physicsObj.getTranslation()));
  }
  updateRotation() {
    this.graphicsObj.setRotation(this.physicsObj.getRotation() * s);
  }

  getRigidBodyType() {
    return this.physicsObj.getBodyType();
  }

  getPosition() {
    return this.physicsObj.getTranslation();
  }

  getMass() {
    return this.physicsObj.getMass();
  }

  getColor() {
    return this.graphicsObj.getColor();
  }

  getLinvel() {
    return this.physicsObj.getLinvel();
  }

  getRestitution() {
    return this.physicsObj.getRestitution();
  }

  getCCD() {
    return this.physicsObj.getCCD();
  }

  isSleeping() {
    return this.physicsObj.isSleeping();
  }

  setRigidBodyType(bodyType) {
    return this.physicsObj.setBodyType(bodyType);
  }

  setPosition(pos) {
    this.physicsObj.setTranslation(pos);
    this.graphicsObj.setPosition(m2pos(pos));
  }

  setMass(mass) {
    this.physicsObj.setMass(mass);
  }

  setColor(color) {
    this.graphicsObj.setColor(color);
  }

  setLinvel(vel) {
    this.physicsObj.setLinvel(vel);
  }

  setAngvel(vel) {
    this.physicsObj.setAngvel(vel);
  }

  setSleeping(canSleep) {
    this.physicsObj.setSleeping(canSleep);
  }

  setRestitution(restitution) {
    this.physicsObj.setRestitution(restitution);
  }

  setCCD(ccd) {
    this.physicsObj.setCCD(ccd);
  }

  select() {
    this.graphicsObj.drawBorder();
  }

  getBorderPoint(position) {
    return this.graphicsObj.getBorderPoint(m2pos(position));
  }

  deselect() {
    this.graphicsObj.clearBorder();
  }
}

class Ball extends Object {
  constructor(objects, props) {
    super(objects, props);
    this.physicsObj = new BallPhy(this.sim, this.props);
    this.graphicsObj = new BallG(this.canvas, this.props);
    this.vectors = new Vectors(this, objects.simulation, objects.canvas);
  }

  scale(borderPoint, scaleLength) {
    const { x, y } = this.getPosition();
    const r = this.getRadius();
    const { x: dx, y: dy } = { x: scaleLength.x, y: scaleLength.y };
    let newPos = { x, y };
    let newLength = r;
    let l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    let scaleVector;
    const angle = Math.atan2(dy, dx);
    let multiplier = 2.8;

    switch (borderPoint) {
      case "topLeft":
        scaleVector = l * Math.cos((Math.PI / 4) * 3 - angle);
        newLength += scaleVector / multiplier;
        newPos.x -= scaleVector / multiplier;
        newPos.y += scaleVector / multiplier;
        break;

      case "topRight":
        scaleVector = l * Math.cos(Math.PI / 4 - angle);
        // console.log((angle >= -Math.PI/4 && angle <= Math.PI/4*3) ? 1 : -1)
        newLength += scaleVector / multiplier;
        newPos.x += scaleVector / multiplier;
        newPos.y += scaleVector / multiplier;
        break;

      case "bottomLeft":
        scaleVector = l * Math.cos((-Math.PI / 4) * 3 - angle);
        newLength += scaleVector / multiplier;
        newPos.x -= scaleVector / multiplier;
        newPos.y -= scaleVector / multiplier;
        break;

      case "bottomRight":
        scaleVector = l * Math.cos(-Math.PI / 4 - angle);
        newLength += scaleVector / multiplier;
        newPos.x += scaleVector / multiplier;
        newPos.y -= scaleVector / multiplier;
        break;
    }
    if (newLength > 0.05 / this.canvas.pixiCanvas.scale.x) {
      this.setRadius(newLength);
      this.setPosition(newPos);
      this.graphicsObj.drawBorder();
    }
  }

  getRadius() {
    return this.physicsObj.getRadius();
  }

  setRadius(radius) {
    this.physicsObj.setRadius(radius);
    this.graphicsObj.setRadius(radius * s);
  }
}

class Rect extends Object {
  constructor(objects, props) {
    super(objects, props);
    this.physicsObj = new RectPhy(this.sim, this.props);
    this.graphicsObj = new RectG(this.canvas, this.props);
    this.vectors = new Vectors(this, objects.simulation, objects.canvas);
  }

  scale(borderPoint, scaleLength) {
    const { x, y } = this.getPosition();
    const w = this.getWidth();
    const h = this.getHeight();
    const { x: dx, y: dy } = { x: scaleLength.x, y: scaleLength.y };
    let newPos = { x, y };
    let newWidth = w;
    let newHeight = h;
    let multiplier = 2;
    console.log(dx, newWidth);

    switch (borderPoint) {
      case "topLeft":
        newWidth -= dx;
        newHeight += dy;
        break;

      case "topRight":
        newWidth += dx;
        newHeight += dy;
        break;

      case "bottomLeft":
        newWidth -= dx;
        newHeight -= dy;
        break;

      case "bottomRight":
        newWidth += dx;
        newHeight -= dy;
        break;
    }

    if (newWidth > 0.05 / this.canvas.pixiCanvas.scale.x) {
      newPos.x += dx / multiplier;
      this.setWidth(newWidth);
    }
    if (newHeight > 0.05 / this.canvas.pixiCanvas.scale.y) {
      newPos.y += dy / multiplier;
      this.setHeight(newHeight);
    }
    this.setPosition({ x: newPos.x, y: newPos.y });
    this.graphicsObj.drawBorder();
  }

  getWidth() {
    return this.physicsObj.getWidth();
  }

  getHeight() {
    return this.physicsObj.getHeight();
  }

  setWidth(w) {
    this.physicsObj.setWidth(w);
    this.graphicsObj.setWidth(w * s);
  }

  setHeight(h) {
    this.physicsObj.setHeight(h);
    this.graphicsObj.setHeight(h * s);
  }
}
