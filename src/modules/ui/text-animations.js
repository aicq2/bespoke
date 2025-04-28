// src/modules/features/text-animation.js

class TextAnimation {
  constructor() {
    this.initialized = false;
    this.animations = [];
    this.fadeAnimations = [];
    this.resizeObserver = null;
  }

  init() {
    // Check for GSAP dependency
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not found. Text animations require this library.');
      return;
    }

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

    // Handle browser bar issues on mobile
    this.setupResizeObserver();

    this.initialized = true;
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
      const charElements = wordSpan.querySelectorAll('.char');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
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
        toggleActions: 'play none none none'
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

  setupResizeObserver() {
    // Clean up existing observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Create a resize observer to handle mobile browser bar issues
    this.resizeObserver = new ResizeObserver(this.debounce(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 200));
    
    // Observe document body
    this.resizeObserver.observe(document.body);
    
    // Also handle regular window resize
    window.addEventListener('resize', this.debounce(() => {
      this.refreshAnimations();
    }, 200));
    
    // Handle orientation change explicitly
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.refreshAnimations();
      }, 300);
    });
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

  refreshAnimations() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh(true);
    }
  }

  refresh() {
    if (!this.initialized) {
      return;
    }

    // Kill existing animations
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
    
    // Reset elements
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
      gsap.set(el, { clearProps: 'all' });
    });
    
    // Reinitialize
    this.init();
  }

  cleanup() {
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
    
    // Reset elements
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
      gsap.set(el, { clearProps: 'all' });
    });
    
    this.initialized = false;
  }
}

const animations = new TextAnimation();
export { animations };