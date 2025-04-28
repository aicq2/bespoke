class Animations {
  constructor() {
    this.initialized = false;
    this.splitTextInstances = new WeakMap();
  }

  init() {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP, SplitText or ScrollTrigger not found. Text animations require these libraries.');
      return;
    }

    try {
      gsap.registerPlugin(ScrollTrigger, SplitText);
    } catch (error) {
      console.warn('Error registering GSAP plugins:', error);
      return;
    }

    gsap.delayedCall(0.5, () => {
      this.initGlobalAnimations();
      this.initialized = true;
      ScrollTrigger.refresh();
      console.log('Animations Initialized and ScrollTrigger refreshed.');
    });
  }

  refresh() {
    if (this.initialized) {
      console.log('Refreshing animations...');
      
      // Kill all ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      // Revert SplitText instances
      const splitsToRevert = [];
      document.querySelectorAll('[data-gsap="text"]').forEach(element => {
        const split = this.splitTextInstances.get(element);
        if (split && typeof split.revert === 'function') {
          splitsToRevert.push(split);
        }
      });
      
      splitsToRevert.forEach(split => {
        try {
          split.revert();
        } catch (error) {
          console.warn('Error reverting SplitText:', error);
        }
      });

      // Clear the WeakMap
      this.splitTextInstances = new WeakMap();

      // Re-initialize with a slight delay
      gsap.delayedCall(0.5, () => {
        this.initGlobalAnimations();
        ScrollTrigger.refresh();
        console.log('Animations Refreshed and ScrollTrigger refreshed.');
      });
    }
  }

  initGlobalAnimations() {
    console.log('Initializing global animations...');
    
    // Handle text animations
    const textElements = document.querySelectorAll('[data-gsap="text"]');
    console.log(`Found ${textElements.length} text elements for animation`);
    
    textElements.forEach((element) => {
      try {
        // Make sure the element is visible before splitting
        gsap.set(element, { visibility: "visible" });
        
        // Create new SplitText instance
        const split = new SplitText(element, {
          type: "words,chars",
          charsClass: "char",
          wordsClass: "word",
        });
        
        // Store the instance for cleanup
        this.splitTextInstances.set(element, split);

        const delay = element.dataset.delay ? parseFloat(element.dataset.delay) : 0;

        // Set initial state
        gsap.set(split.chars, { 
          autoAlpha: 0, 
          filter: "blur(5px)", 
          y: "10px" 
        });

        // Create the animation
        gsap.to(split.chars, {
          autoAlpha: 1,
          filter: "blur(0px)",
          y: "0px",
          duration: 1,
          delay: delay,
          ease: "power3.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            markers: false,  // Set to true for debugging
            onEnter: () => console.log(`Text animation triggered for: ${element.textContent.substring(0, 20)}...`)
          }
        });
        
        console.log(`Created text animation for: ${element.textContent.substring(0, 20)}...`);
      } catch (error) {
        console.warn('Error creating text animation:', error, element);
      }
    });

    // Handle fade-up animations
    const fadeUpElements = document.querySelectorAll('[data-gsap="fade-up"]');
    fadeUpElements.forEach((element) => {
      const delay = element.dataset.delay ? parseFloat(element.dataset.delay) : 0;

      gsap.fromTo(
        element,
        {
          y: "4rem",
          autoAlpha: 0,
        },
        {
          y: "0rem",
          autoAlpha: 1,
          duration: 1.2,
          delay: delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
          }
        }
      );
    });
  }

  cleanup() {
    console.log('Cleaning up animations...');
    
    // Kill all ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Revert SplitText instances
    const splitsToRevert = [];
    document.querySelectorAll('[data-gsap="text"]').forEach(element => {
        const split = this.splitTextInstances.get(element);
        if (split && typeof split.revert === 'function') {
            splitsToRevert.push(split);
        }
    });
    
    splitsToRevert.forEach(split => {
      try {
        split.revert();
      } catch (error) {
        console.warn('Error reverting SplitText:', error);
      }
    });

    this.splitTextInstances = new WeakMap();
    this.initialized = false;
  }
}

const animations = new Animations();

document.addEventListener('DOMContentLoaded', () => {
    // Allow a short delay for all scripts to load
    setTimeout(() => {
        animations.init();
    }, 100);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log('Resize detected, refreshing animations...');
            if (animations.initialized) {
                animations.refresh();
            }
        }, 250);
    });
});

export { animations };