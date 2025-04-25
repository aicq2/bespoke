import 'vendor/ScrollSmoother.min.js';

class SmoothScroll {
  constructor() {
    this.smoother = null;
    this.breakpoint = 768; // Mobile breakpoint
  }

  init() {
    // Check if we're on mobile - don't initialize smooth scroll
    if (window.innerWidth < this.breakpoint) {
      return;
    }

    // Check if required elements exist
    if (!document.getElementById('smooth-wrapper') || !document.getElementById('smooth-content')) {
      console.warn('Smooth scroll wrapper or content elements not found.');
      return;
    }

    // Initialize ScrollSmoother
    this.smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1, // Adjust smoothness value as needed (higher = smoother)
      effects: true, // Enable special effects for elements with data-speed attribute
      smoothTouch: false, // Disable on touch devices
      normalizeScroll: true, // Helps with cross-browser consistency
      ignoreMobileResize: true, // Prevents resize recalculation on mobile address bar show/hide
    });

    // Handle resize events to disable on mobile
    this.handleResize();
  }

  handleResize() {
    // Add resize event listener to disable/enable smooth scroll based on screen width
    window.addEventListener('resize', () => {
      if (window.innerWidth < this.breakpoint) {
        if (this.smoother) {
          this.smoother.kill();
          this.smoother = null;
        }
      } else if (!this.smoother) {
        // Re-initialize on desktop if previously killed
        this.init();
      }
    });
  }

  // Method to refresh the smoother instance (useful after DOM changes)
  refresh() {
    if (this.smoother) {
      this.smoother.refresh();
    }
  }

  // Public method to get the smoother instance
  getSmoother() {
    return this.smoother;
  }
}

// Export a singleton instance
const smoothScroll = new SmoothScroll();
export default smoothScroll;