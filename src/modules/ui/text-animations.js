// src/modules/ui/text-animations.js

class Animations {
  constructor() {
    this.initialized = false;
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
      this.initGlobalAnimations();
    }
  }

  initGlobalAnimations() {
    // Text animations with SplitText
    const textElements = document.querySelectorAll('[data-gsap="text"]');
    textElements.forEach((element) => {
      gsap.set(element, { visibility: "visible" });

      if (!element.split) {
        element.split = new SplitText(element, {
          type: "words,chars",
          charsClass: "char",
          wordsClass: "word",
        });

        const delay = element.dataset.delay
          ? parseFloat(element.dataset.delay)
          : 0;

        gsap.from(element.split.chars, {
          opacity: 0,
          filter: "blur(5px)",
          duration: 1,
          delay: delay,
          ease: "power3.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
          },
        });
      }
    });

    // Fade up animation
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
          },
        }
      );
    });
  }
}

// Create and export a single instance
const animations = new Animations();
export { animations };