// src/modules/ui/menu.js

class MenuAnimations {
    constructor() {
      this.initialized = false;
      this.menuTimelines = [];
    }
  
    init() {
      if (typeof gsap === 'undefined' || typeof Flip === 'undefined' || typeof jQuery === 'undefined') {
        console.warn('GSAP, Flip plugin, or jQuery not found. Menu animations require these libraries.');
        return;
      }
  
      try {
        gsap.registerPlugin(Flip);
      } catch (error) {
        console.warn('Error registering Flip plugin:', error);
        return;
      }
  
      this.initMenuAnimations();
      this.initialized = true;
    }
  
    refresh() {
      if (this.initialized) {
        // Clean up existing timelines
        this.menuTimelines.forEach(tl => tl.kill());
        this.menuTimelines = [];
        
        // Re-initialize
        this.initMenuAnimations();
      }
    }
  
    initMenuAnimations() {
      jQuery(".nav_component").each((index, component) => {
        let hamburgerEl = jQuery(component).find(".nav_hamburger_wrap");
        let navLineEl = jQuery(component).find(".nav_hamburger_line");
        let menuContainEl = jQuery(component).find(".menu_contain");
        let flipItemEl = jQuery(component).find(".nav_hamburger_base");
        let menuWrapEl = jQuery(component).find(".menu_wrap");
        let menuBaseEl = jQuery(component).find(".menu_base");
        let menuLinkEl = jQuery(component).find(".menu_link");
        
        let flipDuration = 0.35;
        
        const flip = (forwards) => {
          let state = Flip.getState(flipItemEl);
          if (forwards) {
            flipItemEl.appendTo(menuContainEl);
          } else {
            flipItemEl.appendTo(hamburgerEl);
          }
          Flip.from(state, { duration: flipDuration });
        };
        
        let tl = gsap.timeline({ paused: true });
        
        tl.set(menuWrapEl, { display: "flex" });
        
        tl.from(menuBaseEl, {
          opacity: 0,
          duration: flipDuration,
          ease: "none",
          onStart: () => {
            flip(true);
          },
        });
        
        tl.to(
          flipItemEl,
          { backgroundColor: "#1e1e1e", duration: flipDuration },
          "<"
        );
        
        tl.to(navLineEl, { backgroundColor: "#FFFFFF", duration: flipDuration }, "<");
        
        tl.to(navLineEl.eq(0), { y: 8, rotate: 45, duration: flipDuration }, "<");
        tl.to(navLineEl.eq(2), { y: -8, rotate: -45, duration: flipDuration }, "<");
        tl.to(navLineEl.eq(1), { opacity: 0, duration: 0.1 }, "<");
        
        tl.from(menuLinkEl, {
          opacity: 0,
          yPercent: 50,
          duration: 0.2,
          stagger: { amount: 0.2 },
          onReverseComplete: () => {
            flip(false);
            flipItemEl.css("background-color", "transparent");
            navLineEl.css("background-color", "");
          },
        });
        
        // Store the timeline for potential cleanup
        this.menuTimelines.push(tl);
        
        const openMenu = (open) => {
          if (!tl.isActive()) {
            if (open) {
              tl.play();
              hamburgerEl.addClass("nav-open");
            } else {
              tl.reverse();
              hamburgerEl.removeClass("nav-open");
            }
          }
        };
        
        hamburgerEl.on("mouseenter", function () {
          if (!jQuery(this).hasClass("nav-open")) {
            openMenu(true);
          }
        });
        
        hamburgerEl.on("click", function () {
          if (jQuery(this).hasClass("nav-open")) {
            openMenu(false);
          } else {
            openMenu(true);
          }
        });
        
        menuBaseEl.on("mouseenter", () => {
          openMenu(false);
        });
        
        menuBaseEl.on("click", () => {
          openMenu(false);
        });
        
        // Close menu on Escape key
        jQuery(document).on("keydown", function (e) {
          if (e.key === "Escape") {
            openMenu(false);
          }
        });
      });
    }
  }
  
  const menuAnimations = new MenuAnimations();
  export default menuAnimations;