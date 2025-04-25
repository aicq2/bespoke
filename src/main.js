// src/main.js

// Import core modules
import smoothScroll from './modules/core/smooth-scroll.js';

// Initialize core functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize smooth scrolling
  smoothScroll.init();
  
  // Log initialization for debugging
  console.log('Main.js initialized with smooth scrolling');
  
  // Check for ScrollSmoother instance
  if (smoothScroll.getSmoother()) {
    console.log('ScrollSmoother successfully initialized');
  } else {
    console.log('ScrollSmoother not initialized - check page structure or screen size');
  }
  
  // Listen for load event to refresh ScrollSmoother after all assets are loaded
  window.addEventListener('load', () => {
    smoothScroll.refresh();
    console.log('ScrollSmoother refreshed after full page load');
  });
});

// Export the smooth scroll instance for potential manual use in Webflow
window.smoothScroll = smoothScroll;