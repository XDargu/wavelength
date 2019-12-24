/*jshint esversion: 6 */
class Stars {
	constructor(canvas, seed) {
		this.canvas = canvas;
		this.stars = [];
		this.speed = 0.005;
		this.hOffset = 0;
		this.generate(seed);
	}
	
	generate(seed) {
		let rng = new RNG(seed);
		
		for (var i = 0; i < 200; i++) {
			this.stars[i] = {
				pos: new Vector(rng.nextFloat(), rng.nextFloat()),
				radius: 3 + rng.nextFloat() * 2
			};
		}
	}
	
	reset(seed) {
		this.stars = [];
		this.generate(seed);
	}
	
	update(deltaTime, currentTime) {
	}
	
	render(cx) {
		const starAmount = this.stars.length;
		for (let i = 0; i < starAmount; i++) {
			const star = this.stars[i];
			const sparks = Math.sin( (this.canvas.currentTime + i * 100) * 0.001);
			const baseIntensity = 0.5;
			const intensity = baseIntensity + (sparks * 0.2);
			cx.fillStyle = "rgba(150, 150, 150, " + intensity +")";
			cx.beginPath();
			
			const speed = this.speed * i/starAmount;
			const x = ((star.pos.x * canvas.width) + (this.canvas.currentTime * speed) + this.hOffset) % canvas.width;
			const y = ((star.pos.y * canvas.height)) % canvas.height;
			
			cx.fillRect(x, y, star.radius, star.radius);
		}
	}
}

class Planet {
	constructor(canvas, seed) {
		this.canvas = canvas;
		this.generate(seed);
		this.tiles = [];
		this.size = 30;
		this.tileSize = 10;
		this.rotMaxEffect = 5;
		this.type = "";
		this.palette = [];
		this.hOffset = 0;
		this.shadedTiles = {};
		this.generate(seed);
	}
	
	reset(seed) {
		this.type = "";
		this.subtype = "";
		this.palette = [];
		this.generate(seed);
	}
	
	generate(seed) {
		let rng = new RNG(seed);
		
		const seedTiles = rng.nextInt();
		const seedType = rng.nextInt();
		const seedPalette = rng.nextInt();
		const seedSize = rng.nextInt();
		
		this.generateSize(seedSize);
		this.generateType(seedType);
		this.generatePalette(seedPalette);
		this.generateTiles(seedTiles);
		
	}
	
	generateSize(seed) {
		let rng = new RNG(seed);
		
		this.size = rng.nextRange(10, 30);
		this.rotMaxEffect = this.size / 4;
	}
	
	resize() {
		this.tileSize = Math.min(this.canvas.ch, this.canvas.cw) / 30 * 0.7;
	}
	
	generateTiles(seed) {
		let rng = new RNG(seed);
		
		this.tiles = [];
		
		var lineChange = 0.6;
		
		if (this.type == "gas") {
			lineChange = 0.9;
		}
		
		this.tiles = [];
		for (var x = 0; x < this.size; ++x) {
			this.tiles[x] = [];
		}
		
		for (var y = 0; y < this.size; ++y) {
			const val = rng.nextFloat();
			for (var x = 0; x < this.size; ++x) {
				this.tiles[x][y] = {
					value: val,
				};
			}
		}
		

		for (var x = 0; x < this.size; ++x) {
			for (var y = 0; y < this.size; ++y) {
				if (rng.nextFloat() > lineChange) {
					this.tiles[x][y].value = rng.nextFloat();
				}
			}
		}
		
		// Generate shaded tiles table
		// First get tiles per colour in the palette
		this.shadedTiles = {};
		
		const halfSize = this.size * 0.5;
		for (var x = 0; x < this.size; ++x) {
			for (var y = 0; y < this.size; ++y) {				
				const dx = x - halfSize;
				const dy = y - halfSize;
				const dist =  Math.sqrt(dx * dx + dy * dy);
				
				if (dist < this.size * 0.5) {					
					const shadeColor = "rgba(0, 0, 0, " + (dist / (this.size * 0.5 * 1.1)) +")";
					if (this.shadedTiles[shadeColor] == undefined) {
						this.shadedTiles[shadeColor] = [];
					}
					
					this.shadedTiles[shadeColor].push({ x: x, y: y, dist: dist });
				}
			}
		}
	}
	
