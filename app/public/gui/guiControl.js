import { objects, L } from "./gui.js"

const startStopButton = document.getElementById('start-stop-button');
const playPauseButton = document.getElementById('play-pause-button');
const stepButton = document.getElementById('step-button');
const guiEdit = document.getElementById('edit');

// startStop

let hasStarted = false;
let isPlaying = false;

const startCallback = () => {
    Object.assign(startStopButton.style, {
        backgroundColor: '#ff0000',
        color: 'white',
    })
    startStopButton.innerText = 'stop';
    playPauseButton.style.display = 'inline-block';
    stepButton.style.display = 'inline-block';

    guiEdit.style.display = 'block';
}

const stopCallback = () => {
    Object.assign(startStopButton.style, {
        backgroundColor: '#00ff00',
        color: 'black',
    })
    startStopButton.innerText = 'start';
    playPauseButton.style.display = 'none';
    stepButton.style.display = 'none';
    playPauseButton.innerText = 'play';

    guiEdit.style.display = 'none';
}

function start() {
    L.log(start);
    objects.start();
    startCallback();
}

function stop() {
    L.log(stop);
    objects.stop();
    stopCallback();
    isPlaying = false;
}

startStopButton.onclick = () => {
    hasStarted ? stop() : start();
    hasStarted = !hasStarted;
}


// play/pause button

const playCallback = () => {
    playPauseButton.innerText = 'pause';
    stepButton.style.display = 'none';
}

const pauseCallback = () => {
    playPauseButton.innerText = 'play';
    stepButton.style.display = 'inline-block';
}

function pause() {
    L.log(pause);
    objects.pause();
    pauseCallback();
}

function play() {
    L.log(play);
    objects.play();
    playCallback();
}

playPauseButton.onclick = () => {
    isPlaying ? pause() : play();
    isPlaying = !isPlaying;
}


// step button
const STEP_RATE = 10 // per ms
const stepCallback = () => {};

let holdTimer;
let stepInterval;

function singleStep() {
    L.log(singleStep)
    objects.step();
    stepCallback();
}

function repeatedSteps() {
    L.log(repeatedSteps)
    stepInterval = setInterval(() => {
        for (let i = 0; i < STEP_RATE; i++) {
            objects.step();
            stepCallback();
        }
    }, 1);
}

function stopRepeatedSteps() {
    L.log(stopRepeatedSteps)
    clearInterval(stepInterval);
}

stepButton.onmousedown = () => {
    let held = false;
    holdTimer = setTimeout(() => {
        held = true;
        repeatedSteps();        // hold action
    }, 500);
    document.onmouseup = () => {
        if (held) {            // click action
            stopRepeatedSteps();
        } else {                    // stop hold action
            clearTimeout(holdTimer);
            singleStep();
        }
        document.onmouseup = null;
    };
}
