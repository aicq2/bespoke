import 'vendor/ScrollSmoother.min.js';

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768; // Mobile breakpoint
  }

  init() {
    if (window.innerWidth < this.breakpoint) {
      return;
    }

    if (!document.getElementById('smooth-wrapper') || !document.getElementById('smooth-content')) {
      console.warn('Smooth scroll wrapper or content elements not found.');
      return;
    }

    // Initialize ScrollSmoother
    this.smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 2, 
      effects: true, 
      smoothTouch: false, 
      normalizeScroll: true, 
      ignoreMobileResize: true, 
    });

    this.handleResize();
  }

  handleResize() {
    window.addEventListener('resize', () => {
      if (window.innerWidth < this.breakpoint) {
        if (this.smoother) {
          this.smoother.kill();
          this.smoother = null;
        }
      } else if (!this.smoother) {
        this.init();
      }
    });
  }

  refresh() {
    if (this.smoother) {
      this.smoother.refresh();
    }
  }

  getSmoother() {
    return this.smoother;
  }
}

const smoothScroll = new SmoothScroll();
export default smoothScroll;