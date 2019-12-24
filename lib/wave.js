/*jshint esversion: 6 */
class ProcMusic {
	constructor() {
		this.patterns = [
			{} // Fifth
		];
	}
}

class SoundScheduler {
	constructor() {
		this.bpm = 60;
		this.lookahead = 25; // How often we schedule in ms
		this.scheduleAheadTime = 0.1; // How far ahead to schedule the audio in seconds
		
		this.currentNote = 0;
		this.nextNoteTime = 0; // When next note should start
		
		this.range = [];
		
		this.playing = false;
		
		this.notes = [];
		this.harmonies = [];
		this.kick = [];
		
		this.beepAudioContext = new AudioContext();
		
		this.timeoutID = 0;
		this.scheduler();
	}
	
	generateSound(seed) {
		let rng = new RNG(seed);
		
		const harmoniesSeed = rng.nextInt();
		const rangeSeed = rng.nextInt();
		const kickSeed = rng.nextInt();
		const notesSeed = rng.nextInt();
		const bpmSeed = rng.nextInt();
		
		this.generateBPM(bpmSeed);
		this.generateHarmonies(harmoniesSeed);
		this.generateRange(rangeSeed);
		this.generateKick(kickSeed);
		this.generateNotes(notesSeed);
		
		this.stop();
		this.playing = true;
	}
	
	generateBPM(seed) {
		let rng = new RNG(seed);
		
		this.bpm = rng.nextRange(20, 200);
	}
	
	generateNotes(seed) {
		let rng = new RNG(seed);
		
		this.notes = [];
		
		for (let i=0; i<4; ++i) {
			this.generateBeat(rng);
		}
		
		this.generateRange(rng.nextInt());
		
		this.kick = this.kick.concat(this.kick);
		
		for (let i=0; i<4; ++i) {
			this.generateBeat(rng);
		}
	}
	
	generateRange(seed) {
		let rng = new RNG(seed);
		
		this.range = [];
		const type = rng.choice(["low", "medium"]);//, "high"]);
		
		if (type == "low") {
			this.range.push(rng.nextRange(100, 150));
			this.range.push(rng.nextRange(150, 200));
		}
		else if (type == "medium") {
			this.range.push(rng.nextRange(100, 200));
			this.range.push(rng.nextRange(400, 600));
		}
		else if (type == "high") {
			this.range.push(rng.nextRange(400, 600));
			this.range.push(rng.nextRange(800, 1200));
		}
	}
	
	generateKick(seed) {
		let rng = new RNG(seed);
		
		this.kick = [];
		const type = rng.choice(["none", "1-2", "double", "1-4", "thirds", "sync"]);
		
		if (type == "none") {
			this.kick = [0,0,0,0,0,0,0,0];
		}
		else if (type == "1-2") {
			this.kick = [1,0,0,0,1,0,0,0];
		}
		else if (type == "double") {
			this.kick = [1,0,1,1,1,0,1,1];
		}
		else if (type == "1-4") {
			this.kick = [1,0,0,0,0,0,0,0];
		}
		else if (type == "thirds") {
			this.kick = [1,0,0,1,0,0,1,0];
		}
		else if (type == "sync") {
			this.kick = [0,1,0,0,0,1,0,0];
		}
	}
	
	generateHarmonies(seed) {
		let rng = new RNG(seed);
		
		this.harmonies = [];
		const harms = [1 / 2, 1 / 3, 2 / 3, 4 / 5, 3 / 5, 1 / 4];
		
		this.harmonies.push(rng.choice(harms));
		this.harmonies.push(rng.choice(harms));
	}
	
	stop() {
		this.playing = false;
		this.currentNote = 0;
		this.beepAudioContext.suspend();
	}
	
	generateBeat(rng) {		
		const secondsPerBeat = 60.0 / this.bpm;
		
		// Beats can be: wholes or halfs
		const type = rng.choice(["whole", "half"]);
		
		if (type == "whole") {
			this.generateNote(rng, secondsPerBeat * 1000);
			this.generateSilence();
		}
		else if (type == "half") {
			this.generateNote(rng, secondsPerBeat * 500);
			this.generateNote(rng, secondsPerBeat * 500);
			// Generate half
			// Then see what we do with the other half, it could be half or quarter
		}
	}
	
	generateSilence() {
		this.notes.push({
				fre: 0,
				len: 0,
				typ: "silence",
				kick: this.kick[this.notes.length] == 1,
			});
	}
	
