/*jshint esversion: 6 */

const GameStage = { PLANET: 0, JUMPINGOUT: 1, JUMPINGIN: 2 };
Object.freeze(GameStage);

class GameState {
    constructor() {
        "use strict";
		this.step = 0;
		this.stage = GameStage.PLANET;
		
		this.encounters = {};
		this.usedEncounters = [];
		this.visitedPlanets = 0;
		this.exploredPlanets = [];
		
		this.address = "000000000";
		this.addressType = "";
		
		this.fuel = 100;
		this.food = 100;
		
		this.encounterTimeout = null;
        
        this.options = {            
            simulation: {
                tscale: 1,
            }
        };
        
        this.fpsCounter = new FPSCounter(0.1);
		
		this.processEncounters();
    }
	
	processEncounters() {
		let id = 1;
		for (let i=0; i<rawEncounters.length; ++i) {
			this.encounters[id++] = rawEncounters[i]
		}
	}
	
	isEncounterValid(encounter, type) {
		// Evaluate requirements
		if (encounter.type) {
			if (encounter.type != type) { return false; }
		}
		
		if (!encounter.requires) { return true; }
		
		if (encounter.requires.system) {
			if (encounter.requires.system != this.addressType) { return false; }
		}
		
		if (encounter.requires.planet) {
			if (encounter.requires.planet != mainViewCanvas.planet.type) { return false; }
		}
		
		if (encounter.requires.fuel != undefined) {
			if (encounter.requires.fuel >= 0 && this.fuel < encounter.requires.fuel) { return false; }
			else if (this.fuel > -encounter.requires.fuel) { return false; }
		}
		
		if (encounter.requires.food != undefined) {
			if (encounter.requires.food >= 0 && this.food < encounter.requires.food) { return false; }
			else if (this.food > -encounter.requires.food) { return false; }
		}
		
		if (encounter.requires.visitedPlanets != undefined) {
			if (encounter.requires.visitedPlanets >= 0 && this.visitedPlanets < encounter.requires.visitedPlanets) { return false; }
			else if (this.visitedPlanets > -encounter.requires.visitedPlanets) { return false; }
		}
	
		return true;
	}
	
	evaluateEncounters(seed, type) {
		let rng = new RNG(seed);
		
		let candidates = [];
		
		for (let id in this.encounters) {
			if (!this.usedEncounters.includes(id)) {
				if (this.isEncounterValid(this.encounters[id], type)) {
					let roll = rng.nextFloat() * 100;
					console.log(this.encounters[id])
					console.log(roll)
					if (roll <= this.encounters[id].probability) {
						candidates.push(id);
						break;
					}
				}
			}
		}
		
		if (candidates.length > 0)
		{
			let resultId = rng.choice(candidates);
			let result = this.encounters[resultId]
			
			let delay = 100;
			if (result.delay) {
				delay = result.delay * 1000;
			}
			
			var thisObj = this;
			
			this.encounterTimeout = setTimeout(function(){ 
				let text = result.text;
			
				if (result.repeat == false) {
					thisObj.usedEncounters.push(resultId);
				}
				
				if (result.rewards) {
					if (result.rewards.fuel != undefined) {
						if (result.rewards.fuel >= 0) {
							text += "\n - You get " + result.rewards.fuel + " fuel";
							thisObj.fuel += result.rewards.fuel;
						}
						else {
							text += "\n - You lose " + -result.rewards.fuel + " fuel";
							thisObj.fuel -= result.rewards.fuel;
						}
					}
					if (result.rewards.food != undefined) {
						if (result.rewards.food >= 0) {
							text += "\n - You get " + result.rewards.food + " food";
							thisObj.food += result.rewards.food;
						}
						else {
							text += "\n - You lose " + -result.rewards.food + " food";
							thisObj.food -= result.rewards.food;
						}
					}
				}
				
				alert(text);
				updateUI();
			}, delay);
			
		}
	}
	
	update(deltaTime) {
		this.step++;
		this.fpsCounter.update(deltaTime);
	}
	
	render(cx) {
		renderText(cx, new Vector(10, 40), "Step: " + this.step);
		this.fpsCounter.render(cx);
	}
	
	setAddress(address) {
		this.address = address;
	}
	
	travel(transition) {
		if (transition) {
			this.changeStage(GameStage.JUMPINGOUT);
		}
		else {
			this.changeStage(GameStage.JUMPINGOUT);
			this.changeStage(GameStage.JUMPINGIN);
			this.changeStage(GameStage.PLANET);
		}
	}
	
