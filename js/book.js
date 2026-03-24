// Book page flip engine
class BookEngine {
  constructor() {
    this.currentPage = 0;
    this.totalPages = 0;
    this.isFlipping = false;
    this.pages = [];
    this.pageData = [];
    this.container = document.getElementById('book-container');
  }

  setPages(pageData) {
    this.pageData = pageData;
    this.totalPages = pageData.length;
  }

  buildPage(index, content) {
    const page = document.createElement('div');
    page.className = 'book-page state-hidden';
    page.dataset.index = index;

    page.innerHTML = `
      <div class="flip-shimmer"></div>
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
      const { content } = this.pageData[i];
      const page = this.buildPage(i, content);
      this.container.appendChild(page);
      this.pages.push(page);
    }

    // Show first page
    if (this.pages.length > 0) {
      this.pages[0].className = 'book-page state-current';
    }

    this.updateProgress();
    this.updateArrows();
  }

  async goTo(index, direction) {
    if (this.isFlipping || index === this.currentPage) return;
    if (index < 0 || index >= this.totalPages) return;

    this.isFlipping = true;
    const outPage = this.pages[this.currentPage];
    const inPage = this.pages[index];
    const isForward = index > this.currentPage;

    // Prepare incoming page
    inPage.className = `book-page ${isForward ? 'state-next' : 'state-prev'}`;
    inPage.style.display = '';

    // Force reflow
    inPage.getBoundingClientRect();

    // Start animation
    outPage.className = `book-page ${isForward ? 'flip-out-left' : 'flip-out-right'}`;
    inPage.className = `book-page ${isForward ? 'flip-in-right' : 'flip-in-left'}`;

    await this.wait(680);

    // Clean up
    outPage.className = 'book-page state-hidden';
    inPage.className = 'book-page state-current';

    this.currentPage = index;
    this.isFlipping = false;

    this.updateProgress();
    this.updateArrows();
    this.triggerPageAnimations(index);
  }

  next() {
    if (this.currentPage < this.totalPages - 1) {
      this.goTo(this.currentPage + 1, 'forward');
    }
  }

  prev() {
    if (this.currentPage > 0) {
      this.goTo(this.currentPage - 1, 'backward');
    }
  }

  updateProgress() {
    const pct = this.totalPages <= 1 ? 100 : (this.currentPage / (this.totalPages - 1)) * 100;
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
    // Trigger skill bar animations when skills page loads
    const page = this.pages[index];
    if (!page) return;

    // Skill bars
    const bars = page.querySelectorAll('.skill-bar-fill');
    bars.forEach((bar, i) => {
      const pct = bar.dataset.pct || '0';
      setTimeout(() => {
        bar.style.width = pct + '%';
      }, 100 + i * 80);
    });

    // Typewriter on home page
    if (index === 0) {
      window.startTypewriter && window.startTypewriter();
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.BookEngine = BookEngine;