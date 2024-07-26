import { objects, OI, T, L } from "./gui.js"

const ALLOWED_KEYS_SINGLE = 'abcdefghijklmnopqrstuvwxyz-=1234567890';
let allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
allowedKeys.push(...ALLOWED_KEYS_SINGLE.split(''));
const ALLOWED_KEYS = allowedKeys;

const inputLine = document.getElementById('input-line');

let cmdHistory = ['create here ball -r 5'];
let cmdHistoryPos = 0; // pos from the end
document.addEventListener("keydown", function(event) {
    let key = event.key
    if (ALLOWED_KEYS.includes(key)) {
        if (window.getComputedStyle(inputLine, null).display == "none") {
            inputLine.style.display = "block";
        }
        inputLine.focus();

        if (key == "ArrowUp") {
            cmdHistoryPos = (cmdHistoryPos < cmdHistory.length) ? cmdHistoryPos += 1 : cmdHistory.length;
            console.log(cmdHistoryPos);
            inputLine.value = cmdHistory[cmdHistory.length - cmdHistoryPos];
        } else if (key == "ArrowDown") {
            cmdHistoryPos = (cmdHistoryPos > 0) ? cmdHistoryPos - 1 : 0;
            inputLine.value = (cmdHistoryPos == 0) ? '' : cmdHistory[cmdHistory.length - cmdHistoryPos];
        }

    } else if (key == "Enter") {
        if (window.getComputedStyle(inputLine, null).display == "block") {
            inputLine.style.display = "none";
            cmdHistoryPos = 0;
            let cmd = new Command(inputLine.value);
            cmd.exec();
            cmdHistory.push(inputLine.value)
            inputLine.value = '';
        }
    }
});


// commands:
// create|c here|x,y ball|rect [props]
// remove|r here|x,y

class Command {
    constructor(commandString) {
        console.log(commandString);
        this.optionalArgs = {}

        const optionalArgsRegex = /-(\w+)\s+([\w#]+)/g;

        let optionalMatch;
        let modifiedCommandString = commandString;

        while ((optionalMatch = optionalArgsRegex.exec(commandString)) !== null) {
            this.optionalArgs[optionalMatch[1]] = optionalMatch[2];
            console.log(this.optionalArgs)
            let regex = new RegExp(`\\s*-${optionalMatch[1]}\\s+${optionalMatch[2]}\\s*`, 'g');
            modifiedCommandString = modifiedCommandString.replace(regex,'');
            console.log(modifiedCommandString)
        }
    // const propsString = match[3].trim();
    // const propsRegex = /-(\w+)\s+([\w#]+)/g;
    // let propMatch;

    // while ((propMatch = propsRegex.exec(propsString)) !== null) {
    //     result.props[propMatch[1]] = propMatch[2];
    // }

        this.args = commandString.match(/[\w,]+/g) || [];

        this.action = this.args[0];

        this.args = this.args.slice(1); // remove action word
    }

    exec() {
        switch (this.action) {
            case 'create':
            case 'c':
                this.create();
                break;
            case 'remove':
            case 'r':
                this.remove();
                break;
            default:
                console.log("Invalid action")
        }
    }

    create() {
        L.log(this.create);
        let props = this.optionalArgs;
        let pos = this.posParse(this.args[0])
        let objectShape = this.args[1];
        props.pos = pos;

        let object;
        switch (objectShape) {
            case 'ball':
                object = objects.createBall(props)
                break;
            case 'rect':
                object = objects.createRect(props)
                break;
            default:
                console.log("Invalid shape")
        }
        object.put();

    }

    remove() {
        L.log(this.remove);
        let pos = this.posParse(this.args[0])
        objects.removeFromPos(pos);
    }

    posParse(pos) {
        if (pos == 'here') return OI.global2m(T.mousePos);
        else {
            try {
                const [x, y] = pos.split(',').map(Number);
                return { x, y };
            } catch {
                console.log("Invalid position")
            }
        }
    }
}

// function executeCommand(command) {

//     let action = cmdActionParse(command);

//     if (command.startsWith(action)) {
//         command = command.substring(action.length).trim();
//     }

//     let result;
//     console.log(action);
//     console.log(command);
//     switch (action) {
//         case 'create':
//         case 'c':
//             result = cmdCreateParse(command);
//             cmdCreateExec(result);
//             break;
//         case 'remove':
//         case 'r':
//             result = cmdRemoveParse(command);
//             cmdRemoveExec(result);
//             break;
//         default:
//             console.log("Invalid action")
//     }
// }

// function cmdActionParse(command) {
//     const regex = /^\w+/;

//     let match = command.match(regex);
//     if (!match) {
//         console.error("Invalid command format");
//         return null;
//     }

//     let action = match[0];

//     return action
// }

// function cmdCreateParse(command) {
//     const result = {
//         pos: {},
//         objectShape: '',
//         props: {}
//     };

//     const regex = /^([\w,]+)\s+(\w+)(.*)$/;
//     const match = command.match(regex);

//     if (!match) {
//         console.error("Invalid command format");
//         return null;
//     }

//     // pos
//     let posString = match[1];

//     if (posString == 'here') result.pos = OI.global2m(t.mousePos);
//     else result.pos = posParse(posString);

//     // shape
//     result.objectShape = match[2];

//     // props
//     const propsString = match[3].trim();
//     const propsRegex = /-(\w+)\s+([\w#]+)/g;
//     let propMatch;

//     while ((propMatch = propsRegex.exec(propsString)) !== null) {
//         result.props[propMatch[1]] = propMatch[2];
//     }

//     return result
// }

// function cmdCreateExec({ pos, objectShape, props }) {
//     props.pos = pos

//     let object;
//     switch (objectShape) {
//         case 'ball':
//             object = objects.createBall(props)
//             break;
//         case 'rect':
//             object = objects.createRect(props)
//             break;
//         default:
//             console.log("Invalid shape")
//     }
//     object.put();
// }


// function cmdRemoveParse(command) {
//     let result = {
//         pos: {},
//     }

//     let regex = /^([\w,]+)/
//     const match = command.match(regex);

//     if (!match) {
//         console.error("Invalid command format");
//         return null;
//     }

//     // pos
//     let posString = match[1];

//     if (posString == 'here') result.pos == OI.global2m(t.mousePos);
//     else result.pos = posParse(posString);

//     return result
// }

// function cmdRemoveExec({ pos }) {
//     objects.removeFromPos(pos)

// }



// TODO: error handling