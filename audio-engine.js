// Persona 3 Reload Audio Engine
// Manages navigation sound effects, synthesized UI feedback, and background music

class AudioEngine {
  constructor() {
    this.musicAudio = null;
    this.navAudio = null;
    this.audioCtx = null;
    this.isMusicEnabled = true;
    this.isSFXEnabled = true;
    this.musicVolume = 0.35;
    this.sfxVolume = 0.5;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Load official navigation sound
      this.navAudio = new Audio('assets/sfx/navigation.wav');
      this.navAudio.volume = this.sfxVolume;

      // Load background music
      this.musicAudio = new Audio('assets/music/Color Your Night.mp3');
      this.musicAudio.loop = true;
      this.musicAudio.volume = this.musicVolume;

      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioContext initialization deferred until user gesture:', err);
    }
  }

  unlock() {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNav() {
    if (!this.isSFXEnabled) return;
    this.unlock();

    if (this.navAudio) {
      // Clone or reset to allow rapid fire navigation clicks
      const sound = this.navAudio.cloneNode();
      sound.volume = this.sfxVolume;
      sound.play().catch(() => {});
    } else {
      this.synthesizeClick();
    }
  }

  playConfirm() {
    if (!this.isSFXEnabled) return;
    this.unlock();

    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Vibrant P3R dual-tone chime
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6

    osc2.frequency.setValueAtTime(880.0, now + 0.04); // A5
    osc2.frequency.exponentialRampToValueAtTime(1760.0, now + 0.16); // A6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc1.start(now);
    osc2.start(now + 0.04);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  playCancel() {
    if (!this.isSFXEnabled) return;
    this.unlock();

    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gainNode = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);

    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // P3R Liquid Blot Surge (Water whoosh)
  playLiquidSwoosh() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.35);
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, now);
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.25);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.35, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    whiteNoise.start(now);
  }

  // P3R Double Ripple on Close
  playDoubleRipple() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    [0, 0.09].forEach((delay, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 520 : 420, now + delay);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 220 : 180, now + delay + 0.16);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    });
  }

  // Skills: Azure Elemental Burst
  playElementalBurst() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const freqs = [330, 440, 660, 880];
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.025);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + idx * 0.025 + 0.14);

      gain.gain.setValueAtTime(0, now + idx * 0.025);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, now + idx * 0.025 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.025);
      osc.stop(now + 0.4);
    });
  }

  // Profile: Biometric Laser Scanline Sweep
  playBiometricScan() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Projects: Metallic Razor Slash & Lock
  playBladeSlash() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, now);

    osc.frequency.setValueAtTime(3000, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Achievements: Elizabeth's Wax Stamp Impact Slam
  playStampImpact() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.25);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Experience: Velvet Room Harmonic Chime
  playVelvetChime() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.22, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.55);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.6);
    });
  }

  // System: Retro CRT Terminal Scan Chirp
  playTerminalBeep() {
    if (!this.isSFXEnabled || !this.audioCtx) return;
    this.unlock();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.setValueAtTime(1250, now + 0.05);

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  synthesizeClick() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  startMusic() {
    this.unlock();
    if (!this.isMusicEnabled || !this.musicAudio) return;
    this.musicAudio.play().catch(e => console.log('Autoplay blocked, waiting for user click'));
  }

  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
    }
  }

  toggleMusic(force) {
    this.isMusicEnabled = typeof force === 'boolean' ? force : !this.isMusicEnabled;
    if (this.isMusicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicEnabled;
  }

  toggleSFX(force) {
    this.isSFXEnabled = typeof force === 'boolean' ? force : !this.isSFXEnabled;
    return this.isSFXEnabled;
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicAudio) {
      this.musicAudio.volume = this.musicVolume;
    }
  }
}

export const audioEngine = new AudioEngine();
