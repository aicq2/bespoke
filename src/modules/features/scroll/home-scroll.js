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
        // Let's use setTimeout to ensure everything is properly loaded
        setTimeout(() => {
          this.initHomeHorizontalScroll();
          this.initialized = true;
        }, 100);
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
      
      // Elements
      const section = document.querySelector(".section-horizontal");
      const sticky = document.querySelector(".sticky-screen");
      const track = document.querySelector(".track");
      
      if (!section || !sticky || !track) {
        console.warn('Required elements not found for home scroll');
        return;
      }
      
      // For debugging
      console.log("Section height:", section.offsetHeight);
      console.log("Track width:", track.scrollWidth);
      console.log("Visible width:", window.innerWidth);
      
      // Create a simple ScrollTrigger with a timeline
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom", // Use the full section height
          pin: sticky,
          anticipatePin: 1,
          scrub: 1
        }
      });
      
      // Calculate the scroll distance
      const scrollDistance = track.scrollWidth - window.innerWidth + 100; // Add a buffer
      
      // Add the horizontal movement to the timeline
      tl.to(track, {
        x: -scrollDistance,
        ease: "none"
      });
      
      this.scrollTrigger = tl.scrollTrigger;
      
      console.log("Scroll setup complete. Distance:", scrollDistance);
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