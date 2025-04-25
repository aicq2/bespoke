// src/modules/core/smooth-scroll.js
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

// Register the plugins
gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

export default {
  smoother: null,
  
  init() {
    // Initialize ScrollSmoother
    this.smoother = ScrollSmoother.create({
      smooth: 1, // Adjust this value for smoother/faster scrolling
      effects: true,
      normalizeScroll: true,
      ignoreMobileResize: true
    });
    
    // Set up ScrollTrigger defaults
    ScrollTrigger.defaults({ 
      markers: false,
      scrub: true
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh(true);
    });
    
    return this.smoother;
  },
  
  destroy() {
    if (this.smoother) {
      this.smoother.kill();
      this.smoother = null;
    }
  },
  
  refresh() {
    ScrollTrigger.refresh();
  }
};