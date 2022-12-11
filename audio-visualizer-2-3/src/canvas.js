
import * as utils from './utils.js';
import {getVolume,getPan} from './audio.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

let circleColors, circles, circlesCreated;
let starColors, stars, starsCreated;

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

    circleColors = [utils.makeColor(247,37,133), utils.makeColor(114,9,183), utils.makeColor(58,12,163), utils.makeColor(67,97,238), utils.makeColor(76,201,240)];
    circles = [];
    circlesCreated = false;
    starColors = [utils.makeColor(255,190,11), utils.makeColor(251,86,7), utils.makeColor(255,0,110), utils.makeColor(131,56,236), utils.makeColor(58,134,255)];
    stars = [];
    starsCreated = false;

    // create circles for bowling alley carpet theme
    for (let i = 0; i < 37; i++) {
        // size (based on volume)
        let _size = Math.trunc((getVolume() * 100) / 2);
        // x and y location
        let _x = Math.trunc(utils.getRandom(0,canvasWidth));
        let _y = Math.trunc(utils.getRandom(0,canvasHeight));
        let fillColor = circleColors[Math.trunc(Math.random() * circleColors.length)];
        let strokeColor = circleColors[Math.trunc(Math.random() * circleColors.length)];
        let _velocity = [utils.getRandom(-1,1), utils.getRandom(-1,1)];

        //console.log(velocity);

        let c = {
            x: _x,
            y: _y,
            size: _size,
            fill: fillColor,
            stroke: strokeColor,
            velocity: _velocity
        }

        circles.push(c);
        //console.log(c);
        if (i == 36)
        {
            circlesCreated = true;
        }
    }
    // create stars for bowling alley carpet theme
    let aData = analyserNode.getByteFrequencyData(audioData);
    for (let i = 0; i < 31; i++) {
        //function drawStar(cx,cy,spikes,outerRadius,innerRadius)
        // x and y location
        let _x = Math.trunc(utils.getRandom(0,canvasWidth));
        let _y = Math.trunc(utils.getRandom(0,canvasHeight));
        let _inner = aData[i];
        let _outer = aData[i+3];
        let _spikes = 5;

        let s = {
            x: _x,
            y: _y,
            inner: _inner,
            outer: _outer,
            spikes: _spikes
        }

        stars.push(s);
        if (i == 30) {
            starsCreated = true;
        }
    }

}

function draw(params={}){
    analyserNode.getByteFrequencyData(audioData);
	
	ctx.save()
    ctx.fillStyle = "black";
    //ctx.globalAlpha = 0.1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
	
    // BOWLING CARPET THEME
    //
    // for stars: https://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
    if (circlesCreated) {
        for (let i = 0; i < 37; i++) {
            drawArc(
                ctx, 
                circles[i].x, 
                circles[i].y, 
                Math.trunc((getVolume() * 100) / 4),
                0,
                Math.PI*2,
                circles[i].fill,
                3,
                circles[i].stroke);
            // move circles
            circles[i].x += circles[i].velocity[0] + getPan();
            circles[i].y += circles[i].velocity[1];
            // circle bounding collision check
            let leftside = circles[i].x - Math.trunc((getVolume() * 100) / 4);
            let rightside = circles[i].x + Math.trunc((getVolume() * 100) / 4);
            let topside = circles[i].y - Math.trunc((getVolume() * 100) / 4);
            let downside = circles[i].y + Math.trunc((getVolume() * 100) / 4);
            
            if (leftside <= 0) {
                circles[i].velocity[0] = Math.abs(circles[i].velocity[0]);
            } else if (rightside >= canvasWidth) {
                circles[i].velocity[0] = -1 * Math.abs(circles[i].velocity[0]);
            }
            if (topside <= 0) {
                circles[i].velocity[1] = Math.abs(circles[i].velocity[1]);
            } else if (downside >= canvasHeight) {
                circles[i].velocity[1] = -1 * Math.abs(circles[i].velocity[1]);
            }
        }
    }
    if (starsCreated) {
        for (let i = 0; i < 31; i++) {

        }
    }

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
        ctx.fillStyle = utils.makeColor(247,37,133);
        ctx.strokeStyle = utils.makeColor(247,37,133);
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
            ctx.fillStyle = circleColors[0];
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius*1.5, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();

            ctx.beginPath();
            ctx.fillStyle = circleColors[1];
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius*1.0, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.closePath();

            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = circleColors[2];
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
        let x = utils.getRandom(-50,50) + mouseX;
        let y = utils.getRandom(-50,50) + mouseY;
        let radius = utils.getRandom(5,45);
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
    ctx.save();
    let bufferLength = analyserNode.frequencyBinCount;
    analyserNode.getByteTimeDomainData(audioData);
    let slice = canvasWidth / bufferLength;
    let x = 0;
    ctx.strokeStyle = utils.makeColor(5,255,251);

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
    ctx.restore();
}
function drawStar(cx,cy,spikes,outerRadius,innerRadius){
    ctx.save();
    var rot=Math.PI/2*3;
    var x=cx;
    var y=cy;
    var step=Math.PI/spikes;

    ctx.beginPath();
    ctx.moveTo(cx,cy-outerRadius)
    for(i=0;i<spikes;i++){
      x=cx+Math.cos(rot)*outerRadius;
      y=cy+Math.sin(rot)*outerRadius;
      ctx.lineTo(x,y)
      rot+=step

      x=cx+Math.cos(rot)*innerRadius;
      y=cy+Math.sin(rot)*innerRadius;
      ctx.lineTo(x,y)
      rot+=step
    }
    ctx.lineTo(cx,cy-outerRadius);
    ctx.closePath();
    ctx.lineWidth=5;
    ctx.strokeStyle='blue';
    ctx.stroke();
    ctx.fillStyle='skyblue';
    ctx.fill();

    ctx.restore();
  }


export {setupCanvas,draw};