// Persona 3 Reload Menu Controller & HUD Manager
// Handles kinetic menu rendering, keyboard/mouse selection, moon phase math, and modal transitions

import { audioEngine } from './audio-engine.js';
import { PROFILE_DATA } from './content-data.js';
import { p3rTransitions } from './p3r-transitions.js';

export const MENU_OPTIONS = [
  { id: 'skills', name: 'SKILLS', sub: 'スキル', desc: 'Inspect Technical Stack & Elemental Affinities', rotation: -25, offsetX: -60, offsetY: 55, zIndex: 1 },
  { id: 'profile', name: 'PROFILE', sub: 'プロフィール', desc: 'View Persona Stats, Bio & Parameters', rotation: -15, offsetX: 0, offsetY: 30, zIndex: 0 },
  { id: 'projects', name: 'PROJECTS', sub: 'プロジェクト', desc: 'View Equipped Systems, Applications & Artifacts', rotation: -20, offsetX: -50, offsetY: 35, zIndex: 1 },
  { id: 'achievements', name: 'ACHIEVEMENTS', sub: '実績', desc: 'Review Completed Quests, Awards & Milestones', rotation: -15, offsetX: -80, offsetY: 40, zIndex: 2 },
  { id: 'experience', name: 'EXPERIENCE', sub: '経歴', desc: 'Track Career Timeline & Social Links', rotation: 0, offsetX: 0, offsetY: 15, zIndex: 0 },
  { id: 'system', name: 'SYSTEM', sub: 'システム', desc: 'Configure Sound, Resume & Transmission Channels', rotation: 8, offsetX: -20, offsetY: 10, zIndex: 1 }
];

class MenuController {
  constructor() {
    this.selectedIndex = 0;
    this.activeModalId = null;
    this.container = document.getElementById('options-container');
    this.descEl = document.getElementById('option-description');
    this.sideIndexEl = document.getElementById('side-index-number');

    this.selectorPath = "M 24.853754, 93.31573 135.14625, 49.684266 114.14751, 97.331142 Z";
    this.selectorBackgroundPath = "M 12.7428765,95.50088 144.25712,47.499123 116.75625,95.465764 Z";
  }

  init() {
    this.renderMenu();
    this.bindEvents();
    this.updateHUDCalendar();
    this.updateMoonPhase();
    this.updateSelection(0, false);
  }

  renderMenu() {
    if (!this.container) return;
    this.container.innerHTML = '';

    MENU_OPTIONS.forEach((opt, i) => {
      const scaleVal = (opt.name.replace(/\s+/g, '').length * 0.48 + 1.6).toFixed(2);
      const selectorTransform = `translate(-60, -10) rotate(8, 0, 100) scale(${scaleVal}, 3)`;
      const colorClass = `color-btn-${(i + 2) % 3}`;

      const itemEl = document.createElement('div');
      itemEl.className = `option-item ${i === 0 ? 'selected' : ''}`;
      itemEl.id = `option-item-${i}`;
      itemEl.style.zIndex = opt.zIndex;

      itemEl.innerHTML = `
        <button class="option-hitbox" data-index="${i}" aria-label="${opt.name}: ${opt.desc}"></button>
        <svg class="option-svg" width="950" height="200" xmlns="http://www.w3.org/2000/svg"
             style="transform: translate(${opt.offsetX}px, ${opt.offsetY}px) rotate(${opt.rotation}deg);">
          <defs>
            <mask id="selector-mask-${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="950" height="200">
              <rect width="100%" height="100%" fill="black" />
              <g transform="${selectorTransform}" transform-origin="left center">
                <path fill="white" d="${this.selectorPath}" />
                <path class="pulsing-bg" fill="white" d="${this.selectorBackgroundPath}" />
              </g>
            </mask>
          </defs>

          <!-- Selected Ribbon Graphics -->
          <g class="selected-ribbon-group" transform="${selectorTransform}" transform-origin="left center" style="display: ${i === 0 ? 'block' : 'none'};">
            <path class="pulsing-bg" fill="#fd77d9" d="${this.selectorBackgroundPath}" />
            <path fill="#ffffff" d="${this.selectorPath}" />
          </g>

          <!-- Primary Text -->
          <text class="option-text-base ${colorClass}" x="150" y="120">
            ${opt.name}
          </text>

          <!-- Japanese Subtitle -->
          <text class="option-sub-text" x="${150 + opt.name.length * 36}" y="85" fill="#7de6fd">
            ${opt.sub}
          </text>

          <!-- Masked Red Highlight Overlay -->
          <g class="masked-red-group" mask="url(#selector-mask-${i})" style="display: ${i === 0 ? 'block' : 'none'};">
            <text class="option-text-red" x="150" y="120">
              ${opt.name}
            </text>
          </g>
        </svg>
      `;

      this.container.appendChild(itemEl);
    });
  }

