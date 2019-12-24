/*jshint esversion: 6 */

// Animation frame
var vendors = ['webkit', 'moz'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : Date.now()
}

// RNG
function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
}
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextUnitVal = function() {
  // returns in range [-1,1]
  return (this.nextInt() / (this.m - 1)) * 2 - 1;
}
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
}

// FPSCounter
class FPSCounter {
    constructor(updateFrequency) {
        this.accumTime = 0;
        this.fpsUpdateFrequency = updateFrequency;
        this.fps = 0;
        this.frameCount = 0;
    }
    
    update(deltaTime) {
        this.accumTime += deltaTime / gameState.options.simulation.tscale;
        this.frameCount++;
        
        if (this.accumTime >= this.fpsUpdateFrequency) {
            this.fps = this.frameCount / this.accumTime;
            this.frameCount = 0;
            this.accumTime = 0;
        }
    }
    
    render(cx) {
        renderText(cx, new Vector(10, 20), Math.round(this.fps) + " FPS");
    }
}

// COLORS
function rgb2hsl(color) {
    "use strict";
    var r = color[0] / 255;
    var g = color[1] / 255;
    var b = color[2] / 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return [h, s, l];
}

function hue2rgb(p, q, t) {
    "use strict";
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
}

function hsl2rgb(color) {
    "use strict";
  var l = color[2];

  if (color[1] === 0) {
    l = Math.round(l*255);
    return [l, l, l];
  } else {
      
    var s = color[1];
    var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
    var p = 2 * l - q;
    var r = hue2rgb(p, q, color[0] + 1/3);
    var g = hue2rgb(p, q, color[0]);
    var b = hue2rgb(p, q, color[0] - 1/3);
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }
}

function interpolateHSL(color1, color2, factor) {
    "use strict";
    
    if (arguments.length < 3) { factor = 0.5; }
    var hsl1 = rgb2hsl(color1);
    var hsl2 = rgb2hsl(color2);

    for (var i=0;i<3;i++) {
        hsl1[i] += factor*(hsl2[i]-hsl1[i]);
    }
    
    return hsl2rgb(hsl1);
}

// UTILS
function assert(condition, message) {
    "use strict";
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function clamp(val, min, max) {
    "use strict";
	return Math.min(Math.max(val, min), max);
}

function lerp(val1, val2, amount) {
    "use strict";
	return val1 + (val2 - val1) * amount;
}

// Render
function renderText(context, position, text, font, color) {
    "use strict";
    
    cx.fillStyle = color ? color : 'black';
    cx.font = font ? font : '15px Arial';
    
    let lines = text.split("\n");
    
    for (var i = 0; i<lines.length; i++) {
        cx.fillText(lines[i], position.x, position.y + 15 * i);
    }
}

function drawArrow(context, from, to, radius, color) {
    "use strict";
    
    cx.fillStyle = color;
    cx.strokeStyle = color;
    
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
        
    drawArrowhead(context, from, to, radius);
}

function drawArrowhead(context, from, to, radius) {
    "use strict";
    
	var x_center = to.x;
	var y_center = to.y;

	var angle;
	var x;
	var y;

	context.beginPath();

	angle = Math.atan2(to.y - from.y, to.x - from.x);
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;

	context.moveTo(x, y);

	angle += (1.0/3.0) * (2 * Math.PI);
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;

	context.lineTo(x, y);

	angle += (1.0/3.0) * (2 * Math.PI);
	x = radius *Math.cos(angle) + x_center;
	y = radius *Math.sin(angle) + y_center;

	context.lineTo(x, y);

	context.closePath();

	context.fill();
}

// Math
function linesIntersect(position1, direction1, position2, direction2) {
    "use strict";
    let positionDiff = position1.clone().subtract(position2);
    let crossDist = Vector.cross(direction2, direction1);
    
    if (crossDist === 0) {
        return undefined;
    }
    
    let dist1 = Vector.cross(positionDiff, direction2) / crossDist;
    return position1.clone().add(direction1.clone().scale(dist1));
}

function closestPointInSegment(segmentOrigin, segmentEnd, position) {
    "use strict";
    
    let segmentLengthSqr = Vector.distanceSqr(segmentOrigin, segmentEnd);
    
    if (segmentLengthSqr === 0) { return segmentOrigin.clone(); }
    
    let t = Vector.dot(position.clone().subtract(segmentOrigin), segmentEnd.clone().subtract(segmentOrigin)) / segmentLengthSqr;
    t = Math.max(0, Math.min(1, t));
    
    let projection = segmentOrigin.add( segmentEnd.clone().subtract(segmentOrigin).scale(t) );
    return projection;
}

function distanceToSegment(segmentOrigin, segmentEnd, position) {
    "use strict";
    
    let pointInSegment = closestPointInSegment(segmentOrigin, segmentEnd, position);
    return Vector.distance(pointInSegment, position);
}

class Transform {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.rotation = new Vector(1, 0);
    }
    
    forward() {
        return this.rotation.clone();
    }
    
    right() {
        return new Vector(-this.rotation.y, this.rotation.x);
    }
    
    render() {
        drawArrow(cx, this.position, this.position.clone().add(this.forward().scale(10)), 5, 'red');
        drawArrow(cx, this.position, this.position.clone().add(this.right().scale(10)), 5, 'blue');
    }
}

// Canvas
class Canvas2D {
	constructor(canvasId, fps) {
		this.canvas = document.getElementById(canvasId);
		this.cw = this.canvas.width;
		this.ch = this.canvas.height;
		this.cx = this.canvas.getContext('2d');
		this.step = 1 / fps;
		this.lastTime = timestamp();
		this.currentTime = 0;
		this.delta = 0;
	}
	
	init() {
		this.gameLoop();
	}
	
	gameLoop() {
		
		this.currentTime = timestamp();
		this.delta = this.delta + Math.min(1, (this.currentTime - this.lastTime) / 1000);
		
		while(this.delta > this.step) {
			
			const shouldUpdate = !paused || stepRequested;
			if (shouldUpdate)
			{
				this.delta = this.delta - this.step;
				this.update(this.step * gameState.options.simulation.tscale);
				stepRequested = false;
			}
			
			this.cx.clearRect(0, 0, this.cw, this.ch);
			this.render(this.cx);
			
			this.lastTime = this.currentTime;
		}
		
		window.requestAnimationFrame(this.gameLoop.bind(this));
	}
	
	update(deltaTime) {
		
	}
	
	render(cx) {
		
	}
	
	resize() {
	}
}