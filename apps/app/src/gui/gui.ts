// all the essentials
// import ObjectsInterface from "../../../api/src/objectsInterface.js/index.js"
// import Tools from "../../../api/src/tools.js"
import Logger from "./guiLogger.js"
// import { initializeWasm } from "../../public/uiFunctions.js";

import {ObjectsInterface, Objects, Tools} from 'api';
const gui = document.getElementById("gui");

// let Objects = await import("../../../api/src/objects.js/index.js");


const simulationProps = {
    timeStep: 1.0 / 500.0,
    // gravity: { x: 0, y: -9.8100000 },
    gravity: { x: 0, y: 0 },
}

const canvasProps = {
    backgroundColor: "#9999bb",
}

export const objects = new Objects(simulationProps, canvasProps);
export function newInstance(element, simulationProps, canvasProps) {

    element.appendChild(objects.view);
    return objects
}


// (async () => {
//     const { greet } = await initializeWasm();
//     greet();
// })();

// TODO: make s input to canvasProps
const OIProps = { s: 100 }
const OI = new ObjectsInterface(objects, OIProps)

const T = new Tools(objects);

const L = new Logger();

export { OI, T, L };