	changeStage(newStage) {
		
		if (newStage == GameStage.JUMPINGIN) {
			let rng = new RNG(this.address);
			
			const typeSeed = rng.nextInt();
			const encounterSeed = rng.nextInt();
			
			this.generateType(typeSeed);
			mainViewCanvas.reset(this.address);
			waveCanvas.reset(this.address);
			this.visitedPlanets++;
			
			updateUI();
		}
		else if (newStage == GameStage.JUMPINGOUT) {
			if (this.encounterTimeout) {
				clearTimeout(this.encounterTimeout);
			}
			
			let explorePlanet = document.getElementById("explorePlanet");
			explorePlanet.disabled = true;
			
			document.getElementById("jumpToCoord").disabled = true;
			document.getElementById("jumpRand").disabled = true;
		}
		else if (newStage == GameStage.PLANET) {
			let rng = new RNG(this.address);
			
			const typeSeed = rng.nextInt();
			const encounterSeed = rng.nextInt();
			
			let explorePlanet = document.getElementById("explorePlanet");
			explorePlanet.disabled = this.exploredPlanets.includes(this.address);
			
			document.getElementById("jumpToCoord").disabled = false;
			document.getElementById("jumpRand").disabled = false;
			
			this.evaluateEncounters(encounterSeed, "travel");
		}
		
		this.stage = newStage;
	}
	
	explore() {
		let rng = new RNG(this.address);
		const encounterSeed = rng.nextInt();
		
		if (this.encounterTimeout) {
			clearTimeout(this.encounterTimeout);
		}
		this.evaluateEncounters(encounterSeed, "explore");
		this.exploredPlanets.push(this.address);
		
		let explorePlanet = document.getElementById("explorePlanet");
		explorePlanet.disabled = true;
	}
	
	canUseFuel(amount) {
		return this.fuel >= amount;
	}
	
	useFuel(amount) {
		this.fuel -= amount;
	}
	
	canUseFood(amount) {
		return this.food >= amount;
	}
	
	useFood(amount) {
		this.food -= amount;
	}
	
	generateType(seed) {
		let rng = new RNG(seed);
		
		// sum of weights must be 100!
		const choices = [
			{type: "quiet", weigth: 80},
			{type: "dead", weigth: 4},
			{type: "echoes", weigth: 15},
			{type: "active", weigth: 1},
		];
		
		let rnd = rng.nextFloat() * 100;
		
		for (let i=0; i<choices.length; ++i) {
			if(rnd < choices[i].weigth) {
				this.addressType = choices[i].type;
				break;
			}
			rnd -= choices[i].weigth;
		}
	}
}

var gameState = new GameState();

var mousePosition = new Vector(0, 0);

