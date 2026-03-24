// Main Portfolio App
class PortfolioApp {
  constructor() {
    this.book = new BookEngine();

    this.pages = [
        { id: 'home', label: 'Home', icon: '<i class="fa-solid fa-house"></i>', file: '/pages/home.html' },
        { id: 'about', label: 'About', icon: '<i class="fa-solid fa-user"></i>', file: '/pages/about.html' },
        { id: 'skills', label: 'Skills', icon: '<i class="fa-solid fa-bolt"></i>', file: '/pages/skills.html' },
        { id: 'projects', label: 'Projects', icon: '<i class="fa-solid fa-diagram-project"></i>', file: '/pages/projects.html' },
        { id: 'certificates', label: 'Certificates', file: '/pages/certificates.html' },
        { id: 'training', label: 'Training', file: '/pages/training.html' },
        { id: 'education', label: 'Education', file: '/pages/education.html' },
        { id: 'contact', label: 'Contact', file: '/pages/contact.html' }
    ];

    this.init();
  }


  async init() {
    // Load all page content
    const pageData = await Promise.all(
      this.pages.map(async (p, i) => {
        try {
          const res = await fetch(p.file);
          const content = await res.text();
          return { ...p, content };
        } catch (e) {
          return { ...p, content: `<div class="page-inner"><p>Page content loading...</p></div>` };
        }
      })
    );

    // Build sidebar
    this.buildSidebar(pageData);

    // Init book
    this.book.setPages(pageData);
    await this.book.init();

    // Event listeners
    this.bindArrows();
    this.bindKeyboard();

    // Trigger home animations
    this.book.triggerPageAnimations(0);
    startTypewriter();

    // Hide loader
    setTimeout(() => {
      const loader = document.getElementById('loading-screen');
      if (loader) loader.classList.add('hidden');
    }, 1600);
  }

  buildSidebar(pageData) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-section-label">Navigation</div>
    `;

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

    // Keyboard hint
    sidebar.innerHTML += `
      <div class="sidebar-divider"></div>
      <div style="padding:10px 10px 4px;">
        <div class="kbd-hint">
          <span class="kbd">←</span>
          <span class="kbd">→</span>
          <span style="margin-left:2px;">Navigate</span>
        </div>
      </div>
    `;
  }

  updateSidebar(index) {
    document.querySelectorAll('.sidebar-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  goToPage(index) {
    if (index === this.book.currentPage) return;
    const direction = index > this.book.currentPage ? 'forward' : 'backward';
    this.book.goTo(index, direction);
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

// Typewriter effect
const ROLES = [
  '<i class="fa-solid fa-robot"></i> AI Engineer',
  '<i class="fa-solid fa-brain"></i> ML Enthusiast',
  '<i class="fa-solid fa-code"></i> Software Developer',
  '<i class="fa-solid fa-magnifying-glass"></i> Problem Solver',
  '<i class="fa-solid fa-graduation-cap"></i> CSE Student @ LPU',
];

let twIndex = 0, twCharIndex = 0, twDeleting = false, twTimer = null;

function startTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  if (twTimer) clearTimeout(twTimer);
  twIndex = 0; twCharIndex = 0; twDeleting = false;
  typeStep(el);
}

function typeStep(el) {
  const current = ROLES[twIndex % ROLES.length];

  if (!twDeleting) {
    el.innerHTML = current.slice(0, ++twCharIndex);
    if (twCharIndex === current.length) {
      twDeleting = true;
      twTimer = setTimeout(() => typeStep(el), 1800);
      return;
    }
  } else {
    el.innerHTML = current.slice(0, --twCharIndex);
    if (twCharIndex === 0) {
      twDeleting = false;
      twIndex++;
    }
  }
  twTimer = setTimeout(() => typeStep(el), twDeleting ? 60 : 90);
}

window.startTypewriter = startTypewriter;

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});