// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: 0.5,
    numSamples: 256
});


let audioData = new Uint8Array(DEFAULTS.numSamples/2);

function setupWebAudio(filePath) {

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    element = new Audio();

    loadSoundFile(filePath);

    //sourceNode = audioCtx.createMediaElementSource(getLocalStream());

    sourceNode = audioCtx.createMediaElementSource(element);

    analyserNode = audioCtx.createAnalyser();

    analyserNode.fftSize = DEFAULTS.numSamples;
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

function loadSoundFile(filePath) {
    element.src = filePath;
}

function playCurrentSound() {
    element.play();
}

function pauseCurrentSound() {
    element.pause();
}

function setVolume(value) {
    value = Number(value);  // validate input
    gainNode.gain.value = value;
}

function getLocalStream() {
    navigator.mediaDevices.getUserMedia({video: false, audio: true}).then((stream) => {
       // window.localStream = stream;
       // window.localAudio.srcObject = stream;
       // window.localAudio.autoplay = true;
       //sourceNode = audioCtx.createMediaElementSource(stream);
       return stream;
    }).catch((err) => {
        console.error(`you got an error: ${err}`)
    });
}

export {audioCtx, setupWebAudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, analyserNode};