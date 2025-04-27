// src/modules/core/smooth-scroll.js

/**
 * Manages the GSAP ScrollSmoother instance.
 * Assumes GSAP core, ScrollTrigger, and ScrollSmoother are loaded globally
 * via <script> tags before this module's init() is called.
 */
class SmoothScroll {
  constructor() {
    this.smoother = null;
    // Breakpoint below which ScrollSmoother will be disabled
    this.breakpoint = 768;
    this.resizeTimeout = null; // For debouncing resize events
    console.log('SmoothScroll class instantiated');
  }

  /**
   * Initializes the ScrollSmoother functionality.
   * Checks for necessary prerequisites (GSAP, ScrollSmoother, DOM elements)
   * and screen size before creating the instance.
   */
  init() {
    console.log('SmoothScroll init called');

    // 1. Check if GSAP and ScrollSmoother are loaded globally
    if (typeof gsap === 'undefined') {
        console.error('SmoothScroll Error: GSAP core not found. Ensure it is loaded via <script> tag before this bundle.');
        return;
    }
    if (typeof ScrollSmoother === 'undefined') {
      console.error('SmoothScroll Error: ScrollSmoother not found. Ensure it is loaded via <script> tag after GSAP and ScrollTrigger, but before this bundle.');
      return; // Stop initialization if ScrollSmoother is missing
    }

    // 2. Register ScrollSmoother plugin with GSAP (crucial step)
    // It's safe to call this even if already registered elsewhere.
    try {
        gsap.registerPlugin(ScrollSmoother);
        console.log('SmoothScroll: ScrollSmoother plugin registered with GSAP.');
    } catch (error) {
        console.error('SmoothScroll Error: Failed to register ScrollSmoother plugin with GSAP:', error);
        return; // Stop if registration fails
    }


    // 3. Attempt to create the smoother instance (handles screen size and element checks)
    this.initSmoother();

    // 4. Set up resize handling
    this.handleResize();
  }

  /**
   * Creates the ScrollSmoother instance if conditions are met.
   */
  initSmoother() {
    // Check screen size - don't initialize on mobile
    if (window.innerWidth < this.breakpoint) {
      console.log(`SmoothScroll: Viewport width (${window.innerWidth}px) is below breakpoint (${this.breakpoint}px). ScrollSmoother not initialized.`);
      return;
    }

    // Check if required DOM elements exist
    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');

    if (!wrapper) {
      console.warn('SmoothScroll Warn: Element with id="smooth-wrapper" not found. ScrollSmoother cannot initialize.');
      return;
    }
     if (!content) {
      console.warn('SmoothScroll Warn: Element with id="smooth-content" not found. ScrollSmoother cannot initialize.');
      return;
    }
     if (wrapper !== content.parentElement) {
        console.warn('SmoothScroll Warn: #smooth-content must be a direct child of #smooth-wrapper for ScrollSmoother.');
        // Depending on GSAP version, this might still work but can cause issues.
     }

    console.log('SmoothScroll: Prerequisites met. Initializing ScrollSmoother...');

    try {
      // Create the ScrollSmoother instance
      this.smoother = ScrollSmoother.create({
        wrapper: wrapper, // Use element reference
        content: content, // Use element reference
        smooth: 1,        // Smoothing amount (1 = default, higher = smoother but potentially laggier)
        effects: true,    // Enable effects like data-speed, data-lag
        smoothTouch: false, // Disable smooth scrolling on touch devices (recommended)
        normalizeScroll: true, // Helps normalize scroll behavior across browsers/devices
        ignoreMobileResize: true, // Prevents recalculations on mobile resize (e.g., keyboard opening)
      });

      console.log('SmoothScroll: ScrollSmoother instance successfully created.');

    } catch (error) {
      console.error('SmoothScroll Error: Could not create ScrollSmoother instance:', error);
    }
  }

  /**
   * Handles window resize events to enable/disable ScrollSmoother
   * based on the breakpoint. Includes debouncing.
   */
  handleResize() {
    window.addEventListener('resize', () => {
      // Clear the previous timeout to debounce
      clearTimeout(this.resizeTimeout);

      // Set a new timeout
      this.resizeTimeout = setTimeout(() => {
        console.log('SmoothScroll: Resize event detected.');
        const isDesktop = window.innerWidth >= this.breakpoint;

        if (isDesktop) {
          // If we are on desktop and smoother doesn't exist, try to initialize it
          if (!this.smoother) {
            console.log('SmoothScroll: Viewport switched to desktop, attempting to reinitialize ScrollSmoother.');
            // Re-run the initialization logic which includes checks
            this.initSmoother();
          }
        } else {
          // If we are on mobile and smoother exists, kill it
          if (this.smoother) {
            console.log('SmoothScroll: Viewport switched to mobile, killing ScrollSmoother instance.');
            this.smoother.kill();
            this.smoother = null; // Clear the reference
          }
        }
      }, 250); // Debounce delay of 250ms
    });
  }

  /**
   * Refreshes the ScrollSmoother instance (e.g., after dynamic content changes).
   */
  refresh() {
    if (this.smoother) {
      console.log('SmoothScroll: Refresh method called.');
      this.smoother.refresh();
    } else {
      console.log('SmoothScroll: Refresh called, but no active smoother instance exists.');
    }
  }

  /**
   * Returns the current ScrollSmoother instance.
   * @returns {ScrollSmoother|null} The ScrollSmoother instance or null if not initialized.
   */
  getSmoother() {
    return this.smoother;
  }
}

// Create a single instance for export
const smoothScroll = new SmoothScroll();
export default smoothScroll;
