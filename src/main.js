// src/main.js
console.log('Main script loaded and executed!');

// Create a global variable to verify script is executing
window.scriptLoaded = true;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded event fired');
  
  // Create a visible element to verify script execution
  const testElement = document.createElement('div');
  testElement.style.position = 'fixed';
  testElement.style.top = '0';
  testElement.style.left = '0';
  testElement.style.padding = '10px';
  testElement.style.background = 'red';
  testElement.style.color = 'white';
  testElement.style.zIndex = '9999';
  testElement.textContent = 'Script executed successfully';
  
  document.body.appendChild(testElement);
  
  // Check if GSAP and ScrollSmoother are available
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not available');
    testElement.textContent += ' - GSAP missing';
  } else {
    console.log('GSAP is available');
    testElement.textContent += ' - GSAP OK';
    
    if (typeof ScrollSmoother === 'undefined') {
      console.error('ScrollSmoother is not available');
      testElement.textContent += ' - ScrollSmoother missing';
    } else {
      console.log('ScrollSmoother is available');
      testElement.textContent += ' - ScrollSmoother OK';
    }
  }
});