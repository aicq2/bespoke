// src/modules/features/project-grid.js

class ProjectGrid {
    constructor() {
      this.isGridView = false;
      this.itemsPerBatch = 4;
      this.currentBatch = 1;
      this.desktopBreakpoint = "(min-width: 992px)";
      this.elements = {
        gridBtn: null,
        listBtn: null,
        collectionList: null,
        projectItems: null,
      };
      this.selectors = [
        ".projects_collection-list",
        ".project_item",
        ".project_tag-wrapper",
        ".project_slogan",
        ".project_expand-inner",
        ".project_thumb",
        ".project_descr",
        ".project_top",
        ".project_name",
        ".project_industry",
        ".project_expand",
      ];
      this.initialized = false;
      this.scrollTriggerInstance = null;
    }
  
    init(params = {}) {
      const { currentPage } = params;
      
      // Only initialize on projects page
      if (currentPage !== 'projects') {
        return;
      }
  
      // Check for required GSAP dependencies
      if (typeof gsap === 'undefined' || typeof Flip === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP, Flip, or ScrollTrigger not found. Project grid requires these libraries.');
        return;
      }
      
      try {
        gsap.registerPlugin(Flip, ScrollTrigger);
      } catch (error) {
        console.warn('Error registering GSAP plugins:', error);
        return;
      }
  
      this.cacheElements();
      
      // Check if required elements exist
      if (!this.elements.gridBtn || !this.elements.listBtn || !this.elements.collectionList) {
        console.warn('Project grid elements not found. Make sure the grid/list buttons and collection exist.');
        return;
      }
      
      this.setupHoverEffects();
      this.setupViewToggle();
      this.setupInfiniteScroll();
      this.bindEvents();
      
      // Set initial state
      this.elements.listBtn.classList.add("is-active");
      this.initialized = true;
    }
  
    cacheElements() {
      this.elements = {
        gridBtn: document.getElementById("grid-btn"),
        listBtn: document.getElementById("list-btn"),
        collectionList: document.querySelector(".projects_collection-list"),
        projectItems: document.querySelectorAll(".project_item"),
      };
    }
  
    isDesktop() {
      return window.matchMedia(this.desktopBreakpoint).matches;
    }
  
    setupHoverEffects() {
      this.elements.projectItems.forEach((item) => {
        const expandElement = item.querySelector(".project_expand");
        const infoElement = item.querySelector(".project_info");
        if (!expandElement) return;
  
        gsap.set(expandElement, { height: 0 });
        if (infoElement) {
          gsap.set(infoElement, { opacity: 1, display: "block" });
        }
  
        item.addEventListener("mouseenter", () => {
          if (!this.isGridView) {
            gsap.to(expandElement, {
              height: "auto",
              duration: 0.75,
              ease: "power1.out",
              overwrite: true,
            });
          }
        });
  
        item.addEventListener("mouseleave", () => {
          if (!this.isGridView) {
            gsap.to(expandElement, {
              height: 0,
              duration: 0.75,
              ease: "power1.in",
              overwrite: true,
            });
          }
        });
      });
    }
  
    setupViewToggle() {
      if (this.elements.gridBtn) {
        this.elements.gridBtn.addEventListener("click", () => this.switchView(true));
      }
      if (this.elements.listBtn) {
        this.elements.listBtn.addEventListener("click", () => this.switchView(false));
      }
    }
  
