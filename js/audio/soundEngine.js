/**
 * RailPulse AI - Procedural Web Audio Engine
 * Real-time sound synthesis for locomotive engines, rail clatter, horns, air brakes & station chimes
 */

class RailSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.engineGain = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    
    this.clatterTimer = null;
    this.currentSpeed = 0;
    this.isHornPlaying = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initEngineSound();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not supported or blocked by user gesture:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // 1. Continuous Electric / Diesel Traction Hum
  initEngineSound() {
    if (!this.ctx) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    // Primary traction motor inverter whine
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = "sawtooth";
    this.engineOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low rumble

    // Secondary harmonic motor buzz
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = "sine";
    this.engineOsc2.frequency.setValueAtTime(110, this.ctx.currentTime);

    // Lowpass filter for deep realistic vibration
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.engineOsc1.connect(filter);
    this.engineOsc2.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  // Update engine frequency & clatter tempo with speed
  updateSpeed(kmh) {
    this.currentSpeed = kmh;
    if (!this.ctx || !this.initialized || this.isMuted) return;

    // Shift motor whine frequency
    const targetFreq1 = 50 + (kmh * 1.5);
    const targetFreq2 = 100 + (kmh * 2.8);
    const targetVol = kmh > 2 ? Math.min(0.12, 0.02 + (kmh / 160) * 0.1) : 0.005;

    this.engineOsc1.frequency.setTargetAtTime(targetFreq1, this.ctx.currentTime, 0.1);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq2, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);

    // Manage rail clatter cadence
    this.manageClatter(kmh);
  }

  // 2. Procedural Wheel-on-Rail Clatter (clack-clack)
  manageClatter(kmh) {
    if (kmh < 10) {
      if (this.clatterTimer) {
        clearInterval(this.clatterTimer);
        this.clatterTimer = null;
      }
      return;
    }

    // Interval between track expansion joint clatters in milliseconds (faster speed = faster intervals)
    const intervalMs = Math.max(250, 2000 - (kmh * 11));

    if (!this.clatterTimer) {
      this.playRailJointHit();
      this.clatterTimer = setInterval(() => {
        if (this.currentSpeed >= 10 && !this.isMuted) {
          this.playRailJointHit();
        }
      }, intervalMs);
    }
  }

  // Synthesize realistic dual metallic clack
  playRailJointHit() {
    if (!this.ctx || this.isMuted) return;

    const playClick = (delaySec, freq, volume) => {
      const now = this.ctx.currentTime + delaySec;
      
      // Noise burst for mechanical wheel contact
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(freq, now);
      bandpass.Q.setValueAtTime(3.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * (this.currentSpeed / 140), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    };

    // Front bogie joint hit
    playClick(0, 1800, 0.18);
    playClick(0.05, 1400, 0.12);

    // Rear bogie joint hit
    playClick(0.18, 1750, 0.14);
    playClick(0.23, 1350, 0.09);
  }

  // 3. Iconic Indian Railway Dual-Tone Pneumatic Horn (Vande Bharat / WAP-7)
  playHorn() {
    this.ensureContext();
    if (!this.ctx || this.isMuted || this.isHornPlaying) return;
    this.isHornPlaying = true;

    const now = this.ctx.currentTime;
    const hornDuration = 1.6;

    // Dual chime chords: D4# (311Hz) & F4# (370Hz) with overtones
    const frequencies = [311.13, 369.99, 622.25, 739.99];
    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0, now);
    hornGain.gain.linearRampToValueAtTime(0.28, now + 0.1);
    hornGain.gain.setValueAtTime(0.28, now + hornDuration - 0.3);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + hornDuration);

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx < 2 ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);

      osc.connect(filter);
      filter.connect(hornGain);
      osc.start(now);
      osc.stop(now + hornDuration);
    });

    hornGain.connect(this.masterGain);

    setTimeout(() => {
      this.isHornPlaying = false;
    }, hornDuration * 1000);
  }

  // 4. Station Announcement Bell / Chime (3-Tone IRCTC Chime)
  playStationChime() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const startTime = now + (i * 0.32);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  }

  // 5. Air Brake Release Squeal
  playBrakeHiss() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 1.8;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2800, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }
}

export const soundEngine = new RailSoundEngine();

