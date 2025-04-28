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

    gsap.delayedCall(0.1, () => {
      this.initGlobalAnimations();
      this.initialized = true;
      ScrollTrigger.refresh();
      console.log('Animations Initialized and ScrollTrigger refreshed.');
    });
  }

  refresh() {
    if (this.initialized) {
      console.log('Refreshing animations...');
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      const splitsToRevert = [];
      document.querySelectorAll('[data-gsap="text"]').forEach(element => {
        const split = this.splitTextInstances.get(element);
        if (split && split.revert) {
          splitsToRevert.push(split);
        }
      });
      splitsToRevert.forEach(split => split.revert());

      this.splitTextInstances = new WeakMap();

      gsap.delayedCall(0.1, () => {
        this.initGlobalAnimations();
        ScrollTrigger.refresh();
        console.log('Animations Refreshed and ScrollTrigger refreshed.');
      });
    }
  }

  initGlobalAnimations() {
    console.log('Initializing global animations...');
    const textElements = document.querySelectorAll('[data-gsap="text"]');
    textElements.forEach((element) => {
      try {
        const split = new SplitText(element, {
          type: "words,chars",
          charsClass: "char",
          wordsClass: "word",
        });
        this.splitTextInstances.set(element, split);

        const delay = element.dataset.delay ? parseFloat(element.dataset.delay) : 0;

        gsap.set(split.chars, { autoAlpha: 0, filter: "blur(5px)", y: "10px" });

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
          }
        });
      } catch (error) {
        console.warn('Error creating text animation:', error);
      }
    });

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
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    const splitsToRevert = [];
    document.querySelectorAll('[data-gsap="text"]').forEach(element => {
        const split = this.splitTextInstances.get(element);
        if (split && split.revert) {
            splitsToRevert.push(split);
        }
    });
    splitsToRevert.forEach(split => split.revert());

    this.splitTextInstances = new WeakMap();
    this.initialized = false;
  }
}

const animations = new Animations();

document.addEventListener('DOMContentLoaded', () => {
    animations.init();

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