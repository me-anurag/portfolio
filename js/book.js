// ===== BOOK FLIP ENGINE =====
class BookEngine {
  constructor() {
    this.currentPage = 0;
    this.totalPages  = 0;
    this.isFlipping  = false;
    this.pages       = [];
    this.pageData    = [];
    this.container   = document.getElementById('book-container');

    this.drag = { active: false, startX: 0, percent: 0 };
  }

  setPages(pageData) {
    this.pageData  = pageData;
    this.totalPages = pageData.length;
  }

  buildPage(index, content) {
    const page = document.createElement('div');
    page.className   = 'book-page state-hidden';
    page.dataset.index = index;
    page.innerHTML = `
      <div class="flip-shimmer"></div>
      <div class="page-curl-dynamic"></div>
      ${content}
      <div class="page-curl"></div>
      <div class="page-number">${index + 1} / ${this.totalPages}</div>
    `;
    return page;
  }

  async init() {
    this.container.innerHTML = '';
    this.pages = [];

    for (let i = 0; i < this.pageData.length; i++) {
      const page = this.buildPage(i, this.pageData[i].content);
      this.container.appendChild(page);
      this.pages.push(page);
    }

    if (this.pages.length > 0) {
      this.pages[0].className = 'book-page state-current';
    }

    this.updateProgress();
    this.updateArrows();
    this.bindDrag();
  }

  // ===== NAVIGATION =====
  async goTo(index) {
    if (this.isFlipping || index === this.currentPage) return;
    if (index < 0 || index >= this.totalPages) return;

    this.isFlipping = true;

    const outPage   = this.pages[this.currentPage];
    const inPage    = this.pages[index];
    const isForward = index > this.currentPage;

    // Position incoming page off-screen
    inPage.className = `book-page ${isForward ? 'state-next' : 'state-prev'}`;

    // Force reflow so transition fires correctly
    inPage.getBoundingClientRect();

    await this.wait(30);

    outPage.className = `book-page flipping ${isForward ? 'flip-out-left'  : 'flip-out-right'}`;
    inPage.className  = `book-page flipping ${isForward ? 'flip-in-right'  : 'flip-in-left'}`;

    await this.wait(700);

    outPage.className = 'book-page state-hidden';
    inPage.className  = 'book-page state-current';

    // Reset any inline drag transforms
    outPage.style.transform       = '';
    outPage.style.transformOrigin = '';
    inPage.style.transform        = '';
    inPage.style.transformOrigin  = '';

    this.currentPage = index;
    this.isFlipping  = false;

    this.updateProgress();
    this.updateArrows();
    this.triggerPageAnimations(index);
  }

  next() { this.goTo(this.currentPage + 1); }
  prev() { this.goTo(this.currentPage - 1); }

  // ===== DRAG / CURL =====
  bindDrag() {
    // mousedown — start drag
    this.container.addEventListener('mousedown', (e) => {
      if (this.isFlipping) return;
      this.drag.active = true;
      this.drag.startX = e.clientX;
      this.pages[this.currentPage]?.classList.add('dragging');
    });

    // mousemove — single listener only
    window.addEventListener('mousemove', (e) => {
      if (!this.drag.active) return;

      const delta = e.clientX - this.drag.startX;
      const max   = window.innerWidth * 0.6;
      let percent = Math.max(-1, Math.min(1, delta / max));
      this.drag.percent = percent;

      const page = this.pages[this.currentPage];
      if (!page) return;

      const curl = page.querySelector('.page-curl-dynamic');
      const curve = Math.sign(percent) * Math.pow(Math.abs(percent), 0.65);
      const rotate = curve * -170;
      const skew   = curve * 7;
      const scale  = 1 - Math.abs(percent) * 0.03;
      const origin = 50 + percent * 28;

      page.style.transformOrigin = `${origin}% center`;
      page.style.transform = `perspective(2000px) rotateY(${rotate}deg) skewY(${skew}deg) scale(${scale})`;

      if (curl) {
        curl.style.transform = `perspective(2000px) rotateY(${rotate * 1.2}deg) skewY(${skew * 1.3}deg)`;
        curl.style.opacity   = Math.min(1, Math.abs(percent) * 1.2);
      }
    });

    // mouseup — commit or snap back
    window.addEventListener('mouseup', () => {
      if (!this.drag.active) return;
      this.drag.active = false;

      const page = this.pages[this.currentPage];
      page?.classList.remove('dragging');

      const pct = this.drag.percent;

      if (pct < -0.35 && this.currentPage < this.totalPages - 1) {
        // Dragged left far enough — go forward
        this.goTo(this.currentPage + 1);
      } else if (pct > 0.35 && this.currentPage > 0) {
        // Dragged right far enough — go backward
        this.goTo(this.currentPage - 1);
      } else {
        // Snap back
        if (page) {
          page.style.transition       = 'transform 0.35s ease';
          page.style.transform        = '';
          page.style.transformOrigin  = '';
          setTimeout(() => { page.style.transition = ''; }, 380);
        }
      }

      this.drag.percent = 0;
    });
  }

  // ===== HELPERS =====
  updateProgress() {
    const pct = this.totalPages <= 1
      ? 100
      : (this.currentPage / (this.totalPages - 1)) * 100;
    const bar = document.getElementById('progress-bar-fill');
    if (bar) bar.style.width = pct + '%';
  }

  updateArrows() {
    const prev = document.getElementById('arrow-prev');
    const next = document.getElementById('arrow-next');
    if (prev) prev.classList.toggle('disabled', this.currentPage === 0);
    if (next) next.classList.toggle('disabled', this.currentPage === this.totalPages - 1);
  }

  triggerPageAnimations(index) {
    const page = this.pages[index];
    if (!page) return;

    // Animate skill bars
    page.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
      const pct = bar.dataset.pct || '0';
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = pct + '%'; }, 120 + i * 90);
    });

    // Restart typewriter on home page
    if (index === 0) {
      window.startTypewriter && window.startTypewriter();
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.BookEngine = BookEngine;