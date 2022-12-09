// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, distortionNode, delayNode, compressionNode, panNode;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: 0.5,
    numSamples: 256,
    curve: 0,
    oversample: 'none',
    delaySecs: 0.1

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
    distortionNode = audioCtx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(DEFAULTS.curve)
    distortionNode.oversample = DEFAULTS.oversample;
    delayNode = audioCtx.createDelay(DEFAULTS.delaySecs);
    panNode = audioctx.createSteroPanner();
    compressionNode = audioCtx.createDynamicsCompressor();
    //node connections
    sourceNode.connect(distortionNode);
    distortionNode.connect(delayNode);
    delayNode.connect(compressionNode);
    compressionNode.connect(analyserNode);
    analyserNode.connect(panNode);
    panNode.connect(gainNode);
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

//gain
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

//distortion
function makeDistortionCurve(amount) 
{
    const k = typeof amount === "number" ? amount : 50;

    const sampleRate = 44100

    const curve = new Float32Array(sampleRate);
    const deg = Math.PI / 180;
  
    for (let i = 0; i < sampleRate; i++) {
      const x = (i * 2) / sampleRate - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function updateDistortionCurve(value)
{
    distortion.curve = makeDistortionCurve(value)
}

function setOversample(value)
{
    distortion.oversample = value;
}

//delay
function setDelay(value)
{
    value = Number(value);
    delay.delayTime.setValueAtTime(value,audioCtx.currentTime);
}

//pan
function setPan (value)
{
    panNode.pan.setValueAtTime(value, audioCtx.currentTime);
}

//compression
function setThreshold (value)
{
    compressionNode.threshold.setValueAtTime(value, audioCtx.currentTime);
}
function setKnee (value)
{
    compressionNode.knee.setValueAtTime(value, audioCtx.currentTime);
}
function setRatio (value)
{
    compressionNode.ratio.setValueAtTime(value, audioCtx.currentTime);
}
function setReduction (value)
{
    compressionNode.reduction.setValueAtTime(value, audioCtx.currentTime);
}
function setAttack (value)
{
    compressionNode.attack.setValueAtTime(value, audioCtx.currentTime);
}
function setDecay (value)
{
    compressionNode.release.setValueAtTime(value, audioCtx.currentTime);
}



export {audioCtx, setupWebAudio, playCurrentSound, pauseCurrentSound, loadSoundFile, 
    setVolume, setOversample, setDelay, updateDistortionCurve, setPan, analyserNode};