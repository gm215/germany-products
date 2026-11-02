// Web Audio API Procedural Sound & Synthwave Engine
// Works 100% offline with zero external audio assets

class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = false;
    this.musicPlaying = false;
    this.musicInterval = null;
    this.musicStep = 0;
    this.bpm = 124;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  // Component caught
  playCatch(type = 'normal') {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    if (type === 'rare') {
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, t + 0.25); // D6
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } else {
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    }
  }

  // Electrical Short Circuit / Hazard hit
  playZap() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(70, t + 0.25);

    // Distortion / harsh buzz
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Combo Streak chime (rises with combo count)
  playCombo(streak = 1) {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 1046.50];
    const baseFreq = notes[Math.min(streak, notes.length - 1)];

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.1);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Customer order completed fanfare!
  playOrderComplete() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    chord.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // Made in Germany Seal / Fever Mode Fanfare
  playFever() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.4);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // Game over sound
  playGameOver() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [440, 415.3, 392, 349.23];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // Upgrade Purchased Sound
  playUpgrade() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [329.63, 440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const time = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  // --- Background Synthwave Loop ---

  startMusic() {
    if (this.musicPlaying) return;
    this.resume();
    if (!this.ctx) return;

    this.musicPlaying = true;
    this.musicStep = 0;

    // 16-step synthwave sequence (German electro bassline)
    // Notes in MIDI/Hz: A minor / D minor vibe (Kraftwerk / Cyberpunk feel)
    const bassline = [
      110, 110, 220, 110,  130.81, 110, 164.81, 146.83,
      110, 110, 220, 110,  123.47, 110, 146.83, 130.81
    ];

    const leadMelody = [
      440, 0, 523.25, 0,  659.25, 0, 587.33, 440,
      0, 523.25, 0, 659.25, 783.99, 659.25, 587.33, 523.25
    ];

    const stepDuration = (60 / this.bpm) / 4; // 16th note in seconds

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.musicPlaying || !this.ctx) return;

      const t = this.ctx.currentTime;
      const step = this.musicStep % 16;

      // Kick drum on 0, 4, 8, 12
      if (step % 4 === 0) {
        this.playKick(t);
      }

      // Snare / Clap on 4, 12
      if (step === 4 || step === 12) {
        this.playSnare(t);
      }

      // Hi-hat on every off-beat (2, 6, 10, 14)
      if (step % 2 === 1) {
        this.playHiHat(t);
      }

      // Bass synth
      const bassFreq = bassline[step];
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);
        filter.frequency.exponentialRampToValueAtTime(150, t + 0.12);

        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.15);
      }

      // Lead melody
      const leadFreq = leadMelody[step];
      if (leadFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(leadFreq, t);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      }

      this.musicStep++;
    }, stepDuration * 1000);
  }

  playKick(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  playSnare(t) {
    // Noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  playHiHat(t) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, t);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, t);

    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }
}

window.soundManager = new SoundManager();
