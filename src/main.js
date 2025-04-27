// src/main.js
import smoothScroll from './modules/core/smooth-scroll.js';
// Import other modules as needed
// import animations from './modules/core/animations.js';
// import menu from './modules/ui/menu.js';
// import fallingLogos from './modules/features/falling-logos.js';

console.log('Main.js bundle execution started.');

/**
 * Initializes all JavaScript components and modules for the site.
 * Ensures necessary global libraries (like GSAP) are available first.
 */
function initializeSiteModules() {
  console.log('DOM fully loaded. Starting site module initialization...');

  // --- Prerequisite Checks ---
  // Verify essential libraries loaded via <script> tags are available globally.
  if (typeof window.gsap === 'undefined') {
    console.error('Initialization Error: GSAP not found globally. Ensure the GSAP script tag is loaded before this bundle.');
    return; // Halt initialization
  }
  if (typeof window.ScrollTrigger === 'undefined') {
    console.error('Initialization Error: ScrollTrigger not found globally. Ensure the ScrollTrigger script tag is loaded before this bundle.');
    return; // Halt initialization
  }
   if (typeof window.ScrollSmoother === 'undefined') {
    console.error('Initialization Error: ScrollSmoother not found globally. Ensure the ScrollSmoother script tag is loaded before this bundle.');
    return; // Halt initialization
  }
  // Add checks for other critical libraries like Flip, SplitText if modules depend on them directly

  console.log('Prerequisite libraries (GSAP, ScrollTrigger, ScrollSmoother) found.');

  // It's good practice to register GSAP plugins early, although smooth-scroll.js also does it.
  try {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother); // Add Flip, SplitText etc. if needed by other modules
      console.log('GSAP plugins registered from main.js.');
  } catch (error) {
      console.error('Error registering GSAP plugins from main.js:', error);
      // Decide if you should return here or let modules handle potential issues
  }

  // --- Initialize Core Modules ---
  try {
    console.log('Initializing SmoothScroll...');
    smoothScroll.init(); // Initialize the smooth scroll module
    // Check if it successfully created an instance (useful for debugging)
    if (smoothScroll.getSmoother()) {
      console.log('SmoothScroll initialization resulted in an active smoother instance.');
    } else {
      console.log('SmoothScroll initialization complete, but no smoother instance was created (likely due to mobile viewport or missing DOM elements).');
    }
  } catch (error) {
    console.error('Error during SmoothScroll initialization:', error);
  }

  // try {
  //   console.log('Initializing Animations...');
  //   animations.init();
  // } catch (error) {
  //   console.error('Error during Animations initialization:', error);
  // }

  // --- Initialize UI Modules ---
  // try {
  //   console.log('Initializing Menu...');
  //   menu.init();
  // } catch (error) {
  //   console.error('Error during Menu initialization:', error);
  // }

  // --- Initialize Feature Modules ---
  // try {
  //   console.log('Initializing FallingLogos...');
  //   fallingLogos.init();
  // } catch (error) {
  //   console.error('Error during FallingLogos initialization:', error);
  // }


  console.log('Site module initialization sequence finished.');
}

// --- Execution Trigger ---
// Ensures the DOM is ready before running initialization logic.
if (document.readyState === 'loading') {
  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', initializeSiteModules);
} else {
  // `DOMContentLoaded` has already fired
  initializeSiteModules();
}

// --- Global Exports (Optional) ---
// Expose instances globally if needed for debugging in the browser console
// or for potential interaction with Webflow's native interactions/scripts.
window.siteModules = {
    smoothScroll: smoothScroll,
    // Add other modules here if needed:
    // animations: animations,
    // menu: menu,
};
console.log('smoothScroll instance exposed globally as window.siteModules.smoothScroll');
