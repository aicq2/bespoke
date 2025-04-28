// src/modules/core/smooth-scroll.js

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768;
    this.resizeTimeout = null;
    this.initialized = false;
  }

  init() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not found. Smooth scroll requires this library.');
      return;
    }
    if (typeof ScrollSmoother === 'undefined') {
      console.warn('ScrollSmoother not found. Smooth scroll requires this plugin.');
      return;
    }

    try {
      gsap.registerPlugin(ScrollSmoother);
    } catch (error) {
      console.warn('Error registering ScrollSmoother plugin:', error);
      return;
    }

    // Only initialize on desktop
    if (window.innerWidth >= this.breakpoint) {
      this.initSmoother();
    } else {
      this.disableSmoothScrollOnMobile();
    }
    
    this.initialized = true;
    this.handleResize();
  }

  initSmoother() {
    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');

    if (!wrapper || !content) {
      console.warn('Smooth scroll wrapper or content not found');
      return;
    }

    try {
      // Kill existing instance if any
      if (this.smoother) {
        this.smoother.kill();
        this.smoother = null;
      }

      // Create a new instance with improved settings
      this.smoother = ScrollSmoother.create({
        wrapper: wrapper,
        content: content,
        smooth: 1,
        effects: true,
        smoothTouch: false,        // Disable smooth scrolling on touch devices
        normalizeScroll: false,    // Changed from true to false to fix mobile issues
        ignoreMobileResize: true
      });
      
      console.log('ScrollSmoother initialized');
    } catch (error) {
      console.warn('Error initializing ScrollSmoother:', error);
    }
  }

  disableSmoothScrollOnMobile() {
    // Kill any existing smoother instance
    if (this.smoother) {
      this.smoother.kill();
      this.smoother = null;
    }
    
    // Reset any CSS that might be affecting mobile scrolling
    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');
    
    if (wrapper && content) {
      gsap.set([wrapper, content], { clearProps: "all" });
    }
    
    // Ensure native scrolling works properly
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    console.log('Smooth scroll disabled for mobile');
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
          this.disableSmoothScrollOnMobile();
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