// src/main.js

// ===== SIMPLIFIED DEBUGGING CODE START =====
// Monitor scroll jumps with enhanced logging
let lastScrollY = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const jumpThreshold = 50; // Adjust as needed
  
  if (Math.abs(currentScrollY - lastScrollY) > jumpThreshold) {
    console.warn('Scroll jump detected:', {
      previous: lastScrollY,
      current: currentScrollY,
      difference: currentScrollY - lastScrollY,
      timestamp: new Date().toISOString()
    });
  }
  
  lastScrollY = currentScrollY;
});

// Override scrollTo and scrollBy to detect and potentially block programmatic scrolling
const originalScrollTo = window.scrollTo;
window.scrollTo = function() {
  // Log the call
  console.warn('scrollTo called with arguments:', arguments);
  
  // IMPORTANT: Block scrollTo calls that come from ScrollTrigger refreshes
  // This is the key fix for the jumping issue
  const stack = new Error().stack || '';
  if (stack.includes('refresh') && arguments[1] !== 0) {
    console.warn('Blocked scrollTo from ScrollTrigger refresh');
    return;
  }
  
  return originalScrollTo.apply(this, arguments);
};

// Initialize debugging tools after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
  });
} else {
  // Initial setup
}
// ===== DEBUGGING CODE END =====

import { smoothScroll } from './modules/core/smooth-scroll.js';
import { pageDetector } from './modules/core/page-detector.js';
import { animations } from './modules/ui/text-animations.js';
import { buttonAnimations } from './modules/ui/buttons.js';
import { menuAnimations } from './modules/ui/menu.js';
import { fallingLogos } from './modules/features/falling-logos.js';
import { formSteps } from './modules/features/form-steps.js';
import { projectGrid } from './modules/features/project-grid.js';
import { nextProject } from './modules/features/next-project.js';
import { homeScroll } from './modules/features/scroll/home-scroll.js';
import { horizontalScroll } from './modules/features/scroll/about-services-scroll';

// IMPORTANT: Add this before any ScrollTrigger is used
// This prevents ScrollTrigger from forcing scroll position on refresh
function preventScrollPositionReset() {
  if (typeof ScrollTrigger !== 'undefined') {
    // Store the original method
    const originalRefresh = ScrollTrigger.refresh;
    
    // Override the refresh method
    ScrollTrigger.refresh = function() {
      // Save current scroll position
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Call the original refresh
      const result = originalRefresh.apply(this, arguments);
      
      // Restore scroll position after a very short delay
      setTimeout(() => {
        window.scrollTo(scrollX, scrollY);
      }, 10);
      
      return result;
    };
    
    console.log('ScrollTrigger refresh modified to prevent scroll jumps');
  }
}

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
      
      // Apply our fix to prevent scroll jumps
      preventScrollPositionReset();
    }
  } catch (error) {
    console.warn('Error registering GSAP plugins:', error);
  }

  // Initialize page detector first
  let currentPage = 'unknown';
  try {
    currentPage = pageDetector.init();
  } catch (error) {
    console.warn('Error initializing page detector:', error);
  }
  
  // Create an array of all modules for easier management
  const allModules = [
    // Commenting out smooth scroll for debugging
    // smoothScroll,
    animations,
    buttonAnimations,
    menuAnimations,
    fallingLogos,
    formSteps,
    projectGrid,
    nextProject,
    homeScroll,
    horizontalScroll
  ];
  
  // Initialize all modules - each module will decide if it should run
  allModules.forEach(module => {
    try {
      if (module && typeof module.init === 'function') {
        module.init({ currentPage });
      }
    } catch (error) {
      console.warn(`Error initializing module:`, error);
    }
  });

  // Refresh ScrollTrigger after everything is initialized
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      console.log('Initial ScrollTrigger.refresh() called');
      ScrollTrigger.refresh();
    }
  }, 300);

  // Expose modules globally
  window.siteModules = {
    smoothScroll,
    pageDetector,
    animations,
    buttonAnimations,
    menuAnimations,
    fallingLogos,
    formSteps,
    projectGrid,
    nextProject,
    homeScroll,
    horizontalScroll
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSiteModules);
} else {
  initializeSiteModules();
}

// Handle window resize events - MODIFIED TO REDUCE IMPACT
let resizeTimeout;
let lastResizeTime = 0;

window.addEventListener('resize', () => {
  const now = Date.now();
  const timeSinceLastResize = now - lastResizeTime;
  
  // Only log if it's been more than 500ms since last resize
  // to reduce console spam
  if (timeSinceLastResize > 500) {
    console.log(`Resize event detected, ${timeSinceLastResize}ms since last resize`);
  }
  lastResizeTime = now;
  
  // IMPORTANT: Increase throttle time to reduce refresh frequency
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.warn('Resize event triggered, refreshing modules');
    
    // Log viewport size
    console.log(`Viewport size: ${window.innerWidth}x${window.innerHeight}`);
    
    // Save current scroll position before refreshing
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Refresh all modules
    if (animations) animations.refresh();
    if (buttonAnimations) buttonAnimations.refresh();
    if (menuAnimations) menuAnimations.refresh();
    
    if (pageDetector.isPage('home') && homeScroll) {
      homeScroll.refresh();
    }
    
    if (pageDetector.isPage('contacts') && formSteps) {
      formSteps.refresh();
    }
    
    if (pageDetector.isOneOfPages(['about', 'services']) && horizontalScroll) {
      horizontalScroll.refresh();
    }
    
    if (pageDetector.isPage('projects') && projectGrid) {
      projectGrid.refresh();
    }
    
    if (pageDetector.isPage('project-details') && nextProject) {
      nextProject.refresh();
    }
    
    // Refresh ScrollTrigger with our modified version that preserves scroll position
    if (typeof ScrollTrigger !== 'undefined') {
      console.warn('ScrollTrigger.refresh() called from resize handler');
      ScrollTrigger.refresh();
      
      // Restore scroll position after a short delay
      setTimeout(() => {
        window.scrollTo(scrollX, scrollY);
      }, 50);
    }
  }, 500); // Increased from 250ms to 500ms to reduce frequency
});

// Expose modules globally for debugging
window.siteModules = {
  smoothScroll,
  pageDetector,
  animations,
  buttonAnimations,
  menuAnimations,
  fallingLogos,
  formSteps,
  projectGrid,
  nextProject,
  homeScroll,
  horizontalScroll
};