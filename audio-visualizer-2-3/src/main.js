import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

const drawParams = {
    showGradient    : true,
    showBars        : true,
    showCircles     : true,
    showNoise       : false,
    showInvert      : false,
    showEmboss      : false,
    showScope       : true
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "./media/adventure.mp3"
});

function init(){
	//console.log("init called");

    audio.setupWebAudio("./media/adventure.mp3");

	//console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);

    canvas.setupCanvas(canvasElement, audio.analyserNode);

    loop();
}

// sets up buttons and labels
function setupUI(canvasElement){
    const fsButton = document.querySelector("#fsButton");
    const playButton = document.querySelector("#play-button");
    let volumeSlider = document.querySelector("#volume-slider");
    let volumeLabel = document.querySelector("#volume-label");
    let trackSelect = document.querySelector("#track-select");
    let gradientCheckbox = document.querySelector("#chk-gradient");
    let barsCheckbox = document.querySelector("#chk-bars");
    let circlesCheckbox = document.querySelector("#chk-circles");
    let noiseCheckbox = document.querySelector("#chk-noise");
    let invertCheckbox = document.querySelector("#chk-invert");
    let embossCheckbox = document.querySelector("#chk-emboss");
    let scopeCheckbox = document.querySelector("#chk-scope");

    // visualizer toggles
    gradientCheckbox.checked = true;
    barsCheckbox.checked = true;
    circlesCheckbox.checked = true;
    noiseCheckbox.checked = false;
    invertCheckbox.checked = false;
    embossCheckbox.checked = false;
    scopeCheckbox.checked = true;

    // fullscreen
    fsButton.onclick = e => {
        console.log("init called");
        utils.goFullscreen(canvasElement);
    };
	// play/pause toggle button
    playButton.onclick = e => {
        //console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

        if (audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }
        //console.log(`audioCtx.state after = ${audio.audioCtx.state}`);

        if (e.target.dataset.playing == "no") {
            audio.playCurrentSound();
            e.target.dataset.playing = "yes";
        } else {
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no";
        }
    };
    // volume
    volumeSlider.oninput = e => {
        // set gain
        audio.setVolume(e.target.value);
        // update label
        volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
    };
    // value of volume label to match initial slider value
    volumeSlider.dispatchEvent(new Event("input"));
    // track selector
    trackSelect.onchange = e => {
        
        audio.loadSoundFile(e.target.value);
        // pause current track if playing
        if (playButton.dataset.playing == "yes") {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    }
    // toggle change events (for draw params)
    gradientCheckbox.onchange = e => {
        drawParams.showGradient = gradientCheckbox.checked;
    }
    barsCheckbox.onchange = e => {
        drawParams.showBars = barsCheckbox.checked;
    }
    circlesCheckbox.onchange = e => {
        drawParams.showCircles = circlesCheckbox.checked;
    }
    noiseCheckbox.onchange = e => {
        drawParams.showNoise = noiseCheckbox.checked;
    }
    invertCheckbox.onchange = e => {
        drawParams.showInvert = invertCheckbox.checked;
    }
    embossCheckbox.onchange = e => {
        drawParams.showEmboss = embossCheckbox.checked;
    }
}

// animation loop for visualizing audio
function loop(){
    requestAnimationFrame(loop);
        
    canvas.draw(drawParams, audio.analyserNode);
}

export {init};