	generateType(seed) {
		let rng = new RNG(seed);
		
		// sum of weights must be 100!
		const choices = [
			{type: "desert", weigth: 30},
			{type: "ice", weigth: 5},
			{type: "barren", weigth: 40},
			{type: "jungle", weigth: 5},
			{type: "ocean", weigth: 2},
			{type: "metal", weigth: 2},
			{type: "strange", weigth: 1},
			{type: "gas", weigth: 15},
		];
		
		let rnd = rng.nextFloat() * 100;
		
		for (let i=0; i<choices.length; ++i) {
			if(rnd < choices[i].weigth) {
				this.type = choices[i].type;
				break;
			}
			rnd -= choices[i].weigth;
		}
		
		const subtypesPerType = {
			"desert": ["sandy", "rocky", "desertic"],
			"ice": ["snowy", "ice", "tundra", "artic", "frozen"],
			"barren": ["scorched", "barren", "warm", "magmatic", "superheated"],
			"jungle": ["overgrown", "forest", "jungle", "plentiful"],
			"ocean": ["waterworld"],
			"metal": ["metallic", "artificial", "robotic", "industrial"],
			"strange": ["alive", "dormant", "grotesque", "hungry", "colourful", "strange", "<redacted>"],
			"gas": ["gas"],
		};
		this.subtype = rng.choice(subtypesPerType[this.type]);
	}
	
	generatePalette2(seed) {
		let rng = new RNG(seed);
		
		let palettesPerType = {
			"desert": ["yellow", "brown", "rosybrown"],
			"ice": ["blue", "white", "cyan"],
			"barren": ["brown", "red"],
			"jungle": ["green", "blue", "darkgreen", "forestgreen"],
			"ocean": ["blue", "dodgerblue", "cornflowerblue"],
			"metal": ["gray", "lightgray"],
			"strange": ["orange", "lime", "purple", "cyan", "lime"],
			"gas": ["orange", "brown", "saddlebrown"],
		};
		
		this.palette = [];
		this.palette[0] = rng.choice(palettesPerType[this.type]);
		if (this.type == "ocean") {
			this.palette[1] = this.palette[0];
		}
		else {
			this.palette[1] = rng.choice(palettesPerType[this.type]);
		}
	}
	
	generatePalette(seed) {
		let rng = new RNG(seed);
		
		const palettesPerType = {
			"desert": [["yellow", "brown"], ["yellow", "red", "yellow"], ["rosybrown", "yellow"]],
			"ice": [["blue", "white"], ["cyan", "white"], ["white", "white", "cornflowerblue"]],
			"barren": [["brown", "red"], ["brown", "gray"], ["brown", "saddlebrown"], ["gray", "red"]],
			"jungle": [["green", "blue"], ["green", "darkgreen"], ["forestgreen", "darkgreen"]],
			"ocean": [["blue", "blue"], ["dodgerblue", "dodgerblue"], ["cornflowerblue", "cornflowerblue"]],
			"metal": [["gray", "lightgray"]],
			"strange": [["orange", "lime"], ["purple", "orange"], ["cyan", "lime", "red"]],
			"gas": [["orange", "brown"], ["saddlebrown", "orange", "red"], ["saddlebrown", "brown"]],
		};
		
		this.palette = rng.choice(palettesPerType[this.type]);
	}
	
	update(deltaTime, currentTime) {
		
	}
	
	getColorFromTile(tile)
	{
		const increment = 1.0 / this.palette.length;
		let threshold = increment;
		
		for (var i = 0; i < this.palette.length; i++) {
			if (tile.value < threshold) {
				return this.palette[i];
			}
			
			threshold += increment;
		}
		
		return this.palette[this.palette.length - 1];
	}
	
	render2(cx) {
		const centrex = this.canvas.cw / 2 + this.hOffset;
		const centrey = this.canvas.ch / 2;
		const halfSize = this.size * 0.5;
		
		cx.fillStyle = this.palette[0];
		cx.beginPath();
		cx.arc(centrex, centrey, halfSize * this.tileSize, 0, Math.PI * 2);
		cx.fill();
		
		
		let rng = new RNG(this.tiles[0][0].value);
		
		for (var x = 0; x < this.size; x+=3) {
			const tile = this.tiles[x][0];
			
			const x1 = centrex - halfSize * rng.nextFloat() * this.tileSize;
			const x2 = x1 + rng.nextRange(20, 150);
			const y = centrey + (x - halfSize) * this.tileSize + rng.nextRange(-10, 10);
			this.renderCloud(x1, y, x2, rng.nextRange(5, 15), cx);
			
			const x3 = centrex + halfSize * rng.nextUnitVal() * this.tileSize;
			const y3 = centrey + halfSize * rng.nextUnitVal() * this.tileSize;
			
			this.renderSpot(x3, y3, rng.nextRange(5, 15) ,cx);
		}
		
	}
	
