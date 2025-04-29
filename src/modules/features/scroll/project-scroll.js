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

        // Create a wrapper for the pin effect with custom positioning
        const pinWrapper = document.createElement('div');
        pinWrapper.className = 'project-pin-wrapper';
        pinWrapper.style.position = 'relative';
        pinWrapper.style.width = '100%';
        pinWrapper.style.height = `${containerHeight}px`;
        pinWrapper.style.overflow = 'hidden';
        
        // Move the container into the wrapper
        container.parentNode.insertBefore(pinWrapper, container);
        pinWrapper.appendChild(container);
        
        // Create a custom pin element that will be positioned at 4rem from top
        const pinElement = document.createElement('div');
        pinElement.className = 'project-pin-element';
        pinElement.style.position = 'absolute';
        pinElement.style.top = '0';
        pinElement.style.left = '0';
        pinElement.style.width = '100%';
        pinElement.style.height = '1px';
        pinElement.style.pointerEvents = 'none';
        pinWrapper.appendChild(pinElement);

        // Create a timeline
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: pinElement,
                start: `top top+=${this.topOffset}`,
                end: () => `+=${getScrollAmount()}`,
                pin: container,
                anticipatePin: 1,
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    // When scrolling, ensure the container stays at the right position
                    if (self.isActive) {
                        container.style.position = 'fixed';
                        container.style.top = this.topOffset;
                        container.style.left = '0';
                        container.style.width = '100%';
                        container.style.zIndex = '10';
                    } else if (self.progress === 0) {
                        // Before the pin starts
                        container.style.position = 'absolute';
                        container.style.top = '0';
                        container.style.left = '0';
                    } else if (self.progress === 1) {
                        // After the pin ends
                        container.style.position = 'absolute';
                        container.style.top = `${getScrollAmount()}px`;
                        container.style.left = '0';
                    }
                }
            }
        });

        // Animate wrapper
        tl.to(swiperWrapper, {
            x: () => -getScrollAmount(),
            ease: "none"
        });

        this.scrollTrigger = tl.scrollTrigger;

        // Create a spacer to prevent content overlap
        this.createSpacerAfterHorizontalScroll(pinWrapper, containerHeight + getScrollAmount());
    }

    // Create a spacer element after the horizontal scroll to prevent content overlap
    createSpacerAfterHorizontalScroll(container, totalHeight) {
        // Remove any existing spacer first
        const existingSpacer = document.querySelector('.horizontal-scroll-spacer');
        if (existingSpacer) {
            existingSpacer.parentNode.removeChild(existingSpacer);
        }

        // Create a new spacer
        const spacer = document.createElement('div');
        spacer.className = 'horizontal-scroll-spacer';
        spacer.style.height = `${totalHeight}px`;
        spacer.style.width = '100%';
        spacer.style.display = 'block';
        spacer.style.position = 'relative';
        spacer.style.pointerEvents = 'none';
        
        // Insert after the container
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
        
        // Remove the pin wrapper and restore original DOM structure
        const pinWrapper = document.querySelector('.project-pin-wrapper');
        if (pinWrapper) {
            const horizontalScroll = pinWrapper.querySelector('.horizontal-scroll');
            if (horizontalScroll) {
                // Move the horizontal scroll out of the wrapper
                pinWrapper.parentNode.insertBefore(horizontalScroll, pinWrapper);
                // Reset styles
                horizontalScroll.style.position = '';
                horizontalScroll.style.top = '';
                horizontalScroll.style.left = '';
                horizontalScroll.style.width = '';
                horizontalScroll.style.zIndex = '';
                horizontalScroll.style.height = '';
                horizontalScroll.style.minHeight = '';
            }
            // Remove the wrapper
            pinWrapper.parentNode.removeChild(pinWrapper);
        }
        
        // Reset any transforms on the swiper wrapper
        const swiperWrapper = document.querySelector('.horizontal-scroll .swiper-wrapper');
        if (swiperWrapper) {
            gsap.set(swiperWrapper, { clearProps: "all" });
        }
    }
}

const projectScroll = new ProjectScroll();
export { projectScroll };