	generateNote(rng, time) {
		this.notes.push({
				fre: rng.nextRange(this.range[0], this.range[1]),
				len: time,
				typ: rng.choice(["sine"/*, "square", "triangle"*/]),
				kick: this.kick[this.notes.length] == 1
			});
	}
		
	nextNote() {
		const secondsPerBeat = 60.0 / this.bpm;
		
		this.nextNoteTime += secondsPerBeat;
		
		this.currentNote++;
		if (this.currentNote == this.notes.length) {
			this.currentNote = 0;
			
			/*let rng = new RNG();
			this.generateNotes(rng.nextInt());*/
		}
	}
	
	scheduleNote(beatNumber, time, harmonies) {
		let note = this.notes[beatNumber];
		
		if (note) {
			if (note.typ != "silence") {
				
				this.playBeep(note.len * 0.002, note.fre, note.typ, 0);
				if (harmonies) {
					this.playBeep(note.len * 0.0015, note.fre * this.harmonies[0], note.typ, 0.2);
					this.playBeep(note.len * 0.001, note.fre * this.harmonies[1], note.typ, 0.4);
				}
					
				if (note.kick) {
					this.playKick(0.8, 0.3);
				}
				
			}
		}
	}
	
	scheduler() {
		
		if (this.playing) {
			if (this.beepAudioContext.state == "suspended") {
				this.beepAudioContext.resume();
			}
			
			while (this.nextNoteTime < this.beepAudioContext.currentTime + this.scheduleAheadTime) {
				this.scheduleNote(this.currentNote, this.nextNoteTime, true);
				this.nextNote();
			}
		}
		
		this.timeoutID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
	}
	
	playBeep(length, freq, type, delay) {
		var o = this.beepAudioContext.createOscillator();
		o.type = type;
		o.frequency.value = freq;
		
		var g = this.beepAudioContext.createGain();
		g.gain.cancelScheduledValues(this.beepAudioContext.currentTime);
		g.gain.setValueAtTime(0, this.beepAudioContext.currentTime);
		// Attack
		var attackTime = 0.1;
		g.gain.linearRampToValueAtTime(0.6, this.beepAudioContext.currentTime + attackTime);
		// Release
		var releaseTime = 0.1;
		g.gain.linearRampToValueAtTime(0, this.beepAudioContext.currentTime + length + delay - releaseTime);
		
		o.connect(g).connect(this.beepAudioContext.destination);
		o.start(delay);
		o.stop(this.beepAudioContext.currentTime + length + delay);
	}
	
	playKick(length, delay) {
		var o = this.beepAudioContext.createOscillator();
		o.type = "sine";
		o.frequency.value = 150;
		
		o.frequency.setValueAtTime(150, this.beepAudioContext.currentTime);
		o.frequency.exponentialRampToValueAtTime(0.001, this.beepAudioContext.currentTime + length);
		
		var g = this.beepAudioContext.createGain();
		g.gain.cancelScheduledValues(this.beepAudioContext.currentTime);
		g.gain.setValueAtTime(3, this.beepAudioContext.currentTime);
		
		// 0 Attack
		
		// Exp. Release
		var releaseTime = 0.1;
		g.gain.exponentialRampToValueAtTime(0.001, this.beepAudioContext.currentTime + length + delay - releaseTime);
		
		o.connect(g).connect(this.beepAudioContext.destination);
		o.start(delay);
		o.stop(this.beepAudioContext.currentTime + length + delay);
	}
}

class Wave {
	constructor(canvas, seed) {
		this.points = [];
		this.waves = 300;
		this.minAmpl = 10;
		this.maxAmpl = 100;
		this.canvas = canvas;
		
		this.tval = [100, 400, 150];
		this.fval = [16, 40];
		this.type = "";
		this.audioContext = new AudioContext();
		this.whiteNoise = null;
		
		this.scheduler = new SoundScheduler();
		
		this.generateWave(seed);
	}
	
	generateWave(seed) {
		for (let i=0; i<this.waves; ++i) {
			this.points[i] = 0;
		}
		
		let rng = new RNG(seed);
		
		const presetSeed = rng.nextInt();
		const noiseSeed = rng.nextInt();
		const soundSeed = rng.nextInt();
		
		this.generatePreset(presetSeed);
		this.generateSound(noiseSeed);
		
		if (true ){//this.type == "active") {
			this.scheduler.generateSound(soundSeed);
		}
		else {
			this.scheduler.stop();
		}
	}
	
