// src/main.js

// ===== DEBUGGING CODE START =====
// Disable these modules for testing
const DISABLE_ANIMATIONS = false;
const DISABLE_SCROLLTRIGGER = false;

// Override ScrollTrigger if needed
if (DISABLE_SCROLLTRIGGER && typeof window.ScrollTrigger !== 'undefined') {
  // Save the original
  window._originalScrollTrigger = window.ScrollTrigger;
  // Replace with dummy
  window.ScrollTrigger = {
    create: () => ({ kill: () => {} }),
    refresh: () => {},
    update: () => {},
    getAll: () => [],
    kill: () => {}
  };
  console.log('ScrollTrigger disabled for debugging');
}

// Monitor scroll jumps with enhanced logging
let lastScrollY = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const jumpThreshold = 50; // Adjust as needed
  
  if (Math.abs(currentScrollY - lastScrollY) > jumpThreshold) {
    console.warn('Scroll jump detected at ' + new Date().toISOString(), {
      previous: lastScrollY,
      current: currentScrollY,
      difference: currentScrollY - lastScrollY,
      activeElement: document.activeElement,
      visibleHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight
    });
  }
  
  lastScrollY = currentScrollY;
  
  // Check for scroll prevention
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (document.body.style.overflow === 'hidden' || 
        document.documentElement.style.overflow === 'hidden') {
      console.error('Scroll might be prevented by overflow:hidden');
    }
  }, 100);
});

// Monitor document height changes
let lastDocHeight = 0;
const checkDocumentHeight = () => {
  const currentHeight = document.documentElement.scrollHeight;
  if (lastDocHeight !== 0 && Math.abs(currentHeight - lastDocHeight) > 10) {
    console.warn('Document height changed:', {
      previous: lastDocHeight,
      current: currentHeight,
      difference: currentHeight - lastDocHeight,
      timestamp: new Date().toISOString()
    });
  }
  lastDocHeight = currentHeight;
};

setInterval(checkDocumentHeight, 200);

// Override scrollTo and scrollBy to detect programmatic scrolling
const originalScrollTo = window.scrollTo;
const originalScrollBy = window.scrollBy;

window.scrollTo = function() {
  console.warn('scrollTo called with arguments:', arguments);
  return originalScrollTo.apply(this, arguments);
};

window.scrollBy = function() {
  console.warn('scrollBy called with arguments:', arguments);
  return originalScrollBy.apply(this, arguments);
};

// Monitor transform changes
const observeTransforms = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style' && 
          mutation.target.style.transform && 
          mutation.target.style.transform !== 'none') {
        console.warn('Transform detected during scroll:', {
          element: mutation.target,
          transform: mutation.target.style.transform,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  observer.observe(document.body, { 
    attributes: true, 
    subtree: true, 
    attributeFilter: ['style'] 
  });
};

// Check for fixed position elements
const checkFixedElements = () => {
  const fixedElements = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed') {
      fixedElements.push({
        element: el,
        zIndex: parseInt(style.zIndex) || 0
      });
    }
  });
  
  console.log('Fixed position elements that might affect scrolling:', fixedElements);
};

// Log touch events for debugging
document.addEventListener('touchstart', (e) => {
  console.log('Touch start detected');
  // Uncomment to test if touch events are the issue
  // e.preventDefault();
}, { passive: true });

// iOS-specific debugging
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  console.log('iOS device detected');
  
  // Monitor viewport height changes (common iOS issue)
  let lastViewportHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    const newViewportHeight = window.innerHeight;
    if (Math.abs(newViewportHeight - lastViewportHeight) > 50) {
      console.warn('iOS viewport height changed significantly:', {
        previous: lastViewportHeight,
        current: newViewportHeight,
        timestamp: new Date().toISOString()
      });
      lastViewportHeight = newViewportHeight;
    }
  });
}

// Override ScrollTrigger.update if available
if (typeof ScrollTrigger !== 'undefined' && !DISABLE_SCROLLTRIGGER) {
  const originalUpdate = ScrollTrigger.update;
  ScrollTrigger.update = function() {
    console.warn('ScrollTrigger.update called at ' + new Date().toISOString());
    return originalUpdate.apply(this, arguments);
  };
  
  const originalRefresh = ScrollTrigger.refresh;
  ScrollTrigger.refresh = function() {
    console.warn('ScrollTrigger.refresh called at ' + new Date().toISOString());
    return originalRefresh.apply(this, arguments);
  };
}

// Initialize debugging tools after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    observeTransforms();
    checkFixedElements();
    checkDocumentHeight(); // Initial height check
  });
} else {
  observeTransforms();
  checkFixedElements();
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
    if (!DISABLE_SCROLLTRIGGER && 
        typeof window.ScrollTrigger !== 'undefined' && 
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
   // console.log('Current page:', currentPage);
  } catch (error) {
    console.warn('Error initializing page detector:', error);
  }
  
  // Initialize shared modules for all pages
  // Commenting out smooth scroll for debugging
  /*
  try {
    smoothScroll.init();
  } catch (error) {
    console.warn('Error initializing smooth scroll:', error);
  }
  */

  if (pageDetector.isOneOfPages(['about', 'services'])) {
    try {
      horizontalScroll.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing horizontal scroll:', error);
    }
  }
  
  if (!DISABLE_ANIMATIONS) {
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
  }

  // Initialize page-specific modules
  if (currentPage === 'home') {
   // console.log('Initializing home page modules');
    
    try {
      fallingLogos.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing falling logos:', error);
    }
    
    try {
      homeScroll.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing home scroll:', error);
    }
  }
  
  if (currentPage === 'contacts') {
   // console.log('Initializing contacts page modules');
    
    try {
      formSteps.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing form steps:', error);
    }
  }
  
  if (currentPage === 'projects') {
   // console.log('Initializing projects page modules');
    
    try {
      projectGrid.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing project grid:', error);
    }
  }
  
  if (currentPage === 'project-details') {
   // console.log('Initializing project details page modules');
    
    try {
      nextProject.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing next project navigation:', error);
    }
  }

  // Refresh ScrollTrigger after everything is initialized
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined' && !DISABLE_SCROLLTRIGGER) {
      console.log('Initial ScrollTrigger.refresh() called');
      ScrollTrigger.refresh();
    }
  }, 300);

  // Expose modules globally only after initialization
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
    homeScroll
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
  console.log(`Resize event detected at ${new Date().toISOString()}, ${now - lastResizeTime}ms since last resize`);
  lastResizeTime = now;
  
  // Throttle resize events
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.warn('Resize event triggered, refreshing modules at ' + new Date().toISOString());
    
    // Log viewport size
    console.log(`Viewport size: ${window.innerWidth}x${window.innerHeight}`);
    
    // Refresh modules on resize
    if (!DISABLE_ANIMATIONS) {
      animations.refresh();
      buttonAnimations.refresh();
      menuAnimations.refresh();
    }
    
    // Refresh page-specific modules if needed
    if (pageDetector.isPage('home')) {
      homeScroll.refresh();
    }
    
    if (pageDetector.isPage('contacts')) {
      formSteps.refresh();
    }

    if (pageDetector.isOneOfPages(['about', 'services'])) {
      horizontalScroll.refresh();
    }
    
    if (pageDetector.isPage('projects')) {
      projectGrid.refresh();
    }
    
    if (pageDetector.isPage('project-details')) {
      nextProject.refresh();
    }
    
    // This could be causing the jumps
    if (typeof ScrollTrigger !== 'undefined' && !DISABLE_SCROLLTRIGGER) {
      console.warn('ScrollTrigger.refresh() called from resize handler');
      ScrollTrigger.refresh();
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