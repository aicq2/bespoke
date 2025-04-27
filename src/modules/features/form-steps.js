// src/modules/features/form-steps.js

class FormSteps {
    constructor() {
      this.initialized = false;
      this.elements = {
        nextButton: null,
        prevButton: null,
        submitWrapper: null,
        step1: null,
        step2: null,
        nameInput: null,
        emailInput: null,
        messageTextarea: null,
        stepNumberSpan: null
      };
    }
  
    init() {
      // Only initialize on contacts page
      if (!window.siteModules.pageDetector.isPage('contacts')) {
        return;
      }
  
      // Check for required GSAP dependency
      if (typeof gsap === 'undefined') {
        console.warn('GSAP not found. Form steps animations require this library.');
        return;
      }
  
      this.cacheElements();
  
      // Check if form elements exist
      if (!this.elements.step1 || !this.elements.nameInput) {
        console.warn('Form step elements not found. Make sure the form structure is correct.');
        return;
      }
  
      this.setupForm();
      this.bindEvents();
      this.initialized = true;
    }
  
    cacheElements() {
      this.elements = {
        nextButton: document.querySelector(".next-button"),
        prevButton: document.querySelector(".prev-button"),
        submitWrapper: document.querySelector(".submit-wrapper"),
        step1: document.getElementById("step1"),
        step2: document.getElementById("step2"),
        nameInput: document.getElementById("Name"),
        emailInput: document.getElementById("Email"),
        messageTextarea: document.getElementById("Message"),
        stepNumberSpan: document.querySelector(".step-number")
      };
    }
  
    setupForm() {
      const { step1, step2, nextButton, prevButton, submitWrapper, nameInput, emailInput, stepNumberSpan } = this.elements;
  
      // Set up initial form state
      gsap.set(step1, { autoAlpha: 1, display: "block" });
      gsap.set(step2, { autoAlpha: 0, display: "block" });
      gsap.set(nextButton, { autoAlpha: 1 });
      gsap.set(prevButton, { autoAlpha: 0 });
      gsap.set(submitWrapper, { autoAlpha: 0 });
  
      // Set step number text
      if (stepNumberSpan) {
        stepNumberSpan.textContent = "1";
      }
  
      // Add required attributes to form fields
      if (nameInput) nameInput.setAttribute("required", "");
      if (emailInput) emailInput.setAttribute("required", "");
    }
  
    getAccurateRect(element) {
      return element.getBoundingClientRect();
    }
  
    createMorphClone(sourceRect) {
      const clone = document.createElement("div");
      clone.id = "morph-clone";
      clone.style.position = "fixed";
      clone.style.top = sourceRect.top + "px";
      clone.style.left = sourceRect.left + "px";
      clone.style.width = sourceRect.width + "px";
      clone.style.height = sourceRect.height + "px";
      clone.style.backgroundColor = "#1E1E1E";
      clone.style.border = "1px solid transparent";
      clone.style.borderRadius = "16px";
      clone.style.zIndex = "9999";
      document.body.appendChild(clone);
      return clone;
    }
  
    updateUIForStep(toStep2) {
      const { nextButton, prevButton, submitWrapper, stepNumberSpan } = this.elements;
      const tl = gsap.timeline();
  
      if (toStep2) {
        tl.to(nextButton, { autoAlpha: 0, duration: 0.3 })
          .to(prevButton, { autoAlpha: 1, duration: 0.3 }, "-=0.2")
          .to(submitWrapper, { autoAlpha: 1, duration: 0.3 }, "-=0.2");
  
        if (stepNumberSpan) {
          tl.to(
            stepNumberSpan,
            {
              opacity: 0,
              duration: 0.1,
              onComplete: () => {
                stepNumberSpan.textContent = "2";
                gsap.to(stepNumberSpan, {
                  opacity: 1,
                  duration: 0.2,
                });
              },
            },
            "-=0.1"
          );
        }
      } else {
        tl.to(prevButton, { autoAlpha: 0, duration: 0.3 })
          .to(submitWrapper, { autoAlpha: 0, duration: 0.3 }, "-=0.3")
          .to(nextButton, { autoAlpha: 1, duration: 0.3 }, "-=0.2");
  
        if (stepNumberSpan) {
          tl.to(
            stepNumberSpan,
            {
              opacity: 0,
              duration: 0.1,
              onComplete: () => {
                stepNumberSpan.textContent = "1";
                gsap.to(stepNumberSpan, {
                  opacity: 1,
                  duration: 0.2,
                });
              },
            },
            "-=0.1"
          );
        }
      }
  
      return tl;
    }
  
    validateStep1Fields() {
      const { nameInput, emailInput } = this.elements;
      let isValid = true;
  
      if (nameInput && !nameInput.checkValidity()) {
        nameInput.reportValidity();
        isValid = false;
        return isValid;
      }
  
      if (emailInput && !emailInput.checkValidity()) {
        emailInput.reportValidity();
        isValid = false;
        return isValid;
      }
  
      return isValid;
    }
  
    bindEvents() {
      const { nextButton, prevButton, step1, step2, nameInput, messageTextarea } = this.elements;
  
      if (nextButton) {
        nextButton.addEventListener("click", (e) => {
          if (!this.validateStep1Fields()) {
            return;
          }
  
          const nameRect = this.getAccurateRect(nameInput);
          const messageRect = this.getAccurateRect(messageTextarea);
          const morphClone = this.createMorphClone(nameRect);
  
          const tl = gsap.timeline();
  
          tl.to(step1, { autoAlpha: 0, duration: 0.1 })
            .to(
              morphClone,
              {
                top: messageRect.top,
                left: messageRect.left,
                width: messageRect.width,
                height: messageRect.height,
                duration: 0.5,
                ease: "power1.inOut",
              },
              "-=0.1"
            )
            .to(step2, { autoAlpha: 1, duration: 0.1 }, "-=0.1")
            .add(() => {
              morphClone.remove();
              messageTextarea.focus();
              this.updateUIForStep(true);
            });
        });
      }
  
      if (prevButton) {
        prevButton.addEventListener("click", () => {
          const messageRect = this.getAccurateRect(messageTextarea);
          const nameRect = this.getAccurateRect(nameInput);
          const morphClone = this.createMorphClone(messageRect);
  
          const tl = gsap.timeline();
  
          tl.to(step2, { autoAlpha: 0, duration: 0.1 })
            .to(
              morphClone,
              {
                top: nameRect.top,
                left: nameRect.left,
                width: nameRect.width,
                height: nameRect.height,
                duration: 0.7,
                ease: "power2.inOut",
              },
              "-=0.1"
            )
            .to(step1, { autoAlpha: 1, duration: 0.2 }, "-=0.1")
            .add(() => {
              morphClone.remove();
              nameInput.focus();
              this.updateUIForStep(false);
            });
        });
      }
    }
  
    refresh() {
      if (this.initialized) {
        // Re-cache elements in case DOM has changed
        this.cacheElements();
        this.setupForm();
      }
    }
  }
  
  const formSteps = new FormSteps();
  export default formSteps;