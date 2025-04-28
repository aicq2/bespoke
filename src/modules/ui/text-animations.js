
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

    this.initGlobalAnimations();
    this.initialized = true;
  }

  refresh() {
    if (this.initialized) {
      // Kill existing ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // Revert split text
      this.splitTextInstances.forEach((split, element) => {
        if (split && split.revert) {
          split.revert();
        }
      });
      
      // Clear the stored instances
      this.splitTextInstances = new WeakMap();
      
      // Reinit animations
      this.initGlobalAnimations();
    }
  }

  initGlobalAnimations() {
    // Text split animations
    const textElements = document.querySelectorAll('[data-gsap="text"]');
    textElements.forEach((element) => {
      gsap.set(element, { visibility: "visible" });

      try {
        // Create new split instance
        const split = new SplitText(element, {
          type: "words,chars",
          charsClass: "char",
          wordsClass: "word",
        });

        // Store the split instance
        this.splitTextInstances.set(element, split);

        const delay = element.dataset.delay ? parseFloat(element.dataset.delay) : 0;

        gsap.from(split.chars, {
          opacity: 0,
          filter: "blur(5px)",
          duration: 1,
          delay: delay,
          ease: "power3.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
          }
        });
      } catch (error) {
        console.warn('Error creating text animation:', error);
      }
    });

    // Fade up animations
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
          visibility: "visible",
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
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    this.splitTextInstances.forEach((split, element) => {
      if (split && split.revert) {
        split.revert();
      }
    });
    
    this.splitTextInstances = new WeakMap();
    this.initialized = false;
  }
}

const animations = new Animations();
export { animations };
