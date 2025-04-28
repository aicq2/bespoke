// src/modules/ui/text-animations.js

class TextAnimation {
  constructor() {
    this.initialized = false;
    this.animations = [];
    this.fadeAnimations = [];
    this.resizeObserver = null;
    this.viewportHeight = window.innerHeight;
    this.lastScrollY = window.scrollY;
    this.scrollTimeout = null;
    this.isRefreshing = false;
  }

  init() {
    // Check for GSAP dependency
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not found. Text animations require this library.');
      return;
    }

    // Store initial viewport height
    this.viewportHeight = window.innerHeight;
    
    // Handle text splitting animations
    const textElements = document.querySelectorAll('[data-gsap="text"]');
    if (textElements.length > 0) {
      textElements.forEach((element) => {
        this.splitAndAnimateText(element);
      });
    }

    // Handle fade-up animations
    const fadeElements = document.querySelectorAll('[data-gsap="fade-up"]');
    if (fadeElements.length > 0) {
      fadeElements.forEach((element) => {
        this.createFadeUpAnimation(element);
      });
    }

    // Set up event listeners for mobile
    this.setupMobileHandlers();
    
    this.initialized = true;
  }

  setupMobileHandlers() {
    // Clean up existing handlers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Smart resize observer that only triggers on significant height changes
    // This helps avoid refreshes when the address bar appears/disappears
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
      this.resizeObserver.observe(document.documentElement);
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 200));
    }
    
    // Handle scroll events to detect when the address bar appears/disappears
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // Handle orientation changes explicitly
    window.addEventListener('orientationchange', () => {
      // Delay the refresh to allow the browser to complete the orientation change
      setTimeout(() => {
        this.smartRefresh();
      }, 300);
    });
  }
  
  handleResize(entries) {
    // Skip small height changes that are likely due to address bar
    const newHeight = window.innerHeight;
    const heightDiff = Math.abs(this.viewportHeight - newHeight);
    
    // Only trigger a refresh for significant height changes (more than 20% of viewport)
    // or width changes which indicate a true resize or orientation change
    if (heightDiff > this.viewportHeight * 0.2 || 
        entries && entries[0] && entries[0].contentRect.width !== window.innerWidth) {
      this.viewportHeight = newHeight;
      this.smartRefresh();
    }
  }
  
  handleScroll() {
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Set a new timeout to detect when scrolling stops
    this.scrollTimeout = setTimeout(() => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(this.lastScrollY - currentScrollY);
      
      // If there was a significant scroll, update ScrollTrigger without refreshing animations
      if (scrollDiff > 50 && typeof ScrollTrigger !== 'undefined' && !this.isRefreshing) {
        ScrollTrigger.refresh(false); // false = don't force layout recalculation
      }
      
      this.lastScrollY = currentScrollY;
    }, 200);
  }
  
  smartRefresh() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    // Use a minimal refresh approach that updates ScrollTrigger positions
    // without recreating all animations
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
    
    this.isRefreshing = false;
  }

  splitAndAnimateText(element) {
    const words = element.textContent.split(' ');
    element.innerHTML = '';
    element.style.visibility = 'visible';

    words.forEach((word, wordIndex) => {
      // Create word span
      const wordSpan = document.createElement('div');
      wordSpan.classList.add('word');
      wordSpan.style.position = 'relative';
      wordSpan.style.display = 'inline-block';
      
      // Split word into characters
      const chars = word.split('');
      
      chars.forEach((char) => {
        // Create char span
        const charSpan = document.createElement('div');
        charSpan.classList.add('char');
        charSpan.textContent = char;
        charSpan.style.position = 'relative';
        charSpan.style.display = 'inline-block';
        charSpan.style.opacity = '0';
        charSpan.style.filter = 'blur(10px)';
        wordSpan.appendChild(charSpan);
      });
      
      element.appendChild(wordSpan);
      
      // Add space if not the last word
      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
      
      // Animate each character
      const charElements = wordSpan.querySelectorAll('.word');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top bottom-=100',
          toggleActions: 'play none none none',
          // Add this to prevent the animation from restarting
          once: true
        }
      });
      
      tl.to(charElements, {
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.05,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      this.animations.push(tl);
    });
  }

  createFadeUpAnimation(element) {
    // Initial state
    gsap.set(element, {
      y: '4rem',
      opacity: 0,
      visibility: 'visible'
    });
    
    // Get delay from data attribute if it exists
    let delay = 0;
    if (element.hasAttribute('data-delay')) {
      delay = parseFloat(element.getAttribute('data-delay')) || 0;
    }
    
    // Create the animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top bottom-=100',
        toggleActions: 'play none none none',
        // Add this to prevent the animation from restarting
        once: true
      }
    });
    
    tl.to(element, {
      y: 0,
      opacity: 1,
      duration: 1,
      delay: delay,
      ease: 'power2.out'
    });
    
    this.fadeAnimations.push(tl);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  refresh() {
    if (!this.initialized) {
      return;
    }

    // Kill existing animations
    this.cleanup(true);
    
    // Reinitialize
    this.init();
  }

  cleanup(preserveElements = false) {
    // Kill all animations
    this.animations.forEach((tl) => {
      if (tl && tl.scrollTrigger) {
        tl.scrollTrigger.kill(true);
      }
      if (tl && tl.kill) {
        tl.kill();
      }
    });
    this.animations = [];
    
    this.fadeAnimations.forEach((tl) => {
      if (tl && tl.scrollTrigger) {
        tl.scrollTrigger.kill(true);
      }
      if (tl && tl.kill) {
        tl.kill();
      }
    });
    this.fadeAnimations = [];
    
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Clear any pending timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    
    // Only reset elements if not preserving them for refresh
    if (!preserveElements) {
      document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
        gsap.set(el, { clearProps: 'all' });
      });
    }
    
    this.initialized = false;
  }
}

const animations = new TextAnimation();
export { animations };