// src/modules/features/scroll/project-scroll.js

class ProjectScroll {
    constructor() {
        this.scrollTrigger = null;
        this.initialized = false;
        this.breakpoint = 768; // Mobile breakpoint
        this.resizeTimeout = null;
        this.topOffset = '4rem'; // Top offset for pinning
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
                        // On mobile, reset any fixed height
                        horizontalScrollContainer.style.height = '';
                        horizontalScrollContainer.style.minHeight = '';
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
            container.style.height = '';
            container.style.minHeight = '';
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

        // Calculate scroll amount based on wrapper width
        const getScrollAmount = () => {
            const wrapperWidth = swiperWrapper.scrollWidth;
            const containerWidth = container.offsetWidth;
            return Math.max(0, wrapperWidth - containerWidth);
        };

        // Calculate the optimal height for the container
        const calculateOptimalHeight = () => {
            // Get the tallest slide height
            let maxSlideHeight = 0;
            slides.forEach(slide => {
                const slideImg = slide.querySelector('img');
                if (slideImg) {
                    const imgHeight = slideImg.offsetHeight;
                    maxSlideHeight = Math.max(maxSlideHeight, imgHeight);
                }
            });

            // Add some padding for controls if needed
            const padding = 40;
            return maxSlideHeight + padding;
        };

        // Set the container height based on content
        const containerHeight = calculateOptimalHeight();
        container.style.height = `${containerHeight}px`;
        container.style.minHeight = `${containerHeight}px`;

        // Create a marker after the horizontal scroll to ensure proper spacing
        this.createSpacerAfterHorizontalScroll(container, containerHeight);

        // Convert rem to pixels for pinSpacing calculation
        const remValue = parseFloat(this.topOffset);
        const remInPixels = remValue * parseFloat(getComputedStyle(document.documentElement).fontSize);

        // Create timeline
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: `top+=${remInPixels} top+=${remInPixels}`, // Pin at top 4rem
                end: () => `+=${getScrollAmount()}`,
                pin: true,
                anticipatePin: 1,
                scrub: 1,
                invalidateOnRefresh: true,
                pinSpacing: true, // Important to prevent content overlap
                onUpdate: (self) => {
                    // Optional: add progress indicator or other effects
                }
            }
        });

        // Animate wrapper
        tl.to(swiperWrapper, {
            x: () => -getScrollAmount(),
            ease: "none"
        });

        this.scrollTrigger = tl.scrollTrigger;
    }

    // Create a spacer element after the horizontal scroll to prevent content overlap
    createSpacerAfterHorizontalScroll(container, containerHeight) {
        // Remove any existing spacer first
        const existingSpacer = document.querySelector('.horizontal-scroll-spacer');
        if (existingSpacer) {
            existingSpacer.parentNode.removeChild(existingSpacer);
        }

        // Create a new spacer
        const spacer = document.createElement('div');
        spacer.className = 'horizontal-scroll-spacer';
        spacer.style.height = '0px'; // Start with zero height
        spacer.style.width = '100%';
        spacer.style.display = 'block';
        spacer.style.position = 'relative';
        spacer.style.pointerEvents = 'none';
        
        // Insert after the horizontal scroll container
        if (container.nextSibling) {
            container.parentNode.insertBefore(spacer, container.nextSibling);
        } else {
            container.parentNode.appendChild(spacer);
        }
    }

    handleResize() {
        if (!this.initialized) return;
        
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const isDesktop = window.innerWidth >= this.breakpoint;
            const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
            
            if (!horizontalScrollContainer) return;
            
            if (isDesktop) {
                // If we're on desktop, reinitialize to recalculate heights
                this.initProjectHorizontalScroll(horizontalScrollContainer);
            } else {
                // If we're on mobile, clean up and reset heights
                this.cleanup();
                horizontalScrollContainer.style.height = '';
                horizontalScrollContainer.style.minHeight = '';
            }
        }, 250);
    }

    refresh() {
        if (!this.initialized) return;
        
        const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
        if (!horizontalScrollContainer) return;
        
        if (window.innerWidth >= this.breakpoint) {
            // On desktop, reinitialize to recalculate heights
            this.initProjectHorizontalScroll(horizontalScrollContainer);
        } else {
            // On mobile, clean up and reset heights
            this.cleanup();
            horizontalScrollContainer.style.height = '';
            horizontalScrollContainer.style.minHeight = '';
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
        
        // Remove the horizontal scroll spacer
        const horizontalScrollSpacer = document.querySelector('.horizontal-scroll-spacer');
        if (horizontalScrollSpacer) {
            horizontalScrollSpacer.parentNode.removeChild(horizontalScrollSpacer);
        }
        
        // Reset any transforms on the swiper wrapper
        const swiperWrapper = document.querySelector('.horizontal-scroll .swiper-wrapper');
        if (swiperWrapper) {
            gsap.set(swiperWrapper, { clearProps: "all" });
        }
        
        // Reset container height
        const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
        if (horizontalScrollContainer) {
            horizontalScrollContainer.style.height = '';
            horizontalScrollContainer.style.minHeight = '';
        }
    }
}

const projectScroll = new ProjectScroll();
export { projectScroll };