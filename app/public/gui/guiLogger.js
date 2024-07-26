import { objects } from "./gui.js"

class Logger {
    constructor() {}

    log(func) {
        console.log(`${func.name.padEnd(20, ' ')} @ ${objects.simulation.simulationTime.toFixed(3)}s`);
    }
}

export default Logger;