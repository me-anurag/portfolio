// ===== PORTFOLIO APP =====
class PortfolioApp {
  constructor() {
    this.book = new BookEngine();

    this.pages = [
      { id: 'home',         label: 'Home',         icon: '<i class="fa-solid fa-house"></i>',            file: 'pages/home.html' },
      { id: 'about',        label: 'About',        icon: '<i class="fa-solid fa-user"></i>',             file: 'pages/about.html' },
      { id: 'skills',       label: 'Skills',       icon: '<i class="fa-solid fa-bolt"></i>',             file: 'pages/skills.html' },
      { id: 'projects',     label: 'Projects',     icon: '<i class="fa-solid fa-diagram-project"></i>',  file: 'pages/projects.html' },
      { id: 'certificates', label: 'Certificates', icon: '<i class="fa-solid fa-award"></i>',            file: 'pages/certificates.html' },
      { id: 'training',     label: 'Training',     icon: '<i class="fa-solid fa-bullseye"></i>',         file: 'pages/training.html' },
      { id: 'education',    label: 'Education',    icon: '<i class="fa-solid fa-graduation-cap"></i>',   file: 'pages/education.html' },
      { id: 'contact',      label: 'Contact',      icon: '<i class="fa-solid fa-envelope"></i>',         file: 'pages/contact.html' },
    ];

    this.init();
  }

  async init() {
    const pageData = await Promise.all(
      this.pages.map(async (p) => {
        try {
          const res = await fetch(p.file);
          if (!res.ok) throw new Error('Not found');
          const content = await res.text();
          return { ...p, content };
        } catch (e) {
          return { ...p, content: `<div class="page-inner"><p style="color:var(--text-muted);padding:20px;">Could not load ${p.label} page.</p></div>` };
        }
      })
    );

    this.buildSidebar(pageData);
    this.book.setPages(pageData);
    await this.book.init();
    this.bindArrows();
    this.bindKeyboard();
    this.book.triggerPageAnimations(0);
    startTypewriter();

    setTimeout(() => {
      const loader = document.getElementById('loading-screen');
      if (loader) loader.classList.add('hidden');
    }, 1600);
  }

  buildSidebar(pageData) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = '<div class="sidebar-section-label">Navigation</div>';

    pageData.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'sidebar-item' + (i === 0 ? ' active' : '');
      item.dataset.index = i;
      item.innerHTML = `
        <div class="si-icon">${p.icon}</div>
        <span>${p.label}</span>
        <span class="si-num">0${i + 1}</span>
      `;
      item.addEventListener('click', () => this.goToPage(i));
      sidebar.appendChild(item);
    });

    const hint = document.createElement('div');
    hint.innerHTML = `
      <div class="sidebar-divider"></div>
      <div style="padding:10px 10px 4px;">
        <div class="kbd-hint">
          <span class="kbd">&#8592;</span>
          <span class="kbd">&#8594;</span>
          <span style="margin-left:2px;">Navigate</span>
        </div>
      </div>
    `;
    sidebar.appendChild(hint);
  }

  updateSidebar(index) {
    document.querySelectorAll('.sidebar-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  goToPage(index) {
    if (index === this.book.currentPage) return;
    this.book.goTo(index);
    this.updateSidebar(index);
  }

  bindArrows() {
    const prev = document.getElementById('arrow-prev');
    const next = document.getElementById('arrow-next');

    prev?.addEventListener('click', () => {
      const newIdx = this.book.currentPage - 1;
      if (newIdx >= 0) this.goToPage(newIdx);
    });

    next?.addEventListener('click', () => {
      const newIdx = this.book.currentPage + 1;
      if (newIdx < this.book.totalPages) this.goToPage(newIdx);
    });
  }

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Don't hijack keys when lightbox is open
      if (document.getElementById('cert-lightbox')?.classList.contains('open')) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const newIdx = this.book.currentPage + 1;
        if (newIdx < this.book.totalPages) this.goToPage(newIdx);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const newIdx = this.book.currentPage - 1;
        if (newIdx >= 0) this.goToPage(newIdx);
      }
    });
  }
}


// ===== TYPEWRITER =====
// Uses plain text only — slicing HTML strings breaks mid-tag
const ROLES = [
  'AI Engineer',
  'ML Enthusiast',
  'Software Developer',
  'Problem Solver',
  'CSE Student @ LPU',
];

let twIndex = 0, twCharIndex = 0, twDeleting = false, twTimer = null;

function startTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  if (twTimer) clearTimeout(twTimer);
  twIndex = 0;
  twCharIndex = 0;
  twDeleting = false;
  typeStep(el);
}

function typeStep(el) {
  const current = ROLES[twIndex % ROLES.length];

  if (!twDeleting) {
    twCharIndex++;
    el.textContent = current.slice(0, twCharIndex);
    if (twCharIndex === current.length) {
      twDeleting = true;
      twTimer = setTimeout(() => typeStep(el), 1800);
      return;
    }
  } else {
    twCharIndex--;
    el.textContent = current.slice(0, twCharIndex);
    if (twCharIndex === 0) {
      twDeleting = false;
      twIndex++;
    }
  }

  twTimer = setTimeout(() => typeStep(el), twDeleting ? 55 : 85);
}

window.startTypewriter = startTypewriter;


// ===== CERTIFICATE LIGHTBOX =====
function openCert(imgSrc, title) {
  const lb  = document.getElementById('cert-lightbox');
  const img = document.getElementById('cert-lightbox-img');
  const ph  = document.getElementById('cert-lightbox-placeholder');
  const ttl = document.getElementById('cert-lightbox-title');
  const dl  = document.getElementById('cert-lightbox-download');

  if (!lb || !img || !ph || !ttl || !dl) return;

  ttl.textContent = title;
  img.classList.remove('loaded');
  ph.classList.remove('show');
  img.src = '';

  img.onload  = () => { img.classList.add('loaded'); ph.classList.remove('show'); };
  img.onerror = () => { img.classList.remove('loaded'); ph.classList.add('show'); };

  img.src = imgSrc;
  dl.href = imgSrc;
  dl.download = title.replace(/[^a-z0-9]/gi, '_') + '.jpg';

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCert(event, force) {
  const lb = document.getElementById('cert-lightbox');
  if (!lb) return;
  if (!force && event && event.target !== lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCert(null, true);
});

window.openCert  = openCert;
window.closeCert = closeCert;


// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});