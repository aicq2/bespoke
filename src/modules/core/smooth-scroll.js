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
      // Check if ScrollSmoother is available
      if (typeof ScrollSmoother === 'undefined') {
        console.log('ScrollSmoother not found. Loading ScrollSmoother from CDN.');
        // Load ScrollSmoother dynamically
        this.loadScrollSmoother().then(() => {
          this.initSmoother();
        }).catch(error => {
          console.error('Failed to load ScrollSmoother:', error);
        });
      } else {
        // ScrollSmoother is already available
        this.initSmoother();
      }
    } catch (error) {
      console.error('Error initializing SmoothScroll:', error);
    }
  }

  loadScrollSmoother() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/aicq2/bespoke@refs/heads/main/vendor/ScrollSmoother.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load ScrollSmoother script'));
      document.head.appendChild(script);
    });
  }

  initSmoother() {
    if (window.innerWidth < this.breakpoint) {
      console.log('SmoothScroll: Mobile detected, not initializing');
      return;
    }
    
    if (!document.getElementById('smooth-wrapper') || !document.getElementById('smooth-content')) {
      console.warn('Smooth scroll wrapper or content elements not found.');
      return;
    }
    
    console.log('SmoothScroll: Initializing ScrollSmoother');
    
    // Make sure ScrollSmoother is available
    if (typeof ScrollSmoother === 'undefined') {
      console.error('ScrollSmoother still not available after loading attempt');
      return;
    }
    
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
        this.initSmoother();
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