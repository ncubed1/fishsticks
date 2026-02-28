// import Logger from "./guiLogger.js"
// import { initializeWasm } from "../../public/uiFunctions.js";

// import {, Objects, Tools} from 'api';
import { ObjectsInterface, Objects, Listener } from 'api';


const simulationProps = {
    timeStep: 1.0 / 500.0,
    // gravity: { x: 0, y: -9.8100000 },
    gravity: { x: 0, y: 0 },
}

const canvasProps = {
    // backgroundColor: "cadetblue",
    // backgroundColor: "gainsboro",
    // backgroundColor: "teal",
    // backgroundColor: "thistle",
    // backgroundColor: "steelblue",
    backgroundColor: "ghostwhite",
}

export let objects;
export let OI;
export let listener;

export const init = (guiElement) => {
    if (!listener && guiElement) {
        listener = new Listener(guiElement);
        objects = new Objects(simulationProps, canvasProps);
        (async () => {
            await objects.init()
            OI = new ObjectsInterface(objects, {})
            guiElement.appendChild(objects.view);
        })();
    }
};



// const OIProps = { s: 100 }
// const OI = new ObjectsInterface(objects, OIProps)

// const T = new Tools(objects);

// const L = new Logger();

// export { OI, T, L }
