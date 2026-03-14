// import Logger from "./guiLogger.js"
// import { initializeWasm } from "../../public/uiFunctions.js";

// import {, Objects, Tools} from 'api';
import { ObjectsInterface, Objects, Listener } from "api";

const simulationProps = {
  timeStep: 1.0 / 500.0,
  // gravity: { x: 0, y: -9.8100000 },
  gravity: { x: 0, y: 0 },
};

const canvasProps = {
  // backgroundColor: "cadetblue",
  // backgroundColor: "gainsboro",
  // backgroundColor: "teal",
  // backgroundColor: "thistle",
  // backgroundColor: "steelblue",
  backgroundColor: "ghostwhite",
};

export let objects: Objects | null = null;
export let OI: ObjectsInterface | null = null;
export let listener: Listener | null = null;
let initPromise: Promise<void> | null = null;

export const init = (guiElement) => {
  if (!guiElement) {
    return Promise.resolve();
  }

  if (initPromise) {
    return initPromise;
  }

  listener = new Listener(guiElement);
  objects = new Objects(simulationProps, canvasProps);

  initPromise = (async () => {
    await objects.init();
    OI = new ObjectsInterface(objects, {});
    if (!guiElement.contains(objects.view)) {
      guiElement.appendChild(objects.view);
    }
  })();

  return initPromise;
};

export const waitForCreatorReady = async () => {
  if (!initPromise) {
    return;
  }

  await initPromise;
};

// const OIProps = { s: 100 }
// const OI = new ObjectsInterface(objects, OIProps)

// const T = new Tools(objects);

// const L = new Logger();

// export { OI, T, L }
