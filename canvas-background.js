// Persona 3 Reload Background & Particle System
// Provides an interactive aquatic particle layer and parallax effect over the authentic background video

class WaterCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.bubbles = [];
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;

    this.resize();
    this.initElements();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initElements() {
    this.particles = [];
    this.bubbles = [];

    // Ambient shimmering particles
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.6 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Oxygen bubbles
    for (let i = 0; i < 18; i++) {
      this.bubbles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 5 + 2,
        speedY: Math.random() * 1.2 + 0.6,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        wobbleAmp: Math.random() * 3 + 1,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initElements();
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;

      // Parallax update on background video and container
      const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      const bgVideo = document.getElementById('p3r-bg-video');
      if (bgVideo) {
        bgVideo.style.transform = `scale(1.05) translate(${deltaX * -12}px, ${deltaY * -10}px)`;
      }

      const sideNumber = document.getElementById('side-index-number');
      if (sideNumber) {
        sideNumber.style.transform = `rotate(90deg) translate(${deltaY * 15}px, ${deltaX * -15}px)`;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render shimmering dust particles
    for (let p of this.particles) {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * 0.3;
      p.phase += 0.02;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(125, 230, 253, ${p.opacity * (0.6 + Math.sin(p.phase) * 0.4)})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#00e5ff';
      this.ctx.fill();
    }

    // Render rising aquatic bubbles
    this.ctx.shadowBlur = 0;
    for (let b of this.bubbles) {
      b.y -= b.speedY;
      b.phase += b.wobbleSpeed;
      const curX = b.x + Math.sin(b.phase) * b.wobbleAmp;

      // Mouse deflection
      const dx = curX - this.mouseX;
      const dy = b.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        b.x += (dx / dist) * 2;
      }

      if (b.y < -20) {
        b.y = this.height + 20;
        b.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(curX, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity})`;
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();

      // Bubble highlight spot
      this.ctx.beginPath();
      this.ctx.arc(curX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.9})`;
      this.ctx.fill();
    }
  }
}

export function initWaterCanvas() {
  return new WaterCanvas('water-overlay-canvas');
}
