// src/modules/features/horizontal-scroll.js

class HorizontalScroll {
    constructor() {
      this.scrollTriggers = [];
      this.swiperInstances = {};
      this.activeMode = null; // 'horizontal', 'swiper', or null
      this.breakpoint = 991; // Desktop/tablet breakpoint
    }
  
    init(params = {}) {
      const { currentPage } = params;
      
      // Check for required GSAP dependency
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not found. Horizontal scroll requires these libraries.');
        return;
      }
      
      // Only initialize on pages that need horizontal scroll
      if (!['home', 'about', 'services', 'project-details'].includes(currentPage)) {
        return;
      }
  
      this.currentPage = currentPage;
      
      // Setup mode based on viewport size
      this.setupResponsive();
      this.bindEvents();
    }
    
    setupResponsive() {
      const isDesktop = window.innerWidth >= this.breakpoint;
      
      // Clean up any existing instances first
      this.cleanup();
      
      if (isDesktop) {
        // Desktop: Use horizontal scroll
        this.initPageSpecificHorizontalScroll();
      } else {
        // Tablet/Mobile: Only use Swiper for about and services pages
        if (['about', 'services', 'project-details'].includes(this.currentPage)) {
          this.initSwiper();
        }
        // No action needed for home page on mobile
      }
    }
    
    initPageSpecificHorizontalScroll() {
      switch (this.currentPage) {
        case 'home':
          this.initHomeHorizontalScroll();
          break;
        case 'about':
        case 'services':
          this.initSwiperToHorizontalScroll();
          break;
        case 'project-details':
          this.initProjectDetailsHorizontalScroll();
          break;
      }
      
      this.activeMode = 'horizontal';
    }
    
    initHomeHorizontalScroll() {
      // Your existing home.js horizontal scroll code
      const track = document.querySelector(".track");
      if (!track) return;
      
      const section = document.querySelector(".section-horizontal");
      if (!section) return;
  
      // Get width of all items in the track
      const getTrackWidth = () => {
        let width = 0;
        const items = track.children;
        for (let i = 0; i < items.length; i++) {
          width += items[i].offsetWidth;
        }
        return width;
      };
  
      // Calculate how far to scroll
      const calculateScrollDistance = () => {
        return getTrackWidth() - window.innerWidth;
      };
  
      // Create the ScrollTrigger animation
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${calculateScrollDistance()}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.to(track, {
            x: -calculateScrollDistance() * self.progress,
            ease: "none"
          });
        }
      });
      
      this.scrollTriggers.push(trigger);
    }
    
    initSwiperToHorizontalScroll() {
      const swiperElement = document.querySelector('.swiper');
      if (!swiperElement) return;
      
      const swiperWrapper = swiperElement.querySelector('.swiper-wrapper');
      if (!swiperWrapper) return;
      
      // Get parent container to make it tall for scrolling
      const parentContainer = swiperElement.parentElement;
      
      // Make swiper element sticky
      gsap.set(swiperElement, {
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden"
      });
      
      // Make parent element tall enough for scrolling
      gsap.set(parentContainer, {
        minHeight: "300vh" // Adjust as needed
      });
      
      // Set swiper wrapper for horizontal layout
      gsap.set(swiperWrapper, {
        display: "flex",
        flexWrap: "nowrap",
        width: "max-content"
      });
      
      // Set slides for consistent width
      const slides = swiperWrapper.querySelectorAll('.swiper-slide');
      slides.forEach(slide => {
        gsap.set(slide, {
          flex: "0 0 auto",
          marginRight: "40px" // Match your normal swiper spacing
        });
      });
      
      // Create the scrolling animation
      const scrollDistance = swiperWrapper.scrollWidth - swiperElement.offsetWidth;
      
      const trigger = ScrollTrigger.create({
        trigger: parentContainer,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        pin: swiperElement,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.to(swiperWrapper, {
            x: -scrollDistance * self.progress,
            ease: "none"
          });
        }
      });
      
      this.scrollTriggers.push(trigger);
    }
    
    initProjectDetailsHorizontalScroll() {
      const horizontalScroll = document.querySelector('.horizontal-scroll');
      if (!horizontalScroll) return;
      
      const slideComponent = horizontalScroll.querySelector('.project-slider_component');
      if (!slideComponent) return;
      
      const swiperElement = slideComponent.querySelector('.swiper');
      if (!swiperElement) return;
      
      const swiperWrapper = swiperElement.querySelector('.swiper-wrapper');
      if (!swiperWrapper) return;
      
      // Already has min-height in CSS, no need to adjust
      
      // Make slide component sticky
      gsap.set(slideComponent, {
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden"
      });
      
      // Set wrapper for horizontal scrolling
      gsap.set(swiperWrapper, {
        display: "flex",
        flexWrap: "nowrap",
        width: "max-content"
      });
      
      // Set slides for consistent width
      const slides = swiperWrapper.querySelectorAll('.swiper-slide');
      slides.forEach(slide => {
        gsap.set(slide, {
          flex: "0 0 auto",
          marginRight: "40px" // Match your normal swiper spacing
        });
      });
      
      // Create the scrolling animation
      const scrollDistance = swiperWrapper.scrollWidth - swiperElement.offsetWidth;
      
      const trigger = ScrollTrigger.create({
        trigger: horizontalScroll,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        pin: slideComponent,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.to(swiperWrapper, {
            x: -scrollDistance * self.progress,
            ease: "none"
          });
        }
      });
      
      this.scrollTriggers.push(trigger);
    }
    
    initSwiper() {
      // Only initialize Swiper on appropriate pages below the breakpoint
      if (!['about', 'services', 'project-details'].includes(this.currentPage)) {
        return;
      }
      
      // Find the appropriate container
      let swiperContainer;
      if (this.currentPage === 'project-details') {
        const projectSlider = document.querySelector('.project-slider_component');
        if (projectSlider) {
          swiperContainer = projectSlider.querySelector('.swiper');
        }
      } else {
        swiperContainer = document.querySelector('.swiper');
      }
      
      if (!swiperContainer) {
        console.warn('Swiper container not found');
        return;
      }
      
      // Check if Swiper is available
      if (typeof Swiper === 'undefined') {
        console.warn('Swiper not found. Slider requires this library.');
        return;
      }
      
      // Initialize Swiper with your existing configuration
      try {
        const swiper = new Swiper(swiperContainer, {
          loop: false,
          slidesPerView: "auto",
          spaceBetween: 40,
          allowTouchMove: true,
          grabCursor: true,
          speed: 800,
          effect: "slide",
          slidesPerGroup: 1,
          parallax: true,
          on: {
            init: function() {
              this.el.style.setProperty('--swiper-transition-timing-function', 'cubic-bezier(0.25, 0.1, 0.25, 1)');
            }
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          }
          // Removed pagination as requested
        });
        
        this.swiperInstances[this.currentPage] = swiper;
        this.activeMode = 'swiper';
      } catch (error) {
        console.error('Error initializing Swiper:', error);
      }
    }
    
    cleanup() {
      // Clean up ScrollTriggers
      if (this.scrollTriggers.length > 0) {
        this.scrollTriggers.forEach(trigger => {
          if (trigger && trigger.kill) {
            trigger.kill();
          }
        });
        this.scrollTriggers = [];
        
        // Reset any GSAP styles
        gsap.set([
          '.swiper', 
          '.swiper-wrapper', 
          '.swiper-slide',
          '.section-horizontal',
          '.track',
          '.project-slider_component',
          '.horizontal-scroll'
        ], { clearProps: "all" });
      }
      
      // Clean up Swiper instances
      Object.values(this.swiperInstances).forEach(swiper => {
        if (swiper && typeof swiper.destroy === 'function') {
          swiper.destroy(true, true); // true, true = remove all styles and HTML elements
        }
      });
      this.swiperInstances = {};
      
      this.activeMode = null;
    }
    
    bindEvents() {
      // Handle resize event
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.setupResponsive();
        }, 250);
      };
      
      window.addEventListener('resize', handleResize);
    }
    
    refresh() {
      // Refresh ScrollTrigger instances
      if (this.scrollTriggers.length > 0) {
        ScrollTrigger.refresh();
      }
      
      // Refresh active Swiper instance
      const activeSwiper = this.swiperInstances[this.currentPage];
      if (activeSwiper && typeof activeSwiper.update === 'function') {
        activeSwiper.update();
      }
    }
  }
  
  const horizontalScroll = new HorizontalScroll();
  export { horizontalScroll };