import { ObjectsInterface } from './objectsInterface.js';
import Tools from './tools.js';

import("./objects.js").then((Objects) => {
    console.log("begin")
    const startStopButton = document.getElementById('start-stop-button');
    const playPauseButton = document.getElementById('play-pause-button');
    const stepButton = document.getElementById('step-button');

    const simulationProps = {
        timeStep: 1.0 / 500.0,
        // gravity: { x: 0, y: -9.8100000 },
        gravity: { x: 0, y: 0 },
    }
    const canvasProps = {
        backgroundColor: "grey",
    }
    const objects = new Objects(simulationProps, canvasProps);

    document.body.appendChild(objects.view);


    var start = false;
    startStopButton.onclick = () => {
        if (start) {
            pause();
            console.log("Simulation stopped at", objects.simulation.simulationTime.toFixed(3) + "s");
            objects.stop();
        } else {
            console.log("Simulation started at", objects.simulation.simulationTime.toFixed(3) + "s");
            objects.start();
        }
        startStopButton.style.backgroundColor = start ? '#00ff00' : '#ff0000';
        startStopButton.style.color = start ? 'black' : 'white';
        startStopButton.innerText = start ? 'start' : 'stop';
        playPauseButton.style.display = start ? 'none' : 'inline-block';
        stepButton.style.display = start ? 'none' : 'inline-block';
        stepButton.style.display = start ? 'none' : 'inline-block';
        start = !start;
    };

    var isPlaying = false;
    function pause() {
        isPlaying = false;
        console.log("Pause >>\n  time:", objects.simulation.simulationTime.toFixed(3) + "s");
        playPauseButton.innerText = 'play';
        stepButton.style.display = 'inline-block';
        objects.pause();
    }
    function play() {
        isPlaying = true;
        console.log("Play >>\n  time:", objects.simulation.simulationTime.toFixed(3) + "s");
        playPauseButton.innerText = 'pause';
        stepButton.style.display = 'none';
        objects.play();
    }
    playPauseButton.onclick = () => {
        isPlaying ? pause() : play();
    };

    let downTime;
    let hasClicked;
    let stepInterval;

    let stepFunction;

    stepButton.onmousedown = () => {
        hasClicked = false;
        downTime = setTimeout(() => {
            hasClicked = true;
            stepInterval = setInterval(() => {
                for (let i = 0; i < 10; i++) {
                    objects.step();
                    stepFunction();
                }
            }, 1);
        }, 500);
        document.onmouseup = () => {
            clearInterval(stepInterval);
            if (!hasClicked) {
                clearTimeout(downTime);
                stepFunction();

                objects.step();
            }
            document.onmouseup = null;
        };
    };


    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* params:
    * r / w / h
    * pos
    * color
    * mass
    * density
    * restitution
    * friction
    * rigidBody
    * velocityVec
    * v
    * a
    * canSleep
    * ccd

    */

    const interfaceProps = {
        s: 100,
    }
    const OI = new ObjectsInterface(objects, interfaceProps);

    const t = new Tools(objects, OI);

    document.addEventListener("keypress", function(event) {
        let mass = 1;
        let v = {x: 0, y: -4};
        switch (event.key) {
            case "m":
                mass = 1;
                v = {x: 0, y: 0};
                t.createSimpleBallFromGlobalPos({ pos: OI.mousePos, mass, v });
                break;
            case "b":
                objects.stopAll();
                break;
            case "n":
                for (let i = 0; i < 30; i++) {
                    mass = 1;
                    v = {x: -3, y: 0};

                    t.createSimpleBallFromGlobalPos({pos: { x: OI.mousePos.x, y: OI.mousePos.y + i * 23 } , mass, v });
                }
                break;
            case 'd':
                OI.removeFromGlobalPos(OI.mousePos);
                break;
        }

        for (let i = 0; i < 1; i++) {

        }
    });

    // create here

    // createFixedBox(0.1, 2, 2, {x: 0, y: 0});
    // t.createFixedBox(0.2, 3, 10, {x: 0, y: 0});

    // t.createSimpleBall({ pos: { x: 0, y: 2 }, v: { x: 0, y: 0.1 } });

    // Newton's cradle
    // t.createSimpleBall({ pos: { x: -0.7, y: 0.3 }, v: { x: 3, y: 0 }, mass: 0.1 });

    // for (let i = 0; i < 10; i++) {
    //     for (let j = 0; j < 1; j++) {
    //         let pos = { x: -0.5 + i * 0.21, y: 0.3 + j * 0.12 }
    //         t.createSimpleBall({ pos, v: { x: 0.1, y: 0 }, mass: 0.1 * (i+1)});
    //     }
    // }


    let ball1 = t.createSimpleBall({ pos: { x: -0.16, y: 0.1 }, v: { x: -1.2, y: 0 }, mass: 1, r: 0.1});
    let ball2 = t.createSimpleBall({ pos: { x: 0.08, y: 0.1 }, v: { x: 0.6, y: 0 }, mass: 2, r: 0.14});

    let container_wall_mass = 1
    let container_left = objects.createRect({
        pos: { x: -1, y: 0.1 },
        w: 0.2,
        h: 1,
        color: 0xff0000,
        mass: container_wall_mass,
        restitution: 1,
        rigidBody: "dynamic",
        canSleep: false,
        ccd: true,
        v: { x: 0, y: 0 }
    });
    let container_right = objects.createRect({
        pos: { x: 1, y: 0.1 },
        w: 0.2,
        h: 1,
        color: 0xff0000,
        mass: container_wall_mass,
        restitution: 1,
        rigidBody: "dynamic",
        canSleep: false,
        ccd: true,
        v: { x: 0, y: 0 }
    });

    container_left.addVector("v", { expr: "v", color: 0x00ff, showId: true, showMag: true });
    container_left.addVector("v", { expr: "v * m", color: 0x00ff00});

    container_left.put();
    container_right.put();


    let jointParams = objects.simulation.createJointParams({ x: 1, y: 0.1 }, 0.0, { x: -1, y: 0.1 }, 0.0);

    objects.simulation.rapierSim.createImpulseJoint(jointParams, container_left.physicsObj.rigidBody, container_right.physicsObj.rigidBody, true);


    let ground = objects.createRect({
        pos: { x: 0.2, y: -0.5 },
        w: 200,
        h: 1,
        color: 0xff0000,
        mass: 1,
        restitution: 1,
        ccd: true,
        rigidBody: "fixed",
    });

    // ground.put();
    let point;
    stepFunction = () => {
        let CM = t.calculateCenterOfMass([container_left, ball1, ball2,container_right]);
        // console.log(CM)
        if (point) {
            objects.canvas.remove(point);
        }
        point = objects.canvas.drawPoint(CM, 0x00ff00);
        console.log(t.calculateTotalMomentum([container_left, ball1, ball2]));
    }
});
