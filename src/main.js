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

// Monitor document height changes
let lastDocHeight = 0;
const checkDocumentHeight = () => {
  const currentHeight = document.documentElement.scrollHeight;
  if (lastDocHeight !== 0 && Math.abs(currentHeight - lastDocHeight) > 10) {
    console.warn('Document height changed:', {
      previous: lastDocHeight,
      current: currentHeight,
      difference: currentHeight - lastDocHeight
    });
  }
  lastDocHeight = currentHeight;
};

setInterval(checkDocumentHeight, 500);

// Override scrollTo and scrollBy to detect programmatic scrolling
const originalScrollTo = window.scrollTo;
window.scrollTo = function() {
  console.warn('scrollTo called with arguments:', arguments);
  return originalScrollTo.apply(this, arguments);
};

// Override ScrollTrigger.refresh if available
if (typeof ScrollTrigger !== 'undefined') {
  const originalRefresh = ScrollTrigger.refresh;
  ScrollTrigger.refresh = function() {
    console.warn('ScrollTrigger.refresh called at ' + new Date().toISOString());
    return originalRefresh.apply(this, arguments);
  };
}

// Initialize debugging tools after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    checkDocumentHeight(); // Initial height check
  });
} else {
  checkDocumentHeight(); // Initial height check
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

// Handle window resize events - THIS COULD BE THE CULPRIT
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
  
  // Throttle resize events
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.warn('Resize event triggered, refreshing modules');
    
    // Log viewport size
    console.log(`Viewport size: ${window.innerWidth}x${window.innerHeight}`);
    
    // IMPORTANT: Try disabling ScrollTrigger.refresh() to see if it fixes the jumps
    // Comment out this entire block to test
    if (typeof ScrollTrigger !== 'undefined') {
      console.warn('ScrollTrigger.refresh() called from resize handler');
      ScrollTrigger.refresh();
    }
    
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
    
    // Check document height after refresh
    setTimeout(checkDocumentHeight, 100);
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
  formSteps,
  projectGrid,
  nextProject,
  homeScroll,
  horizontalScroll
};