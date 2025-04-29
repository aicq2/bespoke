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
                        this.initProjectHorizontalScroll();
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

    initProjectHorizontalScroll() {
        // Clean up any existing ScrollTrigger
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }

        // Don't initialize on mobile
        if (window.innerWidth < this.breakpoint) {
            return;
        }

        // Using the same class structure as home page
        const track = document.querySelector(".track");
        const stickyScreen = document.querySelector(".sticky-screen");
        const triggerSection = document.querySelector(".section-horizontal");

        if (!track || !stickyScreen || !triggerSection) {
            console.warn('Required elements not found for project scroll. Make sure you have .track, .sticky-screen, and .section-horizontal classes.');
            return;
        }

        // Calculate scroll amount based on track width
        const getScrollAmount = () => {
            const trackWidth = track.scrollWidth;
            const sliderWidth = stickyScreen.offsetWidth;
            return Math.max(0, trackWidth - sliderWidth);
        };

        // Create timeline - exactly like home page
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerSection,
                start: "top top",
                end: () => `+=${getScrollAmount()}`,
                pin: stickyScreen,
                anticipatePin: 1,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });

        // Animate track
        tl.to(track, {
            x: () => -getScrollAmount(),
            ease: "none"
        });

        this.scrollTrigger = tl.scrollTrigger;
    }

    handleResize() {
        if (!this.initialized) return;
        
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.refresh();
        }, 250);
    }

    refresh() {
        if (!this.initialized) return;
        
        if (window.innerWidth >= this.breakpoint) {
            // On desktop, reinitialize
            this.initProjectHorizontalScroll();
        } else {
            // On mobile, clean up
            this.cleanup();
        }
    }

    cleanup() {
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }
        
        const track = document.querySelector(".track");
        if (track) {
            gsap.set(track, { clearProps: "all" });
        }
    }
}

const projectScroll = new ProjectScroll();
export { projectScroll };