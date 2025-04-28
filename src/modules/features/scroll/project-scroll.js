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
            return;
        }

        // Find the slider component inside the container
        const sliderComponent = container.querySelector('.project-slider_component');
        const swiperWrapper = container.querySelector('.swiper-wrapper');
        
        if (!sliderComponent || !swiperWrapper) {
            console.warn('Required elements not found for project scroll');
            return;
        }

        // Calculate scroll amount based on wrapper width
        const getScrollAmount = () => {
            const wrapperWidth = swiperWrapper.scrollWidth;
            const containerWidth = container.offsetWidth;
            return Math.max(0, wrapperWidth - containerWidth);
        };

        // Create timeline
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: () => `+=${getScrollAmount()}`,
                pin: true,
                anticipatePin: 1,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });

        // Animate wrapper
        tl.to(swiperWrapper, {
            x: () => -getScrollAmount(),
            ease: "none"
        });

        this.scrollTrigger = tl.scrollTrigger;
    }

    handleResize() {
        if (!this.initialized) return;
        
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const isDesktop = window.innerWidth >= this.breakpoint;
            const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
            
            if (!horizontalScrollContainer) return;
            
            // If we're on desktop and don't have a ScrollTrigger, initialize it
            if (isDesktop && !this.scrollTrigger) {
                this.initProjectHorizontalScroll(horizontalScrollContainer);
            } 
            // If we're on mobile and have a ScrollTrigger, clean it up
            else if (!isDesktop && this.scrollTrigger) {
                this.cleanup();
            }
            // If we're on desktop and already have a ScrollTrigger, just refresh it
            else if (isDesktop && this.scrollTrigger) {
                this.scrollTrigger.refresh();
            }
        }, 250);
    }

    refresh() {
        if (!this.initialized) return;
        
        const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
        if (!horizontalScrollContainer) return;
        
        // Only refresh if we're on desktop
        if (window.innerWidth >= this.breakpoint && this.scrollTrigger) {
            this.scrollTrigger.refresh();
        } else if (window.innerWidth < this.breakpoint && this.scrollTrigger) {
            // Clean up if we're on mobile but still have a ScrollTrigger
            this.cleanup();
        } else if (window.innerWidth >= this.breakpoint && !this.scrollTrigger) {
            // Initialize if we're on desktop but don't have a ScrollTrigger
            this.initProjectHorizontalScroll(horizontalScrollContainer);
        }
    }

    cleanup() {
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }
        
        // Clean up any pin-spacers that might be left behind
        document.querySelectorAll('.pin-spacer').forEach(spacer => {
            const content = spacer.querySelector(':scope > *:not(.pin-spacer)');
            if (content) {
                // Move the content outside the spacer
                spacer.parentNode.insertBefore(content, spacer);
            }
            // Remove the spacer
            spacer.parentNode.removeChild(spacer);
        });
        
        // Reset any transforms on the swiper wrapper
        const swiperWrapper = document.querySelector('.horizontal-scroll .swiper-wrapper');
        if (swiperWrapper) {
            gsap.set(swiperWrapper, { clearProps: "all" });
        }
    }
}

const projectScroll = new ProjectScroll();
export { projectScroll };