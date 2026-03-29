// ===== BOOK ENGINE — SMOOTH SLIDE TRANSITION =====
class BookEngine {
  constructor() {
    this.currentPage = 0;
    this.totalPages  = 0;
    this.isFlipping  = false;
    this.pages       = [];
    this.pageData    = [];
    this.container   = document.getElementById('book-container');

    this.drag = {
      active:   false,
      startX:   0,
      currentX: 0,
      percent:  0,
    };
  }

  setPages(pageData) {
    this.pageData   = pageData;
    this.totalPages = pageData.length;
  }

  buildPage(index, content) {
    const page = document.createElement('div');
    page.className     = 'book-page state-hidden';
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

    // Show first page immediately (no transition)
    if (this.pages.length > 0) {
      this.pages[0].style.transition = 'none';
      this.pages[0].className = 'book-page state-current';
      // Re-enable transitions after first paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.pages[0]) this.pages[0].style.transition = '';
        });
      });
    }

    this.updateProgress();
    this.updateArrows();
    this.bindDrag();
  }

  // ===== CORE NAVIGATION =====
  async goTo(index) {
    if (this.isFlipping || index === this.currentPage) return;
    if (index < 0 || index >= this.totalPages) return;

    this.isFlipping = true;

    const outPage   = this.pages[this.currentPage];
    const inPage    = this.pages[index];
    const isForward = index > this.currentPage;

    // 1. Snap incoming page to its off-screen start position instantly
    inPage.style.transition = 'none';
    inPage.className = `book-page ${isForward ? 'state-next' : 'state-prev'}`;

    // 2. Force browser to apply that position before animating
    inPage.getBoundingClientRect();

    // 3. Re-enable transitions
    inPage.style.transition = '';
    outPage.style.transition = '';

    // Small tick so transition fires cleanly
    await this.wait(16);

    // 4. Animate both pages simultaneously
    outPage.className = `book-page ${isForward ? 'slide-out-left' : 'slide-out-right'}`;
    inPage.className  = `book-page ${isForward ? 'slide-in-right' : 'slide-in-left'}`;

    // 5. Wait for animation to finish (matches CSS 0.55s)
    await this.wait(580);

    // 6. Settle final states
    outPage.style.transition = 'none';
    outPage.className = 'book-page state-hidden';

    inPage.style.transition = 'none';
    inPage.className = 'book-page state-current';

    // Re-enable transitions for next interaction
    await this.wait(20);
    outPage.style.transition = '';
    inPage.style.transition  = '';

    this.currentPage = index;
    this.isFlipping  = false;

    this.updateProgress();
    this.updateArrows();
    this.triggerPageAnimations(index);
  }

  next() { this.goTo(this.currentPage + 1); }
  prev() { this.goTo(this.currentPage - 1); }

  // ===== DRAG TO SLIDE =====
  bindDrag() {
    // Mouse down
    this.container.addEventListener('mousedown', (e) => {
      if (this.isFlipping) return;
      this.drag.active   = true;
      this.drag.startX   = e.clientX;
      this.drag.currentX = e.clientX;
      this.drag.percent  = 0;

      const page = this.pages[this.currentPage];
      if (page) {
        page.style.transition = 'none';
        page.classList.add('dragging');
      }
    });

    // Mouse move — live drag preview
    window.addEventListener('mousemove', (e) => {
      if (!this.drag.active || this.isFlipping) return;

      this.drag.currentX = e.clientX;
      const delta   = e.clientX - this.drag.startX;
      const maxDist = this.container.offsetWidth * 0.75;
      this.drag.percent = Math.max(-1, Math.min(1, delta / maxDist));

      const page = this.pages[this.currentPage];
      if (!page) return;

      // Translate the page with the drag, slight upward lift
      const tx    = delta * 0.65;
      const ty    = -Math.abs(delta) * 0.018;
      const scale = 1 - Math.abs(this.drag.percent) * 0.025;

      page.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`;
    });

    // Mouse up — commit or spring back
    const release = () => {
      if (!this.drag.active) return;
      this.drag.active = false;

      const page = this.pages[this.currentPage];
      if (page) page.classList.remove('dragging');

      const pct = this.drag.percent;

      if (pct < -0.22 && this.currentPage < this.totalPages - 1) {
        // Committed — slide to next
        if (page) { page.style.transition = ''; page.style.transform = ''; }
        this.goTo(this.currentPage + 1);

      } else if (pct > 0.22 && this.currentPage > 0) {
        // Committed — slide to prev
        if (page) { page.style.transition = ''; page.style.transform = ''; }
        this.goTo(this.currentPage - 1);

      } else {
        // Not committed — spring back to center
        if (page) {
          page.style.transition = 'transform 0.42s cubic-bezier(0.34, 1.4, 0.64, 1)';
          page.style.transform  = 'translateX(0px) translateY(0px) scale(1)';
          setTimeout(() => {
            page.style.transition = '';
            page.style.transform  = '';
          }, 450);
        }
      }

      this.drag.percent = 0;
    };

    window.addEventListener('mouseup',    release);
    window.addEventListener('mouseleave', release);

    // Touch support
    this.container.addEventListener('touchstart', (e) => {
      if (this.isFlipping) return;
      this.drag.active   = true;
      this.drag.startX   = e.touches[0].clientX;
      this.drag.currentX = this.drag.startX;
      this.drag.percent  = 0;
      const page = this.pages[this.currentPage];
      if (page) { page.style.transition = 'none'; }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.drag.active || this.isFlipping) return;
      this.drag.currentX = e.touches[0].clientX;
      const delta   = this.drag.currentX - this.drag.startX;
      const maxDist = this.container.offsetWidth * 0.75;
      this.drag.percent = Math.max(-1, Math.min(1, delta / maxDist));

      const page = this.pages[this.currentPage];
      if (!page) return;
      const tx    = delta * 0.65;
      const ty    = -Math.abs(delta) * 0.018;
      const scale = 1 - Math.abs(this.drag.percent) * 0.025;
      page.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`;
    }, { passive: true });

    window.addEventListener('touchend', release);
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
      bar.style.width = '0';
      const pct = bar.dataset.pct || '0';
      setTimeout(() => { bar.style.width = pct + '%'; }, 150 + i * 90);
    });

    // Restart typewriter on home
    if (index === 0) {
      window.startTypewriter && window.startTypewriter();
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.BookEngine = BookEngine;