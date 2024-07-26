// all the essentials

const gui = document.getElementById("gui");
import ObjectsInterface from "../api/objectsInterface.js"
import Tools from "../api/tools.js"
import Logger from "./guiLogger.js"

let Objects = await import("../api/objects.js");


const simulationProps = {
    timeStep: 1.0 / 500.0,
    // gravity: { x: 0, y: -9.8100000 },
    gravity: { x: 0, y: 0 },
}

const canvasProps = {
    backgroundColor: "#9999bb",
}

function newInstance(element, simulationProps, canvasProps) {
    const objects = new Objects(simulationProps, canvasProps);
    element.appendChild(objects.view);
    return objects
}
const objects = newInstance(gui, simulationProps, canvasProps);


// TODO: make s input to canvasProps
const OIProps = { s: 100 }
const OI = new ObjectsInterface(objects, OIProps)


const T = new Tools(objects);

const L = new Logger();

export { objects, OI, T, L }