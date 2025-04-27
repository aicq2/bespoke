// src/modules/ui/buttons.js

class ButtonAnimations {
    constructor() {
      this.initialized = false;
    }
  
    init() {
      if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
        console.warn('GSAP or SplitText not found. Button animations require these libraries.');
        return;
      }
      
      this.initButtonAnimations();
      this.initialized = true;
    }
  
    refresh() {
      if (this.initialized) {
        this.initButtonAnimations();
      }
    }
  
    initButtonAnimations() {
      const buttons = document.querySelectorAll('[data-gsap="btn"]');
      
      if (buttons.length === 0) {
        return;
      }
      
      buttons.forEach((button, index) => {
        const originalText = button.querySelector(".btn-text");
        
        if (!originalText) {
          console.warn(`Element with class "btn-text" not found inside button ${index + 1}`);
          return;
        }
        
        const originalSplit = new SplitText(originalText, { type: "chars" });
        
        const clonedText = originalText.cloneNode(true);
        button.appendChild(clonedText);
        
        const clonedSplit = new SplitText(clonedText, { type: "chars" });
        
        const originalChars = originalSplit.chars;
        const clonedChars = clonedSplit.chars;
        
        gsap.set(clonedText, { position: "absolute" });
        gsap.set(clonedChars, { y: "100%" });
        
        // Create button hover animation
        button.addEventListener("mouseenter", () => {
          this.animateChars(originalChars, "-100%");
          this.animateChars(clonedChars, "0%");
        });
        
        button.addEventListener("mouseleave", () => {
          this.animateChars(originalChars, "0%");
          this.animateChars(clonedChars, "100%");
        });
      });
    }
  
    animateChars(chars, yPosition) {
      gsap.to(chars, {
        y: yPosition,
        duration: 0.35,
        ease: "power1.inOut",
        stagger: 0.02,
      });
    }
  }
  
  const buttonAnimations = new ButtonAnimations();
  export default buttonAnimations;