// src/main.js
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
import { projectScroll } from './modules/features/scroll/project-scroll.js';

// Prevent ScrollTrigger from forcing scroll position on refresh
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
  
  // Initialize shared modules for all pages
  try {
    smoothScroll.init();
  } catch (error) {
    console.warn('Error initializing smooth scroll:', error);
  }

  if (pageDetector.isOneOfPages(['about', 'services'])) {
    try {
      horizontalScroll.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing horizontal scroll:', error);
    }
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
  if (currentPage === 'home') {
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
    try {
      formSteps.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing form steps:', error);
    }
  }
  
  if (currentPage === 'projects') {
    try {
      projectGrid.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing project grid:', error);
    }
  }
  
  if (currentPage === 'project-details') {
    try {
      nextProject.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing next project navigation:', error);
    }
    
    // Initialize project scroll for horizontal scrolling on project detail pages
    try {
      projectScroll.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing project scroll:', error);
    }
  }

  // Refresh ScrollTrigger after everything is initialized
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
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
    horizontalScroll,
    projectScroll  
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSiteModules);
} else {
  initializeSiteModules();
}

// Track significant dimension changes
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
const widthThreshold = 50;  // Only care about significant width changes
const heightThreshold = 150; // More tolerant of height changes

// Handle window resize events - IMPROVED VERSION
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  
  // Get current dimensions
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;
  
  // Calculate changes
  const widthChange = Math.abs(currentWidth - lastWidth);
  const heightChange = Math.abs(currentHeight - lastHeight);
  
  // Only process if there's a significant change
  if (widthChange > widthThreshold || heightChange > heightThreshold) {
    resizeTimeout = setTimeout(() => {
      // Update stored dimensions
      lastWidth = currentWidth;
      lastHeight = currentHeight;
      
      // Save current scroll position
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Refresh modules
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
      
      if (pageDetector.isPage('project-details')) {
        if (nextProject) nextProject.refresh();
        if (projectScroll) projectScroll.refresh(); // Add projectScroll refresh
      }
      
      // Only refresh ScrollTrigger if we're not on mobile OR if width changed significantly
      if ((currentWidth > 768 || widthChange > 100) && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
        
        // Restore scroll position
        setTimeout(() => {
          window.scrollTo(scrollX, scrollY);
        }, 50);
      }
    }, 500); // Longer delay for better performance
  }
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
  horizontalScroll,
  projectScroll  // Add projectScroll to the exposed modules
};