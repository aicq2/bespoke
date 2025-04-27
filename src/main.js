// src/main.js

// Import core modules
import smoothScroll from './modules/core/smooth-scroll.js';

console.log('Main.js loaded, about to initialize components');

// Initialize core functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking if GSAP is available');
  
  // Verify GSAP is available (these come from CDN)
  if (typeof gsap === 'undefined') {
    console.error('GSAP not found. Make sure you have included the GSAP script in your Webflow page.');
    return;
  }

  // Verify ScrollTrigger is available
  if (typeof ScrollTrigger === 'undefined') {
    console.error('ScrollTrigger not found. Make sure you have included the ScrollTrigger script in your Webflow page.');
    return;
  }
  
  try {
    console.log('Initializing smooth scrolling...');
    // Initialize smooth scrolling
    smoothScroll.init();
    
    // Check for ScrollSmoother instance
    if (smoothScroll.getSmoother()) {
      console.log('ScrollSmoother instance available');
    } else {
      console.log('ScrollSmoother not initialized - check page structure or screen size');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
  
  // Listen for load event to refresh ScrollSmoother after all assets are loaded
  window.addEventListener('load', () => {
    try {
      smoothScroll.refresh();
      console.log('ScrollSmoother refreshed after full page load');
    } catch (error) {
      console.error('Error refreshing ScrollSmoother:', error);
    }
  });
});

// Export the smooth scroll instance for potential manual use in Webflow
window.smoothScroll = smoothScroll;