// src/modules/scroll/home-scroll.js

class HomeScroll {
    constructor() {
      this.scrollTrigger = null;
      this.initialized = false;
      this.debugMode = true; // Set to false in production
    }
  
    init(params = {}) {
      const { currentPage } = params;
      
      // Only initialize on home page
      if (currentPage !== 'home') {
        return;
      }
  
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not found. Home scroll requires these libraries.');
        return;
      }
  
      // Wait a bit for images to load to get correct measurements
      setTimeout(() => {
        this.initHomeHorizontalScroll();
        this.initialized = true;
      }, 500);
    }
  
    log(...args) {
      if (this.debugMode) {
        console.log(...args);
      }
    }
  
    initHomeHorizontalScroll() {
      // Clean up any existing ScrollTrigger
      if (this.scrollTrigger) {
        this.scrollTrigger.kill();
        this.scrollTrigger = null;
      }
      
      // Find the section and track elements
      const section = document.querySelector(".section-horizontal");
      if (!section) {
        console.warn('Home horizontal scroll: section-horizontal not found');
        return;
      }
      
      const sticky = document.querySelector(".sticky-screen");
      if (!sticky) {
        console.warn('Home horizontal scroll: sticky-screen not found');
        return;
      }
      
      const track = document.querySelector(".recent_collection");
      if (!track) {
        console.warn('Home horizontal scroll: recent_collection not found');
        return;
      }
  
      // Measure directly
      const trackWidth = track.scrollWidth;
      const visibleWidth = window.innerWidth;
      
      // Log the measurements
      this.log('Track width:', trackWidth);
      this.log('Visible width:', visibleWidth);
      
      // Calculate scroll distance
      const scrollDistance = trackWidth - visibleWidth;
      
      if (scrollDistance <= 0) {
        console.warn('Scroll distance is zero or negative. Nothing to scroll.');
        return;
      }
  
      this.log('Scroll distance:', scrollDistance);
      
      // Create ScrollTrigger
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${section.offsetHeight}`,
        pin: sticky,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (this.debugMode) {
            // Log in 10% increments for debugging
            const progress = Math.round(self.progress * 100) / 100;
            if (progress % 0.1 < 0.01 || progress % 0.1 > 0.99) {
              this.log(`Progress: ${progress.toFixed(2)}, Position: ${-scrollDistance * self.progress}`);
            }
          }
          
          // Apply the transform directly
          gsap.set(track, {
            x: -scrollDistance * self.progress,
            ease: "none"
          });
        }
      });
  
      this.scrollTrigger = trigger;
    }
  
    refresh() {
      if (!this.initialized) return;
      
      this.log('Refreshing home scroll');
      // Re-initialize to get fresh measurements
      this.cleanup();
      this.initHomeHorizontalScroll();
    }
  
    cleanup() {
      if (this.scrollTrigger) {
        this.scrollTrigger.kill();
        this.scrollTrigger = null;
      }
      
      // Reset the track position
      const track = document.querySelector(".recent_collection");
      if (track) {
        gsap.set(track, { clearProps: "all" });
      }
      
      this.initialized = false;
    }
  }
  
  const homeScroll = new HomeScroll();
  export { homeScroll };