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

// taken from presets-demo
const loadJsonFetch = (url,callback) => {
    fetch(url)
        .then(response => {
            // If the response is successful, return the JSON
            if (response.ok) {
                return response.json();
            }

            // else throw an error that will be caught below
            return response.text().then(text =>{
                throw text;
            });
        }) // send the response.json() promise to the next .then()
        .then(json => { // the second promise is resolved, and `json` is a JSON object
            callback(json);
        }).catch(error => {
            // error
            console.log(error);
    });
};

function init(){
	//console.log("init called");

    audio.setupWebAudio("./media/adventure.mp3");

	//console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);

    canvas.setupCanvas(canvasElement, audio.analyserNode);

    loadJsonFetch("./media/settings.json", json => setDefaultsFromFile(json));

    loop();
}

// sets up buttons and labels
function setupUI(canvasElement){
    //Audio UI objects
    const fsButton = document.querySelector("#fsButton");
    const playButton = document.querySelector("#play-button");
    const fileInput = document.querySelector("#file-input");
    let volumeSlider = document.querySelector("#volume-slider");
    let volumeLabel = document.querySelector("#volume-label");
    let trackSelect = document.querySelector("#track-select");
    let delaySlider = document.querySelector("#delay-slider");
    let distSlider = document.querySelector("#dist-slider");
    let oversampling = document.querySelector("#dist-oversample");
    let pan = document.querySelector("#pan-slider");
    let ratio = document.querySelector("#ratio-slider");
    let attack = document.querySelector("#attack-slider");
    let decay = document.querySelector("#decay-slider");

    // Visual UI objects
    let gradientCheckbox = document.querySelector("#chk-gradient");
    let barsCheckbox = document.querySelector("#chk-bars");
    let circlesCheckbox = document.querySelector("#chk-circles");
    let noiseCheckbox = document.querySelector("#chk-noise");
    let invertCheckbox = document.querySelector("#chk-invert");
    let embossCheckbox = document.querySelector("#chk-emboss");
    let scopeCheckbox = document.querySelector("#chk-scope");

    // set visualizer toggles
    gradientCheckbox.checked = true;
    barsCheckbox.checked = true;
    circlesCheckbox.checked = true;
    noiseCheckbox.checked = false;
    invertCheckbox.checked = false;
    embossCheckbox.checked = false;
    scopeCheckbox.checked = true;

    //
    // UI EVENT FUNCTIONS
    //
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
    // track selector
    trackSelect.onchange = e => {
        
        audio.loadSoundFile(e.target.value);
        // pause current track if playing
        if (playButton.dataset.playing == "yes") {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    }
    // NOTE 1204 - Moss: I couldn't get user file upload working 
    // 1204: going to try again later using https://youtu.be/idhb45lc2xo?t=994
    // fileInput.onchange = e => {
        
    //     if (e.target.files[0] != undefined)
    //     {
    //         console.log(e.target.files[0].name);
    //         audio.loadSoundFile(e.target.files[0]);
    //         // pause current track if playing
    //         if (playButton.dataset.playing == "yes") {
    //             playButton.dispatchEvent(new MouseEvent("click"));
    //         }
    //         // add it to the dropdown
    //         let newFileOption = document.createElement("option");
    //         newFileOption.value = e.target.files[0].name;
    //         newFileOption.innerHTML = e.target.files[0];
    //         trackSelect.appendChild = newFileOption;
    //     }
    //     else {
    //         console.log("file you tried to load is undefined")
    //     }
        
    //     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
    //     // https://www.russellgood.com/process-uploaded-file-web-audio-api/
    // }

    //
    // AUDIO UI EVENT FUNCTIONS
    //
    // volume
    volumeSlider.oninput = e => {
        // set gain
        audio.setVolume(e.target.value);
        // update label
        volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
    };
    pan.oninput = e => {
        audio.setPan(e.target.value);
    }

    // update slider delay
    delaySlider.oninput = e => {
        audio.setDelay(e.target.value);
    }
    //update distortion curve
    distSlider.oninput = e => {
        audio.updateDistortionCurve(e.target.value);
    }
    //update oversampling
    oversampling.oninput = e => {
        audio.setOversample(e.target.value);
    }
    // value of volume label to match initial slider value
    volumeSlider.dispatchEvent(new Event("input"));
    


    //
    // VISUALIZER EVENT FUNCTIONS
    //
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

function setDefaultsFromFile(json) {
    //console.log("called");
    audio.setVolume(json.volume);
    audio.setOversample(json.oversample);
    audio.setDelay(json.delay);
    audio.setDecay(json.decay);
    audio.setAttack(json.attack);
    audio.setPan(json.pan);
    
    drawParams.showBars = json.bars;
    drawParams.showCircles = json.circles;
    drawParams.showNoise = json.noise;
    drawParams.showInvert = json.invert;
    drawParams.showGradient = json.gradient;
    drawParams.showScope = json.osciliscope;
}

export {init};