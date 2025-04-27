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
  
      const container = document.querySelector(".container-large");
      if (!container) {
        console.warn('Home horizontal scroll: container-large not found');
        return;
      }
  
      // Calculate the track width and scroll distance with a buffer
      const getScrollDistance = () => {
        // Get the actual width of the track (all items combined)
        let trackWidth = 0;
        const items = track.children;
        for (let i = 0; i < items.length; i++) {
          trackWidth += items[i].offsetWidth;
        }
        
        // Add spacing between items if they have margins
        const computedStyle = window.getComputedStyle(items[0]);
        const marginRight = parseInt(computedStyle.marginRight, 10) || 0;
        trackWidth += marginRight * (items.length - 1);
        
        // Get the container width (visible area)
        const containerWidth = container.offsetWidth;
        
        // Add a small buffer (1.5%) to ensure complete scrolling
        const buffer = trackWidth * 0.015;
        
        return trackWidth - containerWidth + buffer;
      };
  
      // Create the horizontal scroll animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance() + 50}`, // Add 50px extra for safety
          pin: sticky,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Log progress for debugging
             console.log(`Progress: ${self.progress.toFixed(3)}, Position: ${-getScrollDistance() * self.progress}`);
          }
        }
      });
  
      // Animate the track with a slightly larger scroll distance
      tl.to(track, {
        x: () => -getScrollDistance(),
        ease: "none"
      });
  
      // Store the ScrollTrigger for cleanup
      this.scrollTrigger = tl.scrollTrigger;
      
      // Log initial calculations
      console.log(`Track scroll distance: ${getScrollDistance()}px`);
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