    switchView(toGrid) {
      if (toGrid === this.isGridView) return;
  
      gsap.killTweensOf([".project_expand", ".project_info"]);
      const state = Flip.getState(this.selectors.join(", "));
  
      this.selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          el.classList.toggle("is-grid", toGrid);
        });
      });
  
      this.isGridView = toGrid;
      this.elements.gridBtn.classList.toggle("is-active", toGrid);
      this.elements.listBtn.classList.toggle("is-active", !toGrid);
  
      this.elements.projectItems.forEach((item) => {
        const expandElement = item.querySelector(".project_expand");
        const infoElement = item.querySelector(".project_info");
  
        gsap.set(expandElement, {
          height: toGrid ? "auto" : 0,
          overwrite: true,
        });
  
        if (infoElement) {
          // Always keep the info element visible
          gsap.set(infoElement, { opacity: 1, display: "block" });
        }
      });
  
      Flip.from(state, {
        duration: 0.35,
        ease: "power1.out",
        nested: true,
        prune: true,
        onEnter: (elements) =>
          toGrid &&
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5 }
          ),
        onLeave: (elements) =>
          !toGrid && gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.5 }),
        onComplete: () => this.refreshItemStates(),
      });
  
      setTimeout(() => this.setupInfiniteScroll(), 400);
    }
  
    setupInfiniteScroll() {
      // Clean up previous scroll trigger
      if (this.scrollTriggerInstance) {
        this.scrollTriggerInstance.kill();
        this.scrollTriggerInstance = null;
      }
  
      const totalItems = this.elements.projectItems.length;
      const totalBatches = Math.ceil(totalItems / this.itemsPerBatch);
  
      if (totalItems <= this.itemsPerBatch) return;
  
      this.elements.projectItems.forEach((item, index) => {
        if (index >= this.currentBatch * this.itemsPerBatch) {
          gsap.set(item, { display: "none", autoAlpha: 0 });
        } else {
          gsap.set(item, { display: "", autoAlpha: 1 });
          this.refreshItemHoverState(item);
        }
      });
  
      if (this.currentBatch >= totalBatches) return;
  
      const lastVisibleIndex = Math.min(
        this.currentBatch * this.itemsPerBatch - 1,
        totalItems - 1
      );
      const triggerElement = this.elements.projectItems[lastVisibleIndex];
  
      this.scrollTriggerInstance = ScrollTrigger.create({
        id: "infinite-scroll",
        trigger: triggerElement,
        start: "bottom 85%",
        onEnter: () => this.loadMoreItems(totalBatches),
        markers: false,
      });
    }
  
    loadMoreItems(totalBatches) {
      if (this.scrollTriggerInstance) {
        this.scrollTriggerInstance.kill();
        this.scrollTriggerInstance = null;
      }
  
      if (this.currentBatch >= totalBatches) return;
  
      this.currentBatch++;
      const startIndex = (this.currentBatch - 1) * this.itemsPerBatch;
      const endIndex = Math.min(
        startIndex + this.itemsPerBatch,
        this.elements.projectItems.length
      );
  
      let delay = 0;
      for (let i = startIndex; i < endIndex; i++) {
        const item = this.elements.projectItems[i];
        if (!item) continue;
  
        gsap.set(item, { display: "" });
        gsap.fromTo(
          item,
          { y: "4rem", autoAlpha: 0 },
          {
            y: "0rem",
            autoAlpha: 1,
            visibility: "visible",
            duration: 1.2,
            delay: delay,
            ease: "power3.out",
            onComplete: () => this.refreshItemHoverState(item),
          }
        );
        delay += 0.15;
      }
  
      if (this.currentBatch < totalBatches) {
        setTimeout(() => this.setupInfiniteScroll(), 500);
      }
    }
  
    refreshItemHoverState(item) {
      const expandElement = item.querySelector(".project_expand");
      const infoElement = item.querySelector(".project_info");
  
      if (expandElement) {
        gsap.set(expandElement, {
          height: this.isGridView ? "auto" : 0,
        });
      }
  
      if (infoElement) {
        // Always keep info element visible
        gsap.set(infoElement, { opacity: 1, display: "block" });
      }
    }
  
    refreshItemStates() {
      this.elements.projectItems.forEach((item) => {
        this.refreshItemHoverState(item);
      });
    }
  
    bindEvents() {
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.cacheElements();
          this.setupInfiniteScroll();
          this.refreshItemStates();
        }, 250);
      });
    }
  
    refresh() {
      if (this.initialized) {
        this.cacheElements();
        this.setupInfiniteScroll();
        this.refreshItemStates();
      }
    }
  }
  
  const projectGrid = new ProjectGrid();
  export { projectGrid };