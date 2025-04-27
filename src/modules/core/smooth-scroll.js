// src/modules/core/smooth-scroll.js

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768;
    console.log('SmoothScroll class instantiated');
  }

  init() {
    console.log('SmoothScroll init called');
    
    try {
      if (window.innerWidth < this.breakpoint) {
        console.log('SmoothScroll: Mobile detected, not initializing');
        return;
      }

      if (!document.getElementById('smooth-wrapper') || !document.getElementById('smooth-content')) {
        console.warn('Smooth scroll wrapper or content elements not found.');
        return;
      }

      // Check if ScrollSmoother is available (should be loaded via CDN)
      if (typeof ScrollSmoother === 'undefined') {
        console.error('ScrollSmoother is not defined. Check if the script is loaded correctly via CDN.');
        return;
      }

      console.log('SmoothScroll: Initializing ScrollSmoother');
      
      this.smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1,
        effects: true,
        smoothTouch: false,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });
      
      console.log('SmoothScroll: Successfully initialized');

      this.handleResize();
    } catch (error) {
      console.error('Error initializing SmoothScroll:', error);
    }
  }

  handleResize() {
    window.addEventListener('resize', () => {
      if (window.innerWidth < this.breakpoint) {
        if (this.smoother) {
          console.log('SmoothScroll: Killing smoother on mobile');
          this.smoother.kill();
          this.smoother = null;
        }
      } else if (!this.smoother) {
        console.log('SmoothScroll: Reinitializing on desktop');
        this.init();
      }
    });
  }

  refresh() {
    if (this.smoother) {
      console.log('SmoothScroll: Refreshing');
      this.smoother.refresh();
    }
  }

  getSmoother() {
    return this.smoother;
  }
}

const smoothScroll = new SmoothScroll();
export default smoothScroll;