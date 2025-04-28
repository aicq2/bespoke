class HomeScroll {
    constructor() {
        this.scrollTrigger = null;
        this.initialized = false;
        this.breakpoint = 768; // Mobile breakpoint
    }

    init(params = {}) {
        const { currentPage } = params;
        
        if (currentPage !== 'home') {
            return;
        }

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not found. Home scroll requires these libraries.');
            return;
        }

        try {
            gsap.registerPlugin(ScrollTrigger);
            
            // Wait for DOM and images to be fully loaded
            window.addEventListener('load', () => {
                // Only initialize if we're on desktop
                if (window.innerWidth >= this.breakpoint) {
                    this.initHomeHorizontalScroll();
                }
                
                this.initialized = true;
                
                // Add resize handler
                window.addEventListener('resize', this.handleResize.bind(this));
            });
            
        } catch (error) {
            console.error('Error initializing home horizontal scroll:', error);
        }
    }

    initHomeHorizontalScroll() {
        // Clean up any existing ScrollTrigger
        this.cleanup();

        // Don't initialize on mobile
        if (window.innerWidth < this.breakpoint) {
            return;
        }

        const track = document.querySelector(".track");
        const slider = document.querySelector(".recent_slider");
        const stickyScreen = document.querySelector(".sticky-screen");
        const triggerSection = document.querySelector(".section-horizontal");

        if (!track || !slider || !stickyScreen || !triggerSection) {
            console.warn('Required elements not found for home scroll');
            return;
        }

        // Calculate scroll amount based on track width
        const getScrollAmount = () => {
            const trackWidth = track.scrollWidth;
            const sliderWidth = slider.offsetWidth;
            return Math.max(0, trackWidth - sliderWidth);
        };

        // Create timeline
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
            const isDesktop = window.innerWidth >= this.breakpoint;
            
            // If we're on desktop and don't have a ScrollTrigger, initialize it
            if (isDesktop && !this.scrollTrigger) {
                this.initHomeHorizontalScroll();
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
        
        // Only refresh if we're on desktop
        if (window.innerWidth >= this.breakpoint && this.scrollTrigger) {
            this.scrollTrigger.refresh();
        } else if (window.innerWidth < this.breakpoint && this.scrollTrigger) {
            // Clean up if we're on mobile but still have a ScrollTrigger
            this.cleanup();
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
        
        const track = document.querySelector(".track");
        if (track) {
            gsap.set(track, { clearProps: "all" });
        }
    }
}

const homeScroll = new HomeScroll();
export { homeScroll };