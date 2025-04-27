// src/modules/core/smooth-scroll.js

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768;
    this.resizeTimeout = null;
  }

  init() {
    if (typeof gsap === 'undefined') {
      return;
    }
    if (typeof ScrollSmoother === 'undefined') {
      return;
    }

    try {
      gsap.registerPlugin(ScrollSmoother);
    } catch (error) {
      return;
    }

    this.initSmoother();
    this.handleResize();
  }

  initSmoother() {
    if (window.innerWidth < this.breakpoint) {
      return;
    }

    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');

    if (!wrapper) {
      return;
    }
    if (!content) {
      return;
    }

    try {
      this.smoother = ScrollSmoother.create({
        wrapper: wrapper,
        content: content,
        smooth: 1,
        effects: true,
        smoothTouch: false,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });
    } catch (error) {
    }
  }

  handleResize() {
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);

      this.resizeTimeout = setTimeout(() => {
        const isDesktop = window.innerWidth >= this.breakpoint;

        if (isDesktop) {
          if (!this.smoother) {
            this.initSmoother();
          }
        } else {
          if (this.smoother) {
            this.smoother.kill();
            this.smoother = null;
          }
        }
      }, 250);
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
export { smoothScroll };