// src/modules/scroll/home-scroll.js

class HomeScroll {
    constructor() {
      this.scrollTrigger = null;
      this.initialized = false;
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
  
      try {
        this.initHomeHorizontalScroll();
        this.initialized = true;
      } catch (error) {
        console.error('Error initializing home horizontal scroll:', error);
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
      
      const track = document.querySelector(".track");
      if (!track) {
        console.warn('Home horizontal scroll: track not found');
        return;
      }
  
      // Calculate the track width and scroll distance
      const getScrollDistance = () => {
        const trackWidth = track.scrollWidth;
        const windowWidth = window.innerWidth;
        return trackWidth - windowWidth;
      };
  
      // Create the horizontal scroll animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: sticky,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
  
      // Animate the track from left to right (positive values move left)
      tl.to(track, {
        x: () => -getScrollDistance(),
        ease: "none"
      });
  
      // Store the ScrollTrigger for cleanup
      this.scrollTrigger = tl.scrollTrigger;
    }
  
    refresh() {
      if (!this.initialized) return;
      
      if (this.scrollTrigger) {
        this.scrollTrigger.refresh();
      }
    }
  
    cleanup() {
      if (this.scrollTrigger) {
        this.scrollTrigger.kill();
        this.scrollTrigger = null;
      }
      
      // Reset the track position
      const track = document.querySelector(".track");
      if (track) {
        gsap.set(track, { clearProps: "all" });
      }
      
      this.initialized = false;
    }
  }
  
  const homeScroll = new HomeScroll();
  export { homeScroll };