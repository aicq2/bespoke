// src/modules/features/scroll/project-scroll.js

class ProjectScroll {
    constructor() {
        this.scrollTrigger = null;
        this.initialized = false;
        this.breakpoint = 768;
        this.resizeTimeout = null;
        this.topOffset = '4rem';
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

            window.addEventListener('load', () => {
                const horizontalScrollContainer = document.querySelector('.horizontal-scroll');

                if (horizontalScrollContainer) {
                    if (window.innerWidth >= this.breakpoint) {
                        this.initProjectHorizontalScroll(horizontalScrollContainer);
                    } else {
                        horizontalScrollContainer.style.height = '';
                        horizontalScrollContainer.style.minHeight = '';
                    }

                    this.initialized = true;
                    window.addEventListener('resize', this.handleResize.bind(this));
                }
            });

        } catch (error) {
            console.error('Error initializing project horizontal scroll:', error);
        }
    }

    initProjectHorizontalScroll(container) {
        this.cleanup();

        if (window.innerWidth < this.breakpoint) {
            container.style.height = '';
            container.style.minHeight = '';
            return;
        }

        const sliderComponent = container.querySelector('.project-slider_component');
        const swiperWrapper = container.querySelector('.swiper-wrapper');
        const slides = container.querySelectorAll('.swiper-slide');

        if (!sliderComponent || !swiperWrapper || slides.length === 0) {
            console.warn('Required elements not found for project scroll');
            return;
        }

        const getScrollAmount = () => {
            const wrapperWidth = swiperWrapper.scrollWidth;
            const containerWidth = container.offsetWidth;
            return Math.max(0, wrapperWidth - containerWidth);
        };

        const calculateOptimalHeight = () => {
            let maxSlideHeight = 0;
            slides.forEach(slide => {
                const slideImg = slide.querySelector('img');
                if (slideImg) {
                    const imgHeight = slideImg.offsetHeight;
                    maxSlideHeight = Math.max(maxSlideHeight, imgHeight);
                }
            });
            const padding = 40;
            return maxSlideHeight + padding;
        };

        const containerHeight = calculateOptimalHeight();
        container.style.height = `${containerHeight}px`;
        container.style.minHeight = `${containerHeight}px`;

        const startOffset = this.topOffset;

        gsap.set(container, {
            position: 'relative',
            top: 0,
            left: 0,
            width: '100%'
        });

        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: `top top+=${startOffset}`,
                end: () => `+=${getScrollAmount()}`,
                pin: true,
                pinType: "transform",
                scrub: 1,
                invalidateOnRefresh: true,
                pinSpacing: true,
                anticipatePin: 1,
            }
        });

        tl.to(swiperWrapper, {
            x: () => -getScrollAmount(),
            ease: "none"
        });

        this.scrollTrigger = tl.scrollTrigger;

        this.createSpacerAfterHorizontalScroll(container, containerHeight);
    }

    createSpacerAfterHorizontalScroll(container, containerHeight) {
        const existingSpacer = document.querySelector('.horizontal-scroll-spacer');
        if (existingSpacer) {
            existingSpacer.parentNode.removeChild(existingSpacer);
        }

        const spacer = document.createElement('div');
        spacer.className = 'horizontal-scroll-spacer';
        const offsetValuePx = parseFloat(getComputedStyle(document.documentElement).fontSize) * parseFloat(this.topOffset);
        spacer.style.height = `${containerHeight + offsetValuePx}px`; // Adjust if needed after testing
        spacer.style.width = '100%';
        spacer.style.display = 'block';
        spacer.style.position = 'relative';
        spacer.style.pointerEvents = 'none';

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
                this.initProjectHorizontalScroll(horizontalScrollContainer);
            } else {
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
            this.initProjectHorizontalScroll(horizontalScrollContainer);
        } else {
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

        const horizontalScrollSpacer = document.querySelector('.horizontal-scroll-spacer');
        if (horizontalScrollSpacer) {
            horizontalScrollSpacer.parentNode.removeChild(horizontalScrollSpacer);
        }

        const swiperWrapper = document.querySelector('.horizontal-scroll .swiper-wrapper');
        if (swiperWrapper) {
            gsap.set(swiperWrapper, { clearProps: "all" });
        }

        const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
        if (horizontalScrollContainer) {
            gsap.set(horizontalScrollContainer, { clearProps: "all" });
            horizontalScrollContainer.style.height = '';
            horizontalScrollContainer.style.minHeight = '';
        }
    }
}

const projectScroll = new ProjectScroll();
export { projectScroll };