	generatePreset(seed) {
		let rng = new RNG(seed);
		
		this.tval[0] = rng.nextRange(20, 220);
		this.tval[1] = rng.nextRange(250, 650);
		this.tval[2] = rng.nextRange(95, 280);
		
		this.fval[0] = rng.nextRange(5, 25);
		this.fval[1] = rng.nextRange(20, 60);
		
		if (this.type == "dead") {
			this.minAmpl = 0;
			this.maxAmpl = 0;
		}
		else if (this.type == "quiet") {
			this.minAmpl = rng.nextRange(1, 5);
			this.maxAmpl = rng.nextRange(5, 10);
		}
		else if (this.type == "echoes") {
			this.minAmpl = rng.nextRange(5, 10);
			this.maxAmpl = rng.nextRange(15, 25);
		}
		else if (this.type == "active") {
			/*this.tval[0] = rng.nextRange(80, 120);
			this.tval[1] = rng.nextRange(350, 450);
			this.tval[2] = rng.nextRange(130, 180);
			
			this.fval[0] = rng.nextRange(10, 20);
			this.fval[1] = rng.nextRange(30, 50);*/
			
			this.minAmpl = rng.nextRange(5, 15);
			this.maxAmpl = rng.nextRange(60, 100);
		}
	}
	
	generateSound(seed) {
		
		if (this.whiteNoise) { this.whiteNoise.disconnect(this.audioContext.destination); }
		
		let rng = new RNG(seed);
		
		var bufferSize = 2 * this.audioContext.sampleRate,
		noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate),
		output = noiseBuffer.getChannelData(0);
		
		var lastOut = 0.0;
		for (var i = 0; i < bufferSize; i++) {
			const ampl = rng.nextRange(this.minAmpl, this.maxAmpl) * 0.01;			
			var white = (Math.random() * 2 - 1) * ampl;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
		}

		this.whiteNoise = this.audioContext.createBufferSource();
		this.whiteNoise.buffer = noiseBuffer;
		this.whiteNoise.loop = true;
		this.whiteNoise.start(0);

		this.whiteNoise.connect(this.audioContext.destination);
	}
	
	reset(seed, type) {
		this.type = type;
		this.generateWave(seed);
	}
	
	getTimeValue(currentTime) {
		const t1 = Math.sin(currentTime / this.tval[0]);
		const t2 = Math.sin(currentTime / this.tval[1] + 1.2);
		const t3 = Math.sin(currentTime / this.tval[2] + 0.4);
		
		return t1 * t2 * t3;
	}
	
	getFreqValue(i, currentTime) {
		const f1 = Math.sin(i * this.fval[0] - 0.004 * currentTime);
		const f2 = Math.sin(i * this.fval[1] + 0.003 * currentTime);
		const f3 = Math.sin(i * 3.12); // Controls general shape
		
		return f1 * f2 * f3;
	}
	
	update(deltaTime, currentTime) {
		// Wave
		var rng = new RNG(currentTime);
		const timeValue = this.getTimeValue(currentTime);
		
		this.waves = this.canvas.cw / 3;
		
		for (let i=0; i<this.waves; ++i) {
			const rndAmpl = rng.nextRange(this.minAmpl, this.maxAmpl);
			const freqValue = this.getFreqValue(i / this.waves, currentTime);
			const ampl = rndAmpl * freqValue * timeValue * this.canvas.ch * 0.01;
			
			if (ampl >= this.points[i]) {
				this.points[i] = ampl;
			}
			else {
				const change = (this.points[i] - ampl)
				this.points[i] -= deltaTime * change * 20;
			}
			
		}
	}
	
	render(cx) {
		cx.beginPath();
	
		// Baseline
		cx.moveTo(0, this.canvas.ch/2);
		cx.lineTo(this.canvas.cw, this.canvas.ch/2);
		const waveStep = this.canvas.cw / this.waves;
		
		for (let i=0; i<this.waves; ++i) {
			const ampl = this.points[i];
			
			cx.moveTo(waveStep * i, this.canvas.ch/2 - ampl);
			cx.lineTo(waveStep * i, this.canvas.ch/2 + ampl);
		}
		
		cx.strokeStyle = "#ccc";
		cx.stroke();
	}
}