import Script from "next/script";
import styles from "../styles/gui.css"

// TODO: move gui static files to react to use css modules

function Gui() {
    return(
        <div id="gui">
            <div id="control">
                <button id="start-stop-button" className="control-button">start</button>
                <button id="play-pause-button" className="control-button">play</button>
                <button id="step-button" className="control-button">step</button>
            </div>
            <div id="edit">
                <button id="create-button" className="edit-button">create</button>
                <textarea id="input-line" className="edit-input"></textarea>
            </div>
            <Script type="module" src="gui/gui.js"/>
            <Script type="module" src="gui/cli.js"/>
            <Script type="module" src="gui/guiControl.js"/>
            <Script type="module" src="gui/guiEdit.js"/>
        </div>
    )
}

export default Gui;