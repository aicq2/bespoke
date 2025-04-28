// src/modules/ui/text-animations.js

class TextAnimation {
  constructor() {
    this.initialized = false;
    this.animations = [];
    this.fadeAnimations = [];
    this.resizeObserver = null;
    this.viewportHeight = window.innerHeight;
  }

  init() {
    // Check for GSAP dependency
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not found. Text animations require this library.');
      return;
    }

    // Check for SplitText
    if (typeof SplitText === 'undefined') {
      console.warn('SplitText plugin not found. Text animations will be limited.');
    }

    // Store initial viewport height
    this.viewportHeight = window.innerHeight;
    
    // Initialize animations
    this.initTextAnimations();
    this.initFadeUpAnimations();
    
    // Set up event listeners for mobile
    this.setupMobileHandlers();
    
    this.initialized = true;
  }

  initTextAnimations() {
    const textElements = document.querySelectorAll('[data-gsap="text"]');
    if (textElements.length === 0) return;

    textElements.forEach((element) => {
      // Make text visible before animation
      gsap.set(element, { visibility: "visible" });

      // Check if SplitText is available
      if (typeof SplitText !== 'undefined') {
        // Use SplitText plugin (original implementation)
        if (!element.split) {
          element.split = new SplitText(element, {
            type: "words,chars",
            charsClass: "char",
            wordsClass: "word",
          });

          const delay = element.dataset.delay
            ? parseFloat(element.dataset.delay)
            : 0;

          const animation = gsap.from(element.split.chars, {
            opacity: 0,
            filter: "blur(5px)",
            duration: 1,
            delay: delay,
            ease: "power3.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true  // Prevent animation from restarting
            },
          });

          this.animations.push(animation);
        }
      } else {
        // Fallback if SplitText is not available
        this.splitAndAnimateTextFallback(element);
      }
    });
  }

  splitAndAnimateTextFallback(element) {
    // Implement manual text splitting as a fallback
    const words = element.textContent.split(' ');
    element.innerHTML = '';

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('div');
      wordSpan.classList.add('word');
      wordSpan.style.position = 'relative';
      wordSpan.style.display = 'inline-block';
      
      const chars = word.split('');
      
      chars.forEach((char) => {
        const charSpan = document.createElement('div');
        charSpan.classList.add('char');
        charSpan.textContent = char;
        charSpan.style.position = 'relative';
        charSpan.style.display = 'inline-block';
        wordSpan.appendChild(charSpan);
      });
      
      element.appendChild(wordSpan);
      
      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });

    const delay = element.dataset.delay
      ? parseFloat(element.dataset.delay)
      : 0;

    const charElements = element.querySelectorAll('.char');
    
    const animation = gsap.from(charElements, {
      opacity: 0,
      filter: "blur(5px)",
      duration: 1,
      delay: delay,
      ease: "power3.out",
      stagger: 0.05,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true  // Prevent animation from restarting
      },
    });

    this.animations.push(animation);
  }

  initFadeUpAnimations() {
    const fadeUpElements = document.querySelectorAll('[data-gsap="fade-up"]');
    if (fadeUpElements.length === 0) return;

    fadeUpElements.forEach((element) => {
      const delay = element.dataset.delay 
        ? parseFloat(element.dataset.delay) 
        : 0;

      const animation = gsap.fromTo(
        element,
        {
          y: "4rem",
          autoAlpha: 0,
        },
        {
          y: "0rem",
          autoAlpha: 1,
          visibility: "visible",
          duration: 1.2,
          delay: delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true  // Prevent animation from restarting
          },
        }
      );

      this.fadeAnimations.push(animation);
    });
  }

  setupMobileHandlers() {
    // Clean up existing observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Use ResizeObserver to detect height changes
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.debounce((entries) => {
        // Only update ScrollTrigger on significant height changes
        const newHeight = window.innerHeight;
        const heightDiff = Math.abs(this.viewportHeight - newHeight);
        
        if (heightDiff > 100) {
          this.viewportHeight = newHeight;
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }
      }, 200));
      
      this.resizeObserver.observe(document.documentElement);
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', this.debounce(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 300);
      }
    }, 200));
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
    if (!this.initialized) return;
    
    // Simple refresh - just update ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  cleanup() {
    // Kill animations
    this.animations.forEach(animation => {
      if (animation && animation.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    this.animations = [];
    
    this.fadeAnimations.forEach(animation => {
      if (animation && animation.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    this.fadeAnimations = [];
    
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Reset elements with SplitText
    document.querySelectorAll('[data-gsap="text"]').forEach(el => {
      if (el.split && typeof SplitText !== 'undefined') {
        el.split.revert();
        delete el.split;
      }
      gsap.set(el, { clearProps: 'all' });
    });
    
    // Reset fade-up elements
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
      gsap.set(el, { clearProps: 'all' });
    });
    
    this.initialized = false;
  }
}

const animations = new TextAnimation();
export { animations };