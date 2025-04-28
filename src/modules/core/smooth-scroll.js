// src/modules/core/smooth-scroll.js

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768;
    this.resizeTimeout = null;
    this.initialized = false;
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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

    // Immediately check if we're on mobile/touch device
    if (this.isTouch || window.innerWidth < this.breakpoint) {
      this.forceDisableSmoothScroll();
      console.log('Touch device or mobile width detected - smooth scroll disabled');
    } else {
      // Only initialize on desktop/non-touch
      this.initSmoother();
    }
    
    this.initialized = true;
    this.handleResize();
  }

  initSmoother() {
    // First make sure any previous instance is fully killed
    this.killSmoother();

    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');

    if (!wrapper || !content) {
      console.warn('Smooth scroll wrapper or content not found');
      return;
    }

    try {
      // Create a new instance with safe settings
      this.smoother = ScrollSmoother.create({
        wrapper: wrapper,
        content: content,
        smooth: 1,
        effects: true,
        smoothTouch: false,
        normalizeScroll: false,
        ignoreMobileResize: true
      });
      
      console.log('ScrollSmoother initialized for desktop');
    } catch (error) {
      console.warn('Error initializing ScrollSmoother:', error);
      this.forceDisableSmoothScroll(); // Fallback to native scrolling
    }
  }

  killSmoother() {
    if (this.smoother) {
      // Kill the smoother instance
      this.smoother.kill();
      this.smoother = null;
    }
    
    // Reset ALL possible GSAP transformations
    this.resetScrollTransforms();
  }

  resetScrollTransforms() {
    // Target specific elements that might have transforms
    const elements = [
      '#smooth-wrapper',
      '#smooth-content',
      '.scrollsmoother-container',
      '.scrollsmoother-pin-spacer'
    ];
    
    elements.forEach(selector => {
      const els = document.querySelectorAll(selector);
      if (els.length) {
        gsap.set(els, { 
          clearProps: 'all',
          overwrite: true
        });
      }
    });
    
    // Ensure body and html can scroll natively
    gsap.set([document.body, document.documentElement], {
      overflow: '',
      height: '',
      position: '',
      overwrite: true
    });
  }

  forceDisableSmoothScroll() {
    // Kill any existing smoother
    if (this.smoother) {
      this.smoother.kill();
      this.smoother = null;
    }
    
    // Reset all transforms
    this.resetScrollTransforms();
    
    // Force native scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Remove any classes that might interfere
    document.body.classList.remove('has-smooth-scroll');
    document.documentElement.classList.remove('has-smooth-scroll');
    
    // Reset any potential fixed positions
    const fixedElements = document.querySelectorAll('[data-scrollsmoother-fixed]');
    fixedElements.forEach(el => {
      el.style.position = '';
      el.style.top = '';
      el.style.left = '';
      el.style.width = '';
      el.style.transform = '';
    });
    
    // Re-enable all potential overflow elements
    const contentWrappers = document.querySelectorAll('.overflow-hidden');
    contentWrappers.forEach(el => {
      if (el.classList.contains('overflow-hidden')) {
        el.style.overflow = '';
      }
    });
    
    // Force a layout recalculation
    document.body.offsetHeight;
    
    console.log('Completely disabled smooth scroll, reset all transforms');
  }

  handleResize() {
    const checkDevice = () => {
      const isTouchNow = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileWidth = window.innerWidth < this.breakpoint;
      
      if (isTouchNow !== this.isTouch) {
        this.isTouch = isTouchNow;
        if (this.isTouch) {
          this.forceDisableSmoothScroll();
        } else if (!isMobileWidth) {
          this.initSmoother();
        }
      }
      
      if (isMobileWidth && this.smoother) {
        this.forceDisableSmoothScroll();
      } else if (!isMobileWidth && !this.isTouch && !this.smoother) {
        this.initSmoother();
      }
    };

    // Check on resize
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(checkDevice, 250);
    });
    
    // Also check on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDevice, 300);
    });
  }

  refresh() {
    if (this.smoother) {
      this.smoother.refresh();
    } else if (typeof ScrollTrigger !== 'undefined') {
      // If smoother is not active but we have ScrollTrigger, refresh it
      ScrollTrigger.refresh();
    }
  }

  getSmoother() {
    return this.smoother;
  }
}

const smoothScroll = new SmoothScroll();
export { smoothScroll };