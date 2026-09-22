// Persona 3 Reload Transition Engine (P3R v2)
// Implements procedural liquid blot shaders, double-circle ripples,
// and specialized entry choreography for every menu selection

import { audioEngine } from './audio-engine.js';

class P3RTransitionManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isTransitioning = false;
    this.confettiParticles = [];
    this.visualizerBars = [];
    this.animFrameId = null;

    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.getElementById('p3r-transition-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'p3r-transition-canvas';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // =========================================================================
  // GLOBAL TRANSITIONS
  // =========================================================================

  /**
   * Procedural Wavy Liquid Blot Shader Transition (Triggered on Menu Select)
   * Originates from the clicked menu item coordinates and expands across the screen
   */
  triggerOpen(modalId, originX = window.innerWidth * 0.35, originY = window.innerHeight * 0.5, onPeak) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    audioEngine.playLiquidSwoosh();

    const maxRadius = Math.hypot(
      Math.max(originX, this.width - originX),
      Math.max(originY, this.height - originY)
    ) * 1.15;

    const duration = 480; // ms
    const startTime = performance.now();
    let peakTriggered = false;

    const animateBlot = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const t = 1 - Math.pow(1 - progress, 3);

      this.ctx.clearRect(0, 0, this.width, this.height);

      const currentRadius = maxRadius * t;

      // Draw secondary trailing water wave (cyan flare)
      this.drawWavyBlot(originX, originY, currentRadius * 1.06, elapsed, 'rgba(0, 229, 255, 0.4)', '#00e5ff', 8);

      // Draw primary deep sea liquid blot
      this.drawWavyBlot(originX, originY, currentRadius, elapsed + 100, '#021338', '#16cffb', 5);

      if (progress >= 0.65 && !peakTriggered) {
        peakTriggered = true;
        if (onPeak) onPeak();
        this.orchestrateOptionEntrance(modalId);
      }

      if (progress < 1) {
        requestAnimationFrame(animateBlot);
      } else {
        // Fade out transition canvas once modal has fully materialized
        let fadeAlpha = 1;
        const fadeCanvas = () => {
          fadeAlpha -= 0.1;
          this.ctx.clearRect(0, 0, this.width, this.height);
          if (fadeAlpha > 0) {
            this.ctx.globalAlpha = fadeAlpha;
            this.ctx.fillStyle = '#021338';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.globalAlpha = 1;
            requestAnimationFrame(fadeCanvas);
          } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.isTransitioning = false;
          }
        };
        requestAnimationFrame(fadeCanvas);
      }
    };

    requestAnimationFrame(animateBlot);
  }

  drawWavyBlot(cx, cy, baseRadius, timeMs, fillColor, strokeColor, strokeWidth) {
    if (baseRadius <= 1) return;

    this.ctx.save();
    this.ctx.beginPath();

    const points = 72;
    const waveCount = 6;
    const amplitude = Math.min(45, baseRadius * 0.12);

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wave = Math.sin(angle * waveCount + timeMs * 0.008) * amplitude
                 + Math.cos(angle * 3 - timeMs * 0.005) * (amplitude * 0.4);
      const r = Math.max(0, baseRadius + wave);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();

    if (strokeColor && strokeWidth > 0) {
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.shadowColor = strokeColor;
      this.ctx.shadowBlur = 18;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Double-Circle Concentric Ripple Transition (Triggered on Back / ESC)
   */
  triggerClose(onComplete) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    audioEngine.playDoubleRipple();

    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxR = Math.hypot(cx, cy) * 1.1;
    const duration = 380;
    const startTime = performance.now();

    const animateRipples = (now) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - p, 2.5);

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Ripple 1
      const r1 = maxR * ease;
      const alpha1 = Math.max(0, 1 - ease);
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(0, 229, 255, ${alpha1 * 0.8})`;
      this.ctx.lineWidth = 14 * alpha1;
      this.ctx.shadowColor = '#00e5ff';
      this.ctx.shadowBlur = 20;
      this.ctx.stroke();

      // Ripple 2 (staggered delay)
      if (p > 0.15) {
        const ease2 = 1 - Math.pow(1 - ((p - 0.15) / 0.85), 2.5);
        const r2 = maxR * ease2;
        const alpha2 = Math.max(0, 1 - ease2);
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r2, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha2 * 0.9})`;
        this.ctx.lineWidth = 8 * alpha2;
        this.ctx.stroke();
      }

      if (p < 1) {
        requestAnimationFrame(animateRipples);
      } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.isTransitioning = false;
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateRipples);
  }

  // =========================================================================
  // PER-OPTION CHOREOGRAPHY
  // =========================================================================

  orchestrateOptionEntrance(modalId) {
    const modalContainer = document.querySelector('.modal-container');
    if (!modalContainer) return;

    switch (modalId) {
      case 'skills':
        this.orchestrateSkills(modalContainer);
        break;
      case 'profile':
        this.orchestrateProfile(modalContainer);
        break;
      case 'projects':
        this.orchestrateProjects(modalContainer);
        break;
      case 'achievements':
        this.orchestrateAchievements(modalContainer);
        break;
      case 'experience':
        this.orchestrateExperience(modalContainer);
        break;
      case 'system':
        this.orchestrateSystem(modalContainer);
        break;
    }
  }

  // 1. SKILLS: ELEMENTAL GLYPH DETONATION
  orchestrateSkills(container) {
    audioEngine.playElementalBurst();

    let burstOverlay = container.querySelector('.skills-burst-container');
    if (!burstOverlay) {
      burstOverlay = document.createElement('div');
      burstOverlay.className = 'skills-burst-container';
      container.appendChild(burstOverlay);
    }
    burstOverlay.innerHTML = '';

    const glyphs = [
      { name: 'SLASH', color: '#ff3366', angle: 0 },
      { name: 'STRIKE', color: '#ffaa00', angle: 45 },
      { name: 'PIERCE', color: '#ffea00', angle: 90 },
      { name: 'FIRE', color: '#ff4500', angle: 135 },
      { name: 'ICE', color: '#00e5ff', angle: 180 },
      { name: 'ELEC', color: '#76ff03', angle: 225 },
      { name: 'WIND', color: '#00e676', angle: 270 },
      { name: 'LIGHT', color: '#ffffff', angle: 315 }
    ];

    const dist = Math.min(260, window.innerWidth * 0.2);

    glyphs.forEach(g => {
      const rad = (g.angle * Math.PI) / 180;
      const tx = Math.cos(rad) * dist;
      const ty = Math.sin(rad) * dist;

      const el = document.createElement('div');
      el.className = 'elemental-glyph glyph-active';
      el.style.left = '50%';
      el.style.top = '45%';
      el.style.backgroundColor = g.color;
      el.style.setProperty('--tx', `${tx}px`);
      el.style.setProperty('--ty', `${ty}px`);
      el.textContent = g.name.charAt(0);
      burstOverlay.appendChild(el);
    });

    // Stagger in skill cards
    const cards = container.querySelectorAll('.skill-card');
    cards.forEach((card, idx) => {
      card.classList.add('skill-card-animate');
      card.style.animationDelay = `${0.1 + idx * 0.04}s`;
    });

    setTimeout(() => {
      if (burstOverlay) burstOverlay.innerHTML = '';
    }, 900);
  }

  // 2. PROFILE: BIOMETRIC SCANLINE & DYNAMIC RADAR UNFURL
  orchestrateProfile(container) {
    audioEngine.playBiometricScan();

    // Laser Sweep
    let laser = container.querySelector('.biometric-laser-sweep');
    if (!laser) {
      laser = document.createElement('div');
      laser.className = 'biometric-laser-sweep';
      container.appendChild(laser);
    }
    laser.classList.remove('laser-active');
    void laser.offsetWidth; // trigger reflow
    laser.classList.add('laser-active');

    // Dynamic Parameter Radar Chart Spring Animation
    setTimeout(() => {
      this.animateRadarChart();
    }, 150);

    // Social stat stars pop-in
    const starContainers = container.querySelectorAll('.stat-stars');
    starContainers.forEach(sc => {
      const text = sc.textContent;
      sc.innerHTML = '';
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'star-animated';
        span.style.animationDelay = `${0.2 + i * 0.08}s`;
        span.textContent = char;
        sc.appendChild(span);
      });
    });
  }

  animateRadarChart() {
    const polygon = document.getElementById('profile-radar-polygon');
    if (!polygon) return;

    polygon.classList.add('radar-polygon-anim');

    // Spring values from center (150, 150) to full target
    const targetPoints = polygon.getAttribute('data-target-points') || polygon.getAttribute('points');
    polygon.setAttribute('data-target-points', targetPoints);

    const centerPoints = "150,150 150,150 150,150 150,150 150,150 150,150";
    polygon.setAttribute('points', centerPoints);

    requestAnimationFrame(() => {
      polygon.setAttribute('points', targetPoints);
    });
  }

  // 3. PROJECTS: DIAGONAL BLADE SLASH & CONFETTI SHARDS
  orchestrateProjects(container) {
    audioEngine.playBladeSlash();

    // Blade Slash Gleam
    let blade = document.querySelector('.blade-gleam-line');
    if (!blade) {
      const overlay = document.createElement('div');
      overlay.className = 'blade-slash-overlay';
      blade = document.createElement('div');
      blade.className = 'blade-gleam-line';
      overlay.appendChild(blade);
      document.body.appendChild(overlay);
    }
    blade.classList.remove('blade-slash-active');
    void blade.offsetWidth;
    blade.classList.add('blade-slash-active');

    // Additive Polygon Confetti Shards
    this.spawnPolygonConfetti();

    // Stagger in project cards
    const cards = container.querySelectorAll('.project-card');
    cards.forEach((card, idx) => {
      card.classList.add('project-card-animate');
      card.style.animationDelay = `${0.08 + idx * 0.05}s`;
    });
  }

  spawnPolygonConfetti() {
    const count = 40;
    const colors = ['#00e5ff', '#ffffff', '#fd77d9', '#16cffb', '#7de6fd'];
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * this.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.15,
        size: 8 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.9,
        type: Math.random() > 0.5 ? 'triangle' : 'rhombus'
      });
    }

    const startTime = performance.now();
    const duration = 1400;

    const animateConfetti = (now) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return;
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.alpha = Math.max(0, 0.95 - (elapsed / duration));

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;

        this.ctx.beginPath();
        if (p.type === 'triangle') {
          this.ctx.moveTo(0, -p.size);
          this.ctx.lineTo(p.size * 0.86, p.size * 0.5);
          this.ctx.lineTo(-p.size * 0.86, p.size * 0.5);
        } else {
          this.ctx.moveTo(0, -p.size);
          this.ctx.lineTo(p.size * 0.6, 0);
          this.ctx.lineTo(0, p.size);
          this.ctx.lineTo(-p.size * 0.6, 0);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      });

      requestAnimationFrame(animateConfetti);
    };

    requestAnimationFrame(animateConfetti);
  }

  // 4. ACHIEVEMENTS: VELVET BUTTERFLY & RED STAMP SLAM
  orchestrateAchievements(container) {
    // 1. Velvet Butterfly Flight
    let stage = document.querySelector('.velvet-butterfly-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.className = 'velvet-butterfly-stage';
      document.body.appendChild(stage);
    }
    stage.innerHTML = `
      <div class="velvet-butterfly butterfly-active">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <g class="butterfly-wing" fill="#00e5ff" opacity="0.85">
            <!-- Left Wing -->
            <path d="M 50,50 Q 20,10 5,30 Q -5,60 50,65 Z" />
            <!-- Right Wing -->
            <path d="M 50,50 Q 80,10 95,30 Q 105,60 50,65 Z" />
          </g>
          <!-- Body -->
          <ellipse cx="50" cy="50" rx="3" ry="16" fill="#ffffff" />
        </svg>
      </div>
    `;

    // 2. Physical Stamp Slam & Screen Shake
    setTimeout(() => {
      audioEngine.playStampImpact();

      // Screen rumble
      container.classList.remove('screen-shake-active');
      void container.offsetWidth;
      container.classList.add('screen-shake-active');

      // Animate completed stamps
      const stamps = container.querySelectorAll('.achievement-badge-completed');
      stamps.forEach((s, idx) => {
        s.classList.add('stamp-slam-effect');
        s.style.animationDelay = `${idx * 0.06}s`;
      });
    }, 420);
  }

  // 5. EXPERIENCE: 3D CASCADING TAROT FAN-OUT
  orchestrateExperience(container) {
    audioEngine.playVelvetChime();

    const timelineItems = container.querySelectorAll('.exp-item');
    timelineItems.forEach((item, idx) => {
      item.classList.add('tarot-card-3d');
      item.style.animationDelay = `${0.1 + idx * 0.08}s`;
    });
  }

  // 6. SYSTEM: CRT SCANLINE & LIVE AUDIO EQUALIZER
  orchestrateSystem(container) {
    audioEngine.playTerminalBeep();

    const systemGrid = container.querySelector('.system-grid');
    if (systemGrid) {
      systemGrid.classList.add('telemetry-grid');
    }

    // Dynamic Visualizer Bars
    let vizContainer = container.querySelector('#p3r-audio-visualizer');
    if (!vizContainer) {
      const card = container.querySelector('.system-card');
      if (card) {
        vizContainer = document.createElement('div');
        vizContainer.id = 'p3r-audio-visualizer';
        vizContainer.style.cssText = 'display: flex; align-items: flex-end; height: 36px; margin-top: 1rem; gap: 3px;';
        for (let i = 0; i < 20; i++) {
          const bar = document.createElement('div');
          bar.className = 'system-visualizer-bar';
          bar.style.height = `${8 + Math.random() * 20}px`;
          vizContainer.appendChild(bar);
        }
        card.appendChild(vizContainer);
      }
    }

    if (vizContainer) {
      const bars = vizContainer.querySelectorAll('.system-visualizer-bar');
      const updateBars = () => {
        if (!document.getElementById('p3r-audio-visualizer')) return;
        bars.forEach((b, i) => {
          const wave = Math.sin(Date.now() * 0.008 + i * 0.4) * 0.5 + 0.5;
          b.style.height = `${6 + wave * 26}px`;
        });
        this.animFrameId = requestAnimationFrame(updateBars);
      };
      updateBars();
    }
  }
}

export const p3rTransitions = new P3RTransitionManager();