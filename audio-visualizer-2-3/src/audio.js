// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, distortionNode,delayNode, 
compressionNode, gainNode, panNode;

let nodesEnabled = [false,false,false];

let nodes = [distortionNode,delayNode,compressionNode];


// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: 0.5,
    numSamples: 256,
    curve: 0,
    oversample: 'none',
    delaySecs: 0.1

});

let audioData = new Uint8Array(128);

// load in defaults from file
//let jsonDefaults = loadJsonFetch("./media/settings.json", )

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
    nodes[0] = audioCtx.createWaveShaper();
    nodes[0].curve = makeDistortionCurve(DEFAULTS.curve)
    nodes[0].oversample = DEFAULTS.oversample;
    nodes[1] = audioCtx.createDelay(DEFAULTS.delaySecs);
    panNode = audioCtx.createStereoPanner();
    nodes[2] = audioCtx.createDynamicsCompressor();
    nodes[2].threshold.setValueAtTime(-50,audioCtx.currentTime);
    nodes[2].knee.setValueAtTime(50,audioCtx.currentTime);
    //node connections
    sourceNode.connect(analyserNode);

    analyserNode.connect(panNode);
    panNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    distortionNode = nodes[0];
    delayNode = nodes[1];
    compressionNode = nodes[2];
}

function addNodeToChain(value)
{
    if (nodesEnabled[value] == false)
    {
        nodesEnabled[value] = true;
        let prevConnection = sourceNode;
        sourceNode.disconnect();
        for (let i = 0; i < 3; i++)
        {
            if (nodesEnabled[i] == true)
            {
                prevConnection.connect(nodes[i]);
                prevConnection = nodes[i];
                prevConnection.disconnect();
            }
        }
        prevConnection.connect(analyserNode);
        
    }
}

function removeNodeFromChain(value)
{
    if (nodesEnabled[value] == true)
    {
        nodesEnabled[value] = false;
        let prevConnection = sourceNode;
        sourceNode.disconnect();
        for (let i = 0; i < 3; i++)
        {
            if (nodesEnabled[i] == true)
            {
                prevConnection.connect(nodes[i]);
                prevConnection = nodes[i];
                prevConnection.disconnect();
            }
        }
        prevConnection.connect(analyserNode);
        
    }

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
    if (gainNode != undefined)
    {
        gainNode.gain.value = value;
    }
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
    distortionNode.curve = makeDistortionCurve(value)
}

function setOversample(value)
{
    distortionNode.oversample = value;
}

//delay
function setDelay(value)
{
    value = Number(value);
    delayNode.delayTime.setValueAtTime(value,audioCtx.currentTime);
}

//pan
function setPan (value)
{
    panNode.pan.setValueAtTime(value, audioCtx.currentTime);
}

//compression

function setRatio (value)
{
    compressionNode.ratio.setValueAtTime(value, audioCtx.currentTime);
}
function setAttack (value)
{
    compressionNode.attack.setValueAtTime(value, audioCtx.currentTime);
}
function setDecay (value)
{
    compressionNode.release.setValueAtTime(value, audioCtx.currentTime);
}

// data exports for visualization
function getVolume() 
{
    return gainNode.gain.value;
}
function getPan() {
    return panNode.pan.value;
}

export {audioCtx, setupWebAudio, playCurrentSound, pauseCurrentSound, loadSoundFile, 
    setVolume, setOversample, setDelay, updateDistortionCurve, setPan, setRatio, 
    setAttack, setDecay, getVolume, removeNodeFromChain, addNodeToChain, getPan, analyserNode};
