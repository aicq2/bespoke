// src/modules/features/scroll/project-scroll.js

class ProjectScroll {
    constructor() {
        this.scrollTrigger = null;
        this.initialized = false;
        this.breakpoint = 768; // Mobile breakpoint
        this.resizeTimeout = null;
    }

    init(params = {}) {
        const { currentPage } = params;
        
        if (currentPage !== 'project-details') {
            return;
        }

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not found. Project scroll requires these libraries.');
            return;
        }

        try {
            gsap.registerPlugin(ScrollTrigger);
            
            // Wait for DOM and images to be fully loaded
            window.addEventListener('load', () => {
                // Check if this project has horizontal scroll
                const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
                
                if (horizontalScrollContainer) {
                    // Only initialize if we're on desktop
                    if (window.innerWidth >= this.breakpoint) {
                        this.initProjectHorizontalScroll(horizontalScrollContainer);
                    } else {
                        // On mobile, reset any styles
                        this.resetStyles();
                    }
                    
                    this.initialized = true;
                    
                    // Add resize handler
                    window.addEventListener('resize', this.handleResize.bind(this));
                }
            });
            
        } catch (error) {
            console.error('Error initializing project horizontal scroll:', error);
        }
    }

    initProjectHorizontalScroll(container) {
        // Clean up any existing ScrollTrigger
        this.cleanup();

        // Don't initialize on mobile
        if (window.innerWidth < this.breakpoint) {
            this.resetStyles();
            return;
        }

        // Find the slider component inside the container
        const sliderComponent = container.querySelector('.project-slider_component');
        const swiperWrapper = container.querySelector('.swiper-wrapper');
        const slides = container.querySelectorAll('.swiper-slide');
        
        if (!sliderComponent || !swiperWrapper || slides.length === 0) {
            console.warn('Required elements not found for project scroll');
            return;
        }

        // Calculate the correct height for the horizontal scroll container
        this.calculateAndSetContainerHeight(container, sliderComponent, swiperWrapper, slides);

        // Create the horizontal scroll effect with ScrollTrigger
        this.scrollTrigger = ScrollTrigger.create({
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                // Calculate the total scroll distance
                const totalWidth = swiperWrapper.scrollWidth;
                const containerWidth = container.offsetWidth;
                const scrollDistance = totalWidth - containerWidth;
                
                // Calculate how far to scroll horizontally based on vertical scroll progress
                const progress = self.progress;
                const xPosition = -scrollDistance * progress;
                gsap.set(swiperWrapper, { x: xPosition });
            }
        });
    }

    calculateAndSetContainerHeight(container, sliderComponent, swiperWrapper, slides) {
        // Calculate the total width of all slides
        const totalWidth = swiperWrapper.scrollWidth;
        const containerWidth = container.offsetWidth;
        
        // Calculate how much extra scroll space we need
        const scrollDistance = totalWidth - containerWidth;
        
        // Get the height of the slider component
        let sliderHeight = 0;
        
        // Try to get height from the tallest slide
        slides.forEach(slide => {
            const slideImg = slide.querySelector('img');
            if (slideImg) {
                const imgHeight = slideImg.offsetHeight;
                sliderHeight = Math.max(sliderHeight, imgHeight);
            }
        });
        
        // If we couldn't get height from slides, use the component's height
        if (sliderHeight === 0) {
            sliderHeight = sliderComponent.offsetHeight;
        }
        
        // Add some padding
        sliderHeight += 40;
        
        // Set minimum height for the container - this creates the scrolling space
        // We need enough height to allow scrolling through the entire horizontal content
        const containerHeight = scrollDistance + sliderHeight;
        
        // Set the container height
        container.style.height = `${containerHeight}px`;
        
        console.log(`Set horizontal scroll container height to ${containerHeight}px`);
        console.log(`- Slider height: ${sliderHeight}px`);
        console.log(`- Scroll distance: ${scrollDistance}px`);
    }

    handleResize() {
        if (!this.initialized) return;
        
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const isDesktop = window.innerWidth >= this.breakpoint;
            const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
            
            if (!horizontalScrollContainer) return;
            
            if (isDesktop) {
                // If we're on desktop, reinitialize
                this.initProjectHorizontalScroll(horizontalScrollContainer);
            } else {
                // If we're on mobile, clean up and reset
                this.cleanup();
                this.resetStyles();
            }
        }, 250);
    }

    refresh() {
        if (!this.initialized) return;
        
        const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
        if (!horizontalScrollContainer) return;
        
        if (window.innerWidth >= this.breakpoint) {
            // On desktop, reinitialize
            this.initProjectHorizontalScroll(horizontalScrollContainer);
        } else {
            // On mobile, clean up and reset
            this.cleanup();
            this.resetStyles();
        }
    }

    resetStyles() {
        // Reset container styles
        const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
        if (horizontalScrollContainer) {
            horizontalScrollContainer.style.height = '';
        }

        // Reset swiper wrapper transform
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (swiperWrapper) {
            gsap.set(swiperWrapper, { clearProps: "all" });
        }
    }

    cleanup() {
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }
        
        this.resetStyles();
    }
}

const projectScroll = new ProjectScroll();
export { projectScroll };