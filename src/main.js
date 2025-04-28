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
//import { homeScroll } from './modules/features/scroll/home-scroll.js';
import { horizontalScroll } from './modules/features/scroll/about-services-scroll';

function initializeSiteModules() {
  // Check for required global dependencies
  if (typeof window.gsap === 'undefined') {
    console.warn('GSAP not found. Many animations will not work.');
    return;
  }

  window.addEventListener('scroll', () => {
    console.log('Scroll position:', window.scrollY);
  });
  
  // Initialize GSAP plugins if available
/*
try {
  if (typeof window.ScrollTrigger !== 'undefined' && 
      typeof window.ScrollSmoother !== 'undefined' &&
      typeof window.Flip !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip);
  }
} catch (error) {
  console.warn('Error registering GSAP plugins:', error);
}
*/

  // Initialize page detector first
  let currentPage = 'unknown';
  try {
    currentPage = pageDetector.init();
   // console.log('Current page:', currentPage);
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
   // console.log('Initializing home page modules');
    
    try {
      fallingLogos.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing falling logos:', error);
    }
    
    /*try {
      homeScroll.init({ currentPage });
    } catch (error) {
      console.warn('Error initializing home scroll:', error);
    }*/
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
    if (typeof ScrollTrigger !== 'undefined') {
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
   // homeScroll
  };
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
   /* if (pageDetector.isPage('home')) {
      homeScroll.refresh();
    }*/
    
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
  formSteps,
  projectGrid,
  nextProject,
  //homeScroll,
  horizontalScroll
};