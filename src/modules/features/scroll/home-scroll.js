class HomeScroll {
    constructor() {
        this.scrollTrigger = null;
        this.initialized = false;
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
                this.initHomeHorizontalScroll();
                this.initialized = true;
                
                // Add resize handler
                window.addEventListener('resize', this.handleResize.bind(this));
            });
            
        } catch (error) {
            console.error('Error initializing home horizontal scroll:', error);
        }
    }

    initHomeHorizontalScroll() {
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
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
            this.refresh();
        }, 250);
    }

    refresh() {
        if (!this.initialized) return;
        
        if (this.scrollTrigger) {
            this.scrollTrigger.refresh();
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
        
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.initialized = false;
    }
}

const homeScroll = new HomeScroll();
export { homeScroll };