  updateSelection(index, playSound = true) {
    if (index === this.selectedIndex && playSound) return;

    // Deselect previous
    const prevEl = document.getElementById(`option-item-${this.selectedIndex}`);
    if (prevEl) {
      prevEl.classList.remove('selected');
      const prevRibbon = prevEl.querySelector('.selected-ribbon-group');
      const prevMask = prevEl.querySelector('.masked-red-group');
      if (prevRibbon) prevRibbon.style.display = 'none';
      if (prevMask) prevMask.style.display = 'none';
    }

    this.selectedIndex = index;
    const currentOpt = MENU_OPTIONS[this.selectedIndex];

    // Select new
    const nextEl = document.getElementById(`option-item-${this.selectedIndex}`);
    if (nextEl) {
      nextEl.classList.add('selected');
      const nextRibbon = nextEl.querySelector('.selected-ribbon-group');
      const nextMask = nextEl.querySelector('.masked-red-group');
      if (nextRibbon) nextRibbon.style.display = 'block';
      if (nextMask) nextMask.style.display = 'block';
    }

    // Update bottom description
    if (this.descEl) {
      this.descEl.style.opacity = '0';
      this.descEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        this.descEl.textContent = currentOpt.desc;
        this.descEl.style.opacity = '1';
        this.descEl.style.transform = 'translateY(0)';
      }, 80);
    }

    // Update side index
    if (this.sideIndexEl) {
      this.sideIndexEl.textContent = `0${this.selectedIndex + 1}`;
    }

    if (playSound) {
      audioEngine.playNav();
    }
  }

  openSelectedModal(clickEvent = null) {
    const currentOpt = MENU_OPTIONS[this.selectedIndex];
    let originX = window.innerWidth * 0.35;
    let originY = window.innerHeight * 0.5;

    if (clickEvent && clickEvent.clientX && clickEvent.clientY) {
      originX = clickEvent.clientX;
      originY = clickEvent.clientY;
    } else {
      const el = document.getElementById(`option-item-${this.selectedIndex}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        originX = rect.left + rect.width * 0.4;
        originY = rect.top + rect.height * 0.5;
      }
    }

    this.openModal(currentOpt.id, originX, originY);
  }

  openModal(modalId, originX = window.innerWidth * 0.35, originY = window.innerHeight * 0.5) {
    this.activeModalId = modalId;
    audioEngine.playConfirm();

    const backdrop = document.getElementById('modal-backdrop');
    const titleEl = document.getElementById('modal-active-title');
    const subTitleEl = document.getElementById('modal-active-subtitle');
    const bodyEl = document.getElementById('modal-dynamic-body');

    const opt = MENU_OPTIONS.find(o => o.id === modalId);
    if (titleEl && opt) titleEl.textContent = opt.name;
    if (subTitleEl && opt) subTitleEl.textContent = `${opt.sub} // ARCHIVE`;

    if (bodyEl) {
      bodyEl.innerHTML = this.getModalContent(modalId);
      if (modalId === 'profile') {
        this.renderRadarChart();
      }
    }

    // Trigger P3R Procedural Wavy Liquid Blot Transition from the clicked item
    p3rTransitions.triggerOpen(modalId, originX, originY, () => {
      if (backdrop) {
        backdrop.classList.add('active');
      }
    });
  }

  closeModal() {
    if (!this.activeModalId) return;
    this.activeModalId = null;

    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
    }

    // Trigger P3R Concentric Double-Circle Ripple on close
    p3rTransitions.triggerClose(() => {
      // Modal completely closed
    });
  }

  getModalContent(modalId) {
    switch (modalId) {
      case 'profile':
        return this.renderProfileContent();
      case 'skills':
        return this.renderSkillsContent();
      case 'projects':
        return this.renderProjectsContent();
      case 'achievements':
        return this.renderAchievementsContent();
      case 'experience':
        return this.renderExperienceContent();
      case 'system':
        return this.renderSystemContent();
      default:
        return `<p>Content for ${modalId}</p>`;
    }
  }

  renderProfileContent() {
    const c = PROFILE_DATA.character;
    return `
      <div class="profile-grid">
        <div class="profile-card">
          <div class="profile-header-card">
            <h2 class="profile-name">${c.name}</h2>
            <div class="profile-role">${c.title}</div>
            <div class="profile-meta-row">
              <span>ARCANA: <strong>${c.arcana}</strong></span>
              <span>LEVEL: <strong>Lv. ${c.level}</strong></span>
              <span>STATUS: <strong>${c.status}</strong></span>
            </div>
          </div>
          <p class="profile-bio">${c.bio}</p>
          <div class="social-stats-list">
            ${c.socialStats.map(s => `
              <div class="social-stat-item">
                <div class="stat-header">
                  <span>${s.name} // ${s.title}</span>
                  <span class="stat-stars">${'★'.repeat(s.level)}</span>
                </div>
                <div class="stat-desc">${s.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="radar-container">
          <div class="radar-title">DEVELOPER PARAMETERS</div>
          <div id="radar-chart-mount"></div>
        </div>
      </div>
    `;
  }

  renderRadarChart() {
    const mount = document.getElementById('radar-chart-mount');
    if (!mount) return;

    const params = PROFILE_DATA.character.parameters;
    const numPoints = params.length;
    const cx = 160;
    const cy = 160;
    const r = 110;

    let points = [];
    let bgPolygons = '';

    // Concentric grid polygons
    [0.25, 0.5, 0.75, 1].forEach(level => {
      let gridPts = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r * level;
        const y = cy + Math.sin(angle) * r * level;
        gridPts.push(`${x},${y}`);
      }
      bgPolygons += `<polygon points="${gridPts.join(' ')}" fill="none" stroke="rgba(125,230,253,0.2)" stroke-width="1.2" />`;
    });

    // Data polygon
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
      const valRatio = params[i].value / 100;
      const x = cx + Math.cos(angle) * r * valRatio;
      const y = cy + Math.sin(angle) * r * valRatio;
      points.push(`${x},${y}`);
    }

    // Labels
    let labelsSvg = '';
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
      const lx = cx + Math.cos(angle) * (r + 28);
      const ly = cy + Math.sin(angle) * (r + 24);
      labelsSvg += `
        <text x="${lx}" y="${ly}" fill="#7de6fd" font-size="11" font-family="var(--font-skip)" text-anchor="middle" dominant-baseline="central">
          ${params[i].name} (${params[i].value})
        </text>
      `;
    }

      mount.innerHTML = `
        <svg class="radar-svg" viewBox="0 0 320 320">
          ${bgPolygons}
          <polygon id="profile-radar-polygon" data-target-points="${points.join(' ')}" points="${points.join(' ')}" fill="rgba(0, 229, 255, 0.4)" stroke="#00e5ff" stroke-width="2.5" />
          ${labelsSvg}
        </svg>
      `;
  }

  renderSkillsContent() {
    return `
      <div class="skills-grid">
        ${PROFILE_DATA.skills.map(s => `
          <div class="skill-card">
            <div class="skill-top-bar">
              <span class="skill-element-badge" style="color: ${s.elementColor}; border-color: ${s.elementColor};">
                ${s.category}
              </span>
              <span class="skill-cost">${s.cost}</span>
            </div>
            <div class="skill-name">${s.name}</div>
            <div class="skill-desc">${s.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderProjectsContent() {
    return `
      <div class="projects-grid">
        ${PROFILE_DATA.projects.map(p => `
          <div class="project-card">
            <div class="project-top">
              <span class="project-rarity">${p.rarity}</span>
              <span class="project-category">${p.category}</span>
            </div>
            <div class="project-title">${p.icon} ${p.title}</div>
            <p class="project-summary">${p.summary}</p>
            <div class="project-tech-tags">
              ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
            <div class="project-stats-row">
              ${Object.entries(p.stats).map(([k, v]) => `<span>${k}: ${v}</span>`).join(' | ')}
            </div>
            <div class="project-actions">
              <a href="${p.liveUrl}" target="_blank" class="project-btn">EQUIP // DEMO</a>
              <a href="${p.githubUrl}" target="_blank" class="project-btn project-btn-secondary">CODE // GITHUB</a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAchievementsContent() {
    return `
      <div class="achievements-list">
        ${PROFILE_DATA.achievements.map(a => `
          <div class="achievement-card">
            <div class="achievement-info">
              <div class="achievement-id">${a.id} // CLIENT: ${a.client}</div>
              <div class="achievement-title">${a.title}</div>
              <div class="achievement-desc">${a.description}</div>
              <div class="achievement-meta">
                <span>REWARD: ${a.reward}</span>
                <span>DATE: ${a.date}</span>
              </div>
            </div>
            <div class="stamp-completed">${a.status}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderExperienceContent() {
    return `
      <div class="experience-timeline">
        ${PROFILE_DATA.experience.map(e => `
          <div class="exp-item">
            <div class="exp-header">
              <div class="exp-role">${e.role}</div>
              <div class="exp-rank">${e.rank}</div>
            </div>
            <div class="exp-org">${e.organization} // ${e.period}</div>
            <ul class="exp-points">
              ${e.points.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderSystemContent() {
    const s = PROFILE_DATA.system;
    return `
      <div class="system-grid">
        <div class="system-card">
          <div class="system-title">AUDIO & INTERFACE CONFIG</div>
          <div class="system-toggle-row">
            <span>BGM // MUSIC</span>
            <button class="setting-toggle-btn" id="modal-music-btn" style="width: auto; padding: 0.4rem 1.2rem;">
              <span class="setting-badge" id="modal-music-badge">${audioEngine.isMusicEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
          <div class="system-toggle-row">
            <span>SFX // NAVIGATION CHIMES</span>
            <button class="setting-toggle-btn" id="modal-sfx-btn" style="width: auto; padding: 0.4rem 1.2rem;">
              <span class="setting-badge" id="modal-sfx-badge">${audioEngine.isSFXEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
          <p style="font-family: var(--font-new-rodin); font-size: 0.9rem; color: var(--color-button-2); margin-top: 1rem;">
            TRACK: ${s.musicTrack}
          </p>
        </div>

        <div class="system-card">
          <div class="system-title">TRANSMISSION FREQUENCIES</div>
          <div class="contacts-list">
            ${s.contacts.map(c => `
              <a href="${c.link}" target="_blank" class="contact-link">
                <span>${c.icon} ${c.name}</span>
                <span style="color: var(--color-button-2); font-size: 0.9rem;">${c.value}</span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (this.activeModalId) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          this.closeModal();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        const next = (this.selectedIndex + 1) % MENU_OPTIONS.length;
        this.updateSelection(next);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        const prev = (this.selectedIndex - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length;
        this.updateSelection(prev);
      } else if (e.key === 'Enter' || e.key === ' ') {
        this.openSelectedModal();
      }
    });

    // Hitbox mouse events
    if (this.container) {
      this.container.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.option-hitbox');
        if (btn) {
          const idx = parseInt(btn.dataset.index, 10);
          this.updateSelection(idx);
        }
      });

      this.container.addEventListener('click', (e) => {
        const btn = e.target.closest('.option-hitbox');
        if (btn) {
          this.openSelectedModal(e);
        }
      });
    }

    // Modal close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Modal background click
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal();
        }
      });
    }

    // Audio toggles in HUD
    const musicBtn = document.getElementById('hud-toggle-music');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        const state = audioEngine.toggleMusic();
        musicBtn.classList.toggle('muted', !state);
      });
    }

    const sfxBtn = document.getElementById('hud-toggle-sfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        const state = audioEngine.toggleSFX();
        sfxBtn.classList.toggle('muted', !state);
      });
    }

    // Modal audio toggles delegate
    document.addEventListener('click', (e) => {
      if (e.target.closest('#modal-music-btn')) {
        const state = audioEngine.toggleMusic();
        const badge = document.getElementById('modal-music-badge');
        if (badge) badge.textContent = state ? 'ON' : 'OFF';
        const hudMusic = document.getElementById('hud-toggle-music');
        if (hudMusic) hudMusic.classList.toggle('muted', !state);
      }
      if (e.target.closest('#modal-sfx-btn')) {
        const state = audioEngine.toggleSFX();
        const badge = document.getElementById('modal-sfx-badge');
        if (badge) badge.textContent = state ? 'ON' : 'OFF';
        const hudSfx = document.getElementById('hud-toggle-sfx');
        if (hudSfx) hudSfx.classList.toggle('muted', !state);
      }
    });
  }

  updateHUDCalendar() {
    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const monthStr = months[now.getMonth()];
    const dateNum = now.getDate();
    const dayStr = days[now.getDay()];

    const hour = now.getHours();
    let slot = 'AFTER SCHOOL';
    if (hour >= 5 && hour < 12) slot = 'MORNING';
    else if (hour >= 12 && hour < 15) slot = 'AFTERNOON';
    else if (hour >= 15 && hour < 18) slot = 'AFTER SCHOOL';
    else if (hour >= 18 && hour < 24) slot = 'EVENING';
    else slot = 'DARK HOUR';

    const dateMonthEl = document.getElementById('hud-date-month');
    const dateDayEl = document.getElementById('hud-date-day');
    const timeSlotEl = document.getElementById('hud-time-slot');

    if (dateMonthEl) dateMonthEl.textContent = `${monthStr} ${dateNum}`;
    if (dateDayEl) dateDayEl.textContent = dayStr;
    if (timeSlotEl) timeSlotEl.textContent = slot;
  }

  updateMoonPhase() {
    // Astronomical lunar phase calculation
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Julian date calculation
    let c = 0, e = 0, jd = 0, b = 0;
    if (month < 3) {
      c = -1;
      e = month + 12;
    } else {
      c = 0;
      e = month;
    }
    const a = Math.floor((year + c) / 100);
    b = 2 - a + Math.floor(a / 4);
    jd = Math.floor(365.25 * (year + c + 4716)) + Math.floor(30.6001 * (e + 1)) + day + b - 1524.5;

    // Synodic month = 29.53058867 days, epoch Jan 6 2000
    const daysSinceNew = (jd - 2451549.5) % 29.53058867;
    const moonAge = (daysSinceNew + 29.53058867) % 29.53058867;

    const daysToFull = Math.round((14.765 - moonAge + 29.53058867) % 29.53058867);

    let phaseName = 'WAXING GIBBOUS';
    if (moonAge < 1.845) phaseName = 'NEW MOON';
    else if (moonAge < 5.536) phaseName = 'WAXING CRESCENT';
    else if (moonAge < 9.228) phaseName = 'FIRST QUARTER';
    else if (moonAge < 12.919) phaseName = 'WAXING GIBBOUS';
    else if (moonAge < 16.611) phaseName = 'FULL MOON';
    else if (moonAge < 20.302) phaseName = 'WANING GIBBOUS';
    else if (moonAge < 23.993) phaseName = 'THIRD QUARTER';
    else if (moonAge < 27.685) phaseName = 'WANING CRESCENT';
    else phaseName = 'NEW MOON';

    const moonValEl = document.getElementById('hud-moon-value');
    if (moonValEl) {
      if (phaseName === 'FULL MOON') {
        moonValEl.textContent = 'FULL MOON TODAY';
      } else {
        moonValEl.textContent = `FULL MOON IN ${daysToFull} DAYS`;
      }
    }
  }
}

export const menuController = new MenuController();
