
import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

// have bowling alley carpet in bg

function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"orchid"},{percent:1,color:"salmon"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

function draw(params={}){
    analyserNode.getByteFrequencyData(audioData);
	
	ctx.save()
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
	
    //
    // TOGGLES
    // 
	if (params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0,0,canvasWidth, canvasHeight);
        ctx.restore();
    }
    if (params.showBars) {
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight = 200;
        let topSpacing = 100;

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.strokeStyle = 'rgba(0,0,0,0.50)';
        // loop through audio data and draw bars
        for (let i = 0; i < audioData.length; i++) {
            ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
        }
        ctx.restore();
    }
    if (params.showCircles) {
        let maxRadius = canvasHeight/4;
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < audioData.length; i++) {
            let percent = audioData[i] / 255;
            
            let circleRadius = percent * maxRadius;
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255, 0, 0, 0.34 - percent/3.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius*1.5, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();

            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(0, 0, 255, 0.10 - percent/10.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius*0.5, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.closePath();

            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(128, 128,0, 0.5 - percent/5.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius*0.5, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }

        

        ctx.restore();
    }
    if(params.showScope) {
        // oh silly scope
        osciliscope();
    }

    //
    // IMAGE DATA MANIP
    //
	let imageData = ctx.getImageData(0,0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
    for (let i = 0; i < length; i += 4) {
        if (params.showNoise && Math.random() < 0.1) {
	
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			// zero out the red and green and blue channels
            data[i] = data[i+1] = data[i+2] = 255;

		} 

        if (params.showInvert) {
            let red = data[i], green = data[i+1], blue = data[i+2];
            data[i] = 255 - red;
            data[i+1] = 255 - green;
            data[i+2] = 255 - blue;
        }

        
	} 
    if (params.showEmboss) {
        for (let i = 0; i < length; i++) {
            if (i%4 == 3) continue;
            data[i] = 127 + 2*data[i] - data[i+4] - data[i + width*4];
        }
    }
	// D) copy image data back to canvas
    ctx.putImageData(imageData,0,0);

}

// random color from canvas hw
function getRandomColor(){
    function getByte(){
        return 55 + Math.round(Math.random() * 200);
    }
    return "rgba(" + getByte() + "," + getByte() + "," + getByte() + ",.8)";
}
// canvas onclick
function canvasClicked(e){
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;
    console.log(mouseX,mouseY);
    for (let i = 0; i < 10; i++) {
        let x = getRandomInt(-50,50) + mouseX;
        let y = getRandomInt(-50,50) + mouseY;
        let radius = getRandomInt(5,45);
        let color = getRandomColor();
        drawArc(ctx,x,y,radius,0,(Math.PI * 2),color);
    }
}
// helper funcs
function drawRectangle(ctx, x, y, width, height, fillStyle="black", lineWidth=0, strokeStyle="black") {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();

    ctx.rect(x,y,width,height);
    ctx.fill();
    if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }

    ctx.closePath();
    ctx.restore();
}
function drawArc(ctx, x, y, radius, startAngle=0, endAngle=(Math.PI * 2), fillStyle="black", lineWidth=0, strokeStyle="black") {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();

    ctx.arc(x,y,radius,startAngle,endAngle,false);
    ctx.fill();
    if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }

    ctx.closePath();
    ctx.restore();
}
function drawLine(ctx, x1, y1, x2, y2, lineWidth=1, strokeStyle="black") {
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
// draw osciliscope
function osciliscope() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    let bufferLength = analyserNode.frequencyBinCount;
    analyserNode.getByteTimeDomainData(audioData);
    let slice = canvasWidth / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = audioData[i] / 128.0;
        const y = v * (canvasHeight / 2);
      
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      
        x += slice;
    }
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
}

export {setupCanvas,draw};