function getMousePos(canvas, evt) {
    "use strict";
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function onMouseMove(e) {
    "use strict";
	var pos = getMousePos(canvas, e);
	mousePosition.x = pos.x;
	mousePosition.y = pos.y;
}

class WaveCanvas extends Canvas2D {
	constructor() {
		super('waveCanvas', 60);
		
		this.wave = new Wave(this, gameState.address);
	}
	
	update(deltaTime) {
		this.wave.update(deltaTime, this.currentTime);
	}
	
	render(cx) {
		this.wave.render(cx);
	}
	
	reset(seed) {
		this.wave.reset(seed, gameState.addressType);
	}
	
	resize() {
		this.cw = window.innerWidth;
		this.canvas.width = this.cw;
		this.canvas.style.width = this.cw + "px";
		
		this.ch = window.innerHeight * 0.3;
		this.canvas.height = this.ch;
		this.canvas.style.height = this.ch + "px";
	};
}

class MainViewCanvas extends Canvas2D {
	constructor() {
		super('canvas', 30);
		
		this.stars = new Stars(this, gameState.address);
		this.planet = new Planet(this, gameState.address);
		this.canvas.color = "black";
	}
	
	reset(seed) {
		this.stars.reset(seed);
		this.planet.reset(seed);
	}
	
	update(deltaTime) {
		this.stars.update(deltaTime, this.currentTime);
		this.planet.update(deltaTime, this.currentTime);
		
		if (gameState.stage == GameStage.JUMPINGOUT) {
			this.stars.hOffset += deltaTime * 3000;
			this.planet.hOffset -= deltaTime * 3400;
			
			if (this.planet.hOffset <= -this.cw) {
				console.log(this.planet.hOffset);
				gameState.changeStage(GameStage.JUMPINGIN);
				
				// Move to other side
				this.planet.hOffset = this.cw * 2;
			}
		}
		else if (gameState.stage == GameStage.JUMPINGIN) {
			this.stars.hOffset += deltaTime * 3000;
			this.planet.hOffset = Math.max(this.planet.hOffset - deltaTime * 3400, 0);
			
			if (this.planet.hOffset <= 0) {
				gameState.changeStage(GameStage.PLANET);
			}
		}
		else if (gameState.stage == GameStage.PLANET) {
			this.planet.hOffset = 0;
		}
	}
	
	render(cx) {
		this.stars.render(cx);
		this.planet.render(cx);
	}
	
	resize() {
		this.cw = window.innerWidth;
		this.canvas.width = this.cw;
		this.canvas.style.width = this.cw + "px";
		
		this.ch = window.innerHeight * 0.7;
		this.canvas.height = this.ch;
		this.canvas.style.height = this.ch + "px";
		
		this.planet.resize();
	};
}

var waveCanvas = new WaveCanvas();
var mainViewCanvas = new MainViewCanvas();

var paused = false,
	stepRequested = false;
	
function onResize() {
	waveCanvas.resize();
	mainViewCanvas.resize();
}

function generateAddress() {
	let rng = new RNG();
	
	let address = "";
	for (let i=0; i<9; ++i) {
		address += rng.nextRange(0, 9);
	}
	
	return address;
}

function sanitizeInputCoord(input) {
	let sanitizedValue = input.value;
	
	for (let i=0; i<sanitizedValue.length; ++i)
	{
		if (parseInt(sanitizedValue[i]) == NaN) {
			sanitizedValue[i] = "0";
		}
	}
	
	if (input.value.length > 9) {
		sanitizedValue = sanitizedValue.substr(0, 9);
	}
	else if (input.value.length < 9) {
		const extraZeroes = 9 - input.value.length;
		for (let i=0; i<extraZeroes; ++i)
		{
			sanitizedValue = "0" + sanitizedValue;
		}
	}
	
	input.value = sanitizedValue;
	
	return sanitizedValue;
}

function onAddressChanged(address, transition) {
	gameState.setAddress(address);
	document.getElementById("addressInput").value = address;
	gameState.travel(transition);
	updateUI();
}

function updateUI() {
	document.getElementById("fuelBar").value = gameState.fuel;
	document.getElementById("foodBar").value = gameState.food;
	
	document.getElementById("planetType").innerText = mainViewCanvas.planet.subtype;
	document.getElementById("radioType").innerText = gameState.addressType;
}

function init() {
    "use strict";
	
	onAddressChanged(generateAddress(), false);
	
	waveCanvas.init();
	mainViewCanvas.init();
	updateUI();
	
	// Change address
	let input = document.getElementById("addressInput");
	input.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			let jumpToCoordinates = document.getElementById("jumpToCoord");
			jumpToCoordinates.click();
		}
	});
	
	let jumpToCoordinates = document.getElementById("jumpToCoord");
	jumpToCoordinates.onclick = function() {
		let input = document.getElementById("addressInput");
		const address = sanitizeInputCoord(input);
		
		if (address != gameState.address && gameState.canUseFuel(10)) {
			gameState.useFuel(10);
			onAddressChanged(address, true);
		}
	};
	
	let jumpRandomly = document.getElementById("jumpRand");
	jumpRandomly.onclick = function() {
		if (gameState.canUseFuel(5)) {
			gameState.useFuel(5);
			onAddressChanged(generateAddress(), true);
		}
	};
	
	let explorePlanet = document.getElementById("explorePlanet");
	explorePlanet.onclick = function() {
		if (gameState.canUseFood(5)) {
			gameState.useFood(5);
			updateUI();
			gameState.explore();
		}
	};
	
	// Webkit/Blink will fire this on load, but Gecko doesn't.
	window.onresize = onResize;

	// So we fire it manually...
	onResize();
	
	// Input
	document.onkeypress = function (e) {
		e = e || window.event;
		
		var keyMapping = {
			pause: 102,
			step: 103,
            stepBack: 100
		};
		
		if (e.keyCode === keyMapping.pause) {
			paused = !paused;
            
            if (paused)
            {
                document.body.classList.add("paused");
            }
            else
            {
                document.body.classList.remove("paused");
            }
		}
		else if (e.keyCode === keyMapping.step) {
			stepRequested = true;
		}
	}; 
	
	window.addEventListener('mousemove', onMouseMove, false);
}

init();