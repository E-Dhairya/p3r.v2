// Persona 3 Reload Portfolio Main Entry Point

import { audioEngine } from './audio-engine.js';
import { initWaterCanvas } from './canvas-background.js';
import { menuController } from './menu-controller.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas particle layer
  initWaterCanvas();

  // Initialize menu controller
  menuController.init();

  const welcomeOverlay = document.getElementById('welcome-overlay');
  const enterBtn = document.getElementById('welcome-enter-btn');
  const toggleMusicBtn = document.getElementById('toggle-init-music');
  const toggleSfxBtn = document.getElementById('toggle-init-sfx');
  const musicBadge = document.getElementById('init-music-badge');
  const sfxBadge = document.getElementById('init-sfx-badge');
  const bgVideo = document.getElementById('p3r-bg-video');

  // Welcome settings toggles
  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener('click', () => {
      const state = audioEngine.toggleMusic();
      if (musicBadge) musicBadge.textContent = state ? 'ON' : 'OFF';
    });
  }

  if (toggleSfxBtn) {
    toggleSfxBtn.addEventListener('click', () => {
      const state = audioEngine.toggleSFX();
      if (sfxBadge) sfxBadge.textContent = state ? 'ON' : 'OFF';
    });
  }

  // Enter experience handler
  function startExperience() {
    audioEngine.unlock();
    audioEngine.playConfirm();

    // Start background video
    if (bgVideo) {
      bgVideo.play().catch(err => console.log('Video play prevented:', err));
    }

    // Start BGM
    audioEngine.startMusic();

    // Hide welcome overlay
    if (welcomeOverlay) {
      welcomeOverlay.classList.add('hidden');
    }
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', startExperience);
  }

  window.addEventListener('keydown', (e) => {
    if (welcomeOverlay && !welcomeOverlay.classList.contains('hidden')) {
      if (e.key === 'Enter' || e.key === ' ') {
        startExperience();
      }
    }
  });
});
