// src/main.js
import smoothScroll from './modules/core/smooth-scroll';
import animations from './modules/core/animations';
import menu from './modules/ui/menu';
import buttons from './modules/ui/buttons';
import textAnimations from './modules/ui/text-animations';

// Feature modules
import horizontalScroll from './modules/features/horizontal-scroll';
import slider from './modules/features/slider';
import fallingLogos from './modules/features/falling-logos';
import projectGrid from './modules/features/project-grid';
import formSteps from './modules/features/form-steps';
import nextProject from './modules/features/next-project';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize core modules for all pages
  smoothScroll.init();
  animations.init();
  menu.init();
  buttons.init();
  textAnimations.init();
  
  // Feature detection & initialization based on page elements
  if (document.querySelector('.tag-canvas')) {
    fallingLogos.init();
  }
  
  if (document.querySelector('.track, .recent_slider, .horizontal-scroll')) {
    horizontalScroll.init();
  }
  
  if (document.querySelector('.swiper')) {
    slider.init();
  }
  
  if (document.querySelector('.projects_collection-list')) {
    projectGrid.init();
  }
  
  if (document.querySelector('.next-button, .prev-button')) {
    formSteps.init();
  }
  
  if (document.querySelector('.order-number')) {
    nextProject.init();
  }
});