// Procedural Web Audio API Synthesizer for KEYFALL
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.65;
    this.noiseBuffer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.createNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Crisp mechanical-sci-fi keystroke + plasma laser shot
  playShot(charIndex = 0, wordLen = 5, combo = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const progress = Math.min(1, charIndex / Math.max(1, wordLen - 1));
    const comboBoost = Math.min(200, combo * 4);

    // 1. Tactile keystroke transient click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(1400 + progress * 400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(180, now + 0.025);
    clickGain.gain.setValueAtTime(0.18 * this.volume, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.028);

    // 2. Plasma bolt synth sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    const startFreq = 580 + progress * 340 + comboBoost;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.095);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.095);

    gain.gain.setValueAtTime(0.16 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Target lock-on confirmation chirp
  playLock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.035);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  // Target switch / cancel sound
  playSwitch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.06);

    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Typo / misfire buzz
  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc2.type = "square";
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.14);
    osc2.frequency.setValueAtTime(142, now);
    osc2.frequency.linearRampToValueAtTime(98, now + 0.14);

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  // Ship destruction explosion (size: 'small', 'medium', 'large', 'boss')
  playExplosion(size = "medium") {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;
    const duration =
      size === "boss" ? 0.95 : size === "large" ? 0.52 : size === "medium" ? 0.34 : 0.22;
    const level =
      size === "boss" ? 0.42 : size === "large" ? 0.3 : size === "medium" ? 0.22 : 0.16;

    // 1. Sub-bass impact drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(size === "boss" ? 160 : 190, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + duration);
    subGain.gain.setValueAtTime(level * 1.3 * this.volume, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + duration + 0.02);

    // 2. Filtered noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(size === "boss" ? 1800 : 1400, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(level * this.volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  // EMP Shockwave detonation
  playEmp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Deep resonant power sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.75);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.75);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);

    this.playExplosion("large");
  }

  // Wave Clear / Boss Shield Break Arpeggio
  playWaveClear() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.14 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }
}

window.soundEngine = new SoundEngine();
