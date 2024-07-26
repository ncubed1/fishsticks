import { objects, L } from "./gui.js"

const createButton = document.getElementById('create-button');

const simpleProps = {
    pos: { x: 0, y: 0 },
    r: 0.1,
    color: 0xff0000,
    mass: 1,
    restitution: 1,
    rigidBody: "dynamic",
    canSleep: false,
    ccd: true,
    v: { x: 0, y: 0 }
}

createButton.onclick = () => {
    let ball = objects.createBall(simpleProps);
    ball.put();
}
