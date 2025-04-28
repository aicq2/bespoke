class HorizontalScroll {
    constructor() {
        this.scrollTrigger = null;
        this.swiper = null;
        this.initialized = false;
        this.breakpoint = 991;
        this.currentMode = null;
    }

    init(params = {}) {
        const { currentPage } = params;
        
        if (!['about', 'services'].includes(currentPage)) {
            return;
        }

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Swiper === 'undefined') {
            console.warn('GSAP, ScrollTrigger or Swiper not found. About services scroll requires these libraries.');
            return;
        }

        try {
            gsap.registerPlugin(ScrollTrigger);
            this.handleScreenSize();
            window.addEventListener('resize', this.handleResize.bind(this));
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing about services scroll:', error);
        }
    }

    handleScreenSize() {
        const isDesktop = window.innerWidth >= this.breakpoint;
        
        if (this.currentMode === (isDesktop ? 'desktop' : 'mobile')) {
            return;
        }

        this.cleanup();

        if (isDesktop) {
            this.initDesktopScroll();
            this.currentMode = 'desktop';
        } else {
            this.initMobileSlider();
            this.currentMode = 'mobile';
        }
    }

    initDesktopScroll() {
        const section = document.querySelector(".card-slider-section");
        const stickyScreen = document.querySelector(".card-slider_component");
        const track = document.querySelector(".swiper-wrapper");
        const container = document.querySelector(".container-large");
    
        if (!section || !stickyScreen || !track || !container) {
            console.warn('Required elements not found for horizontal scroll', {
                section: !!section,
                stickyScreen: !!stickyScreen,
                track: !!track,
                container: !!container
            });
            return;
        }
    
        const getScrollAmount = () => {
            const trackWidth = track.scrollWidth;
            const containerWidth = container.offsetWidth;
            const scrollDistance = trackWidth - containerWidth;
            console.log('Scroll calculation:', {
                trackWidth,
                containerWidth,
                scrollDistance
            });
            return Math.max(0, scrollDistance);
        };
    
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${getScrollAmount()}`,
                pin: stickyScreen,
                anticipatePin: 1,
                scrub: 1,
                invalidateOnRefresh: true,
                // Add these for debugging
                markers: true,
                onUpdate: self => {
                    console.log('Progress:', self.progress);
                }
            }
        });
    
        tl.to(track, {
            x: () => -getScrollAmount(),
            ease: "none"
        });
    
        this.scrollTrigger = tl.scrollTrigger;
    }
    

    initMobileSlider() {
        this.swiper = new Swiper(".swiper", {
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
                    this.el.style.setProperty(
                        '--swiper-transition-timing-function', 
                        'cubic-bezier(0.25, 0.1, 0.25, 1)'
                    );
                }
            },

            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            }
        });
    }

    handleResize() {
        if (!this.initialized) return;
        
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.handleScreenSize();
        }, 250);
    }

    refresh() {
        if (!this.initialized) return;
        
        if (this.scrollTrigger) {
            this.scrollTrigger.refresh();
        }
        if (this.swiper) {
            this.swiper.update();
        }
    }

    cleanup() {
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }
        
        if (this.swiper) {
            this.swiper.destroy(true, true);
            this.swiper = null;
        }
        
        const track = document.querySelector(".swiper-wrapper");
        if (track) {
            gsap.set(track, { clearProps: "all" });
        }
    }

    destroy() {
        this.cleanup();
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.initialized = false;
        this.currentMode = null;
    }
}

const horizontalScroll = new HorizontalScroll();
export { horizontalScroll };