	renderSpot(x, y, radius, cx) {
		cx.fillStyle = this.palette[1];
		cx.beginPath();
		cx.arc(x, y, radius, 0, Math.PI * 2);
		cx.fill();
	}
	
	renderCloud(x, y, x2, radius, cx) {
		cx.fillStyle = this.palette[1];
		cx.beginPath();
		cx.moveTo(x, y + radius);
		cx.lineTo(x2, y + radius);
		cx.arc(x2, y, radius, Math.PI * 0.5, Math.PI * 1.5, true);
		cx.lineTo(x, y - radius);
		cx.arc(x, y, radius, Math.PI * 0.5, Math.PI * 1.5, false);
		cx.fill();
	}
	
	render(cx) {
		const centrex = this.canvas.cw / 2 + this.tileSize * this.size * 0.5 + this.hOffset - this.tileSize * 0.5;
		const centrey = this.canvas.ch / 2 + this.tileSize * this.size * 0.5 - this.tileSize * 0.5;
		const halfSize = this.size * 0.5;
		
		// First get tiles per colour in the palette
		let tilesToDraw = [];
		
		for (var x = 0; x < this.size; ++x) {
			for (var y = 0; y < this.size; ++y) {
				
				// Rotation effect
				var rotX = (x + Math.floor(this.canvas.currentTime * 0.001)) % this.size;
				var rotY = (y + Math.floor( Math.sin(x / this.size * Math.PI) * this.rotMaxEffect)) % this.size;
				var tile = this.tiles[rotX][rotY];
				
				const dx = x - halfSize;
				const dy = y - halfSize;
				const dist =  Math.sqrt(dx * dx + dy * dy);
				
				if (dist < this.size * 0.5) {
					const color = this.getColorFromTile(tile);
					if (tilesToDraw[color] == undefined) {
						tilesToDraw[color] = [];
					}
					tilesToDraw[color].push({ x: x, y: y });
				}
			}
		}
		
		for (let color in tilesToDraw) {
			const tiles = tilesToDraw[color];
			
			cx.beginPath();
			cx.fillStyle = color;
			
			for (var j = 0; j < tiles.length; ++j) {
				const tile = tiles[j];
				cx.rect(centrex - tile.x * this.tileSize, centrey - tile.y * this.tileSize, this.tileSize, this.tileSize);
			}
			
			cx.fill();
		}
		
		const shadedTileSize = this.tileSize * 1.06;
		const shadedTilePadding = (shadedTileSize - this.tileSize) * 0.5;
		
		for (let color in this.shadedTiles) {
			const tiles = this.shadedTiles[color];
			
			cx.beginPath();
			cx.fillStyle = color;
			
			for (var j = 0; j < tiles.length; ++j) {
				const tile = tiles[j];
				cx.rect(centrex - tile.x * this.tileSize - shadedTilePadding, centrey - tile.y * this.tileSize - shadedTilePadding, shadedTileSize, shadedTileSize);
			}
			
			cx.fill();
		}
		
		this.tilesToDraw = tilesToDraw;
		
		/*for (var x = 0; x < this.size; ++x) {
			for (var y = 0; y < this.size; ++y) {
				
				// Rotation effect
				var rotX = (x + Math.floor(this.canvas.currentTime * 0.001)) % this.size;
				var rotY = (y + Math.floor( Math.sin(x / this.size * Math.PI) * this.rotMaxEffect)) % this.size;
				var tile = this.tiles[rotX][rotY];
				
				const dx = x - halfSize;
				const dy = y - halfSize;
				const dist =  Math.sqrt(dx * dx + dy * dy);
				
				if (dist < this.size * 0.5) {
					cx.fillStyle = this.getColorFromTile(tile);
					cx.fillRect(centrex - x * this.tileSize, centrey - y * this.tileSize, this.tileSize, this.tileSize);
					
					cx.fillStyle = "rgba(0, 0, 0, " + (dist / (this.size * 0.5 * 1.1)) +")";
					cx.fillRect(centrex - x * this.tileSize, centrey - y * this.tileSize, this.tileSize * 1.04, this.tileSize * 1.04);
				}
			}
		}*/
	}
}