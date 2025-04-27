// src/main.js
import smoothScroll from './modules/core/smooth-scroll.js';
import pageDetector from './modules/core/page-detector.js';
import animations from './modules/ui/text-animations.js';
import buttonAnimations from './modules/ui/buttons.js';
import menuAnimations from './modules/ui/menu.js';
import fallingLogos from './modules/features/falling-logos.js';
import horizontalScroll from './modules/features/horizontal-scroll.js';

function initializeSiteModules() {
  // Check for required global dependencies
  if (typeof window.gsap === 'undefined') {
    console.warn('GSAP not found. Many animations will not work.');
    return;
  }
  
  // Initialize GSAP plugins if available
  try {
    if (typeof window.ScrollTrigger !== 'undefined' && 
        typeof window.ScrollSmoother !== 'undefined' &&
        typeof window.Flip !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip);
    }
  } catch (error) {
    console.warn('Error registering GSAP plugins:', error);
  }

  // Initialize shared modules for all pages
  try {
    pageDetector.init();
    console.log('Current page:', pageDetector.currentPage);
  } catch (error) {
    console.warn('Error initializing page detector:', error);
  }
  
  try {
    smoothScroll.init();
  } catch (error) {
    console.warn('Error initializing smooth scroll:', error);
  }
  
  try {
    animations.init();
  } catch (error) {
    console.warn('Error initializing animations:', error);
  }
  
  try {
    menuAnimations.init();
  } catch (error) {
    console.warn('Error initializing menu animations:', error);
  }

  try {
    buttonAnimations.init();
  } catch (error) {
    console.warn('Error initializing button animations:', error);
  }

  // Initialize page-specific modules
  if (pageDetector.isPage('home')) {
    console.log('Initializing home page modules');
    
    try {
      fallingLogos.init();
    } catch (error) {
      console.warn('Error initializing falling logos:', error);
    }
    
    try {
      horizontalScroll.init();
    } catch (error) {
      console.warn('Error initializing horizontal scroll:', error);
    }
  }

  // Refresh ScrollTrigger after everything is initialized
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 300);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSiteModules);
} else {
  initializeSiteModules();
}

// Handle window resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Refresh modules on resize
    animations.refresh();
    buttonAnimations.refresh();
    menuAnimations.refresh();
    
    // Refresh page-specific modules if needed
    if (pageDetector.isPage('home')) {
      horizontalScroll.init(); // Reinitialize on resize
    }
    
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250);
});

// Expose modules globally for debugging
window.siteModules = {
  smoothScroll,
  pageDetector,
  animations,
  buttonAnimations,
  menuAnimations,
  fallingLogos,
  horizontalScroll
};