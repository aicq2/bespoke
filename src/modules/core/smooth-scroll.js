// src/modules/core/smooth-scroll.js

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768;
    this.isMobile = window.innerWidth < this.breakpoint || 
                   'ontouchstart' in window || 
                   navigator.maxTouchPoints > 0;
    this.initialized = false;
    this.scrollTriggers = [];
  }

  init() {
    // Check for GSAP
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not found. Required for scroll functionality.');
      return;
    }
    
    // Register ScrollTrigger
    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (error) {
      console.warn('Error registering ScrollTrigger:', error);
    }
    
    // Set up the appropriate scroll method based on device
    if (this.isMobile) {
      this.setupMobileScrolling();
    } else {
      this.setupDesktopScrolling();
    }
    
    // Handle resize events
    this.handleResize();
    
    this.initialized = true;
  }

  setupMobileScrolling() {
    // 1. Kill any existing ScrollSmoother
    this.killSmoother();
    
    // 2. Apply mobile-specific styles
    document.documentElement.classList.add('is-mobile');
    document.documentElement.classList.remove('is-desktop');
    
    // 3. Ensure proper scrolling behavior
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // 4. Reset all transforms on scroll containers
    const elements = [
      '#smooth-wrapper', 
      '#smooth-content', 
      '.scrollsmoother-container', 
      '.scrollsmoother-pin-spacer'
    ];
    
    elements.forEach(selector => {
      const els = document.querySelectorAll(selector);
      if (els.length) {
        els.forEach(el => {
          // Completely reset all styles
          el.style.cssText = '';
          // Force default values for critical properties
          el.style.transform = 'none';
          el.style.position = '';
          el.style.top = '';
          el.style.left = '';
          el.style.width = 'auto';
          el.style.height = 'auto';
        });
      }
    });
    
    // 5. Add !important override styles via a new style element
    let styleEl = document.getElementById('mobile-scroll-fixes');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'mobile-scroll-fixes';
      document.head.appendChild(styleEl);
    }
    
  /*  styleEl.textContent = `
      @media (max-width: ${this.breakpoint}px) {
        html, body {
          overflow: auto !important;
          height: auto !important;
          position: relative !important;
          transform: none !important;
        }
        #smooth-wrapper, #smooth-content {
          transform: none !important;
          position: relative !important;
          top: 0 !important;
          left: 0 !important;
          width: auto !important;
          height: auto !important;
          will-change: auto !important;
        }
        .scrollsmoother-pin-spacer {
          display: none !important;
        }
      }
    `;*/
    
    // 6. Force DOM reflow
    document.body.offsetHeight;
    
    // 7. Refresh ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh(true); // true forces an immediate recalculation of all ScrollTriggers
    }
    
    console.log('Mobile scrolling setup complete');
  }

  setupDesktopScrolling() {
    // Only proceed if ScrollSmoother is available
    if (typeof ScrollSmoother === 'undefined') {
      console.warn('ScrollSmoother not found, falling back to native scrolling');
      return;
    }
    
    // If we're switching from mobile, clean up
    this.killSmoother();
    
    // Mark as desktop
    document.documentElement.classList.remove('is-mobile');
    document.documentElement.classList.add('is-desktop');
    
    // Remove any mobile-specific styles
    const mobileStyleEl = document.getElementById('mobile-scroll-fixes');
    if (mobileStyleEl) {
      mobileStyleEl.textContent = '';
    }
    
    // Set up ScrollSmoother for desktop
    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');

    if (!wrapper || !content) {
      console.warn('Smooth scroll wrapper or content not found');
      return;
    }

    try {
      // Create with safe options
      this.smoother = ScrollSmoother.create({
        wrapper: wrapper,
        content: content,
        smooth: 1,
        effects: true,
        smoothTouch: false,
        normalizeScroll: false
      });
      
      console.log('Desktop smooth scrolling initialized');
    } catch (error) {
      console.warn('Error initializing ScrollSmoother:', error);
    }
  }

  killSmoother() {
    // Kill ScrollSmoother instance
    if (this.smoother) {
      this.smoother.kill();
      this.smoother = null;
    }
    
    // Kill all ScrollTrigger instances created for smooth scrolling
    if (typeof ScrollTrigger !== 'undefined') {
      // Find and kill all ScrollTriggers related to ScrollSmoother
      const allScrollTriggers = ScrollTrigger.getAll();
      for (let i = 0; i < allScrollTriggers.length; i++) {
        const trigger = allScrollTriggers[i];
        if (trigger.vars && trigger.vars.id && trigger.vars.id.includes('smoother')) {
          trigger.kill();
        }
      }
    }
  }

  handleResize() {
    // Check device on resize
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < this.breakpoint || 
                     'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0;
      
      // Only react if state changed
      if (wasMobile !== this.isMobile) {
        if (this.isMobile) {
          this.setupMobileScrolling();
        } else {
          this.setupDesktopScrolling();
        }
      }
    });
    
    // Special handler for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = window.innerWidth < this.breakpoint || 
                       'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0;
                       
        if (this.isMobile) {
          this.setupMobileScrolling();
        } else {
          this.setupDesktopScrolling();
        }
      }, 300);
    });
  }

  refresh() {
    if (this.smoother) {
      this.smoother.refresh();
    }
    
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  getSmoother() {
    return this.smoother;
  }
}

const smoothScroll = new SmoothScroll();
export { smoothScroll };