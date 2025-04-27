// src/main.js
import smoothScroll from './modules/core/smooth-scroll.js';
import fallingLogos from './modules/features/falling-logos.js';

function initializeSiteModules() {
  if (typeof window.gsap === 'undefined') {
    return;
  }
  if (typeof window.ScrollTrigger === 'undefined') {
    return;
  }
  if (typeof window.ScrollSmoother === 'undefined') {
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  } catch (error) {
  }

  try {
    smoothScroll.init();
  } catch (error) {
  }

  try {
    fallingLogos.init();
  } catch (error) {
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSiteModules);
} else {
  initializeSiteModules();
}

window.siteModules = {
  smoothScroll: smoothScroll,
  fallingLogos: fallingLogos
};