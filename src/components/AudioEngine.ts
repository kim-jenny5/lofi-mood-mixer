// ─── Web Audio Engine ─────────────────────────────────────────────────────────

class AudioEngine {
	private ctx: AudioContext | null = null;
	private rainGain: GainNode | null = null;
	private natureGain: GainNode | null = null;
	private master: GainNode | null = null;
	private ready = false;

	init(): void {
		if (this.ready) return;
		try {
			this.ctx = new (
				window.AudioContext || (window as any).webkitAudioContext
			)();
			const master = this.ctx.createGain();
			master.gain.value = 0.85;
			master.connect(this.ctx.destination);
			this.master = master;
			this.rainGain = this._buildRain();
			this.natureGain = this._buildNature();
			this.ready = true;
		} catch (e) {
			console.warn('Audio init failed:', e);
		}
	}

	// ── Internals ──────────────────────────────────────────────────────────────

	private _noiseBuffer(sec = 3): AudioBuffer {
		const ctx = this.ctx!;
		const n = ctx.sampleRate * sec;
		const buf = ctx.createBuffer(2, n, ctx.sampleRate);
		for (let ch = 0; ch < 2; ch++) {
			const d = buf.getChannelData(ch);
			for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
		}
		return buf;
	}

	private _buildRain(): GainNode {
		const ctx = this.ctx!;
		const g = ctx.createGain();
		g.gain.value = 0;
		const src = ctx.createBufferSource();
		src.buffer = this._noiseBuffer(4);
		src.loop = true;
		const hpf = ctx.createBiquadFilter();
		hpf.type = 'highpass';
		hpf.frequency.value = 250;
		const lpf = ctx.createBiquadFilter();
		lpf.type = 'lowpass';
		lpf.frequency.value = 1400;
		src.connect(hpf);
		hpf.connect(lpf);
		lpf.connect(g);
		g.connect(this.master!);
		src.start();
		return g;
	}

	private _buildNature(): GainNode {
		const ctx = this.ctx!;
		const g = ctx.createGain();
		g.gain.value = 0;

		// Crickets — AM-modulated oscillators
		const crickets: [number, number][] = [
			[3400, 13],
			[3800, 15],
			[4300, 11]
		];
		crickets.forEach(([freq, modFreq]) => {
			const osc = ctx.createOscillator();
			osc.frequency.value = freq;
			const mod = ctx.createOscillator();
			mod.frequency.value = modFreq;
			const modG = ctx.createGain();
			modG.gain.value = freq * 0.22;
			const oscG = ctx.createGain();
			oscG.gain.value = 0.038;
			mod.connect(modG);
			modG.connect(osc.frequency);
			osc.connect(oscG);
			oscG.connect(g);
			osc.start();
			mod.start();
		});

		// Soft wind noise
		const wind = ctx.createBufferSource();
		wind.buffer = this._noiseBuffer(2);
		wind.loop = true;
		const wf = ctx.createBiquadFilter();
		wf.type = 'lowpass';
		wf.frequency.value = 320;
		const wg = ctx.createGain();
		wg.gain.value = 0.06;
		wind.connect(wf);
		wf.connect(wg);
		wg.connect(g);
		wind.start();
		g.connect(this.master!);
		return g;
	}

	// ── Public API ─────────────────────────────────────────────────────────────

	setRain(v: number): void {
		if (!this.ready) return;
		this.rainGain!.gain.setTargetAtTime(v * 0.48, this.ctx!.currentTime, 1.3);
	}

	setNature(v: number): void {
		if (!this.ready) return;
		this.natureGain!.gain.setTargetAtTime(v * 0.32, this.ctx!.currentTime, 1.8);
	}

	play(): void {
		if (this.ready) void this.ctx!.resume();
	}
	pause(): void {
		if (this.ready) void this.ctx!.suspend();
	}
}

// Singleton — shared across hot-reloads in dev
export const engine = new AudioEngine();
