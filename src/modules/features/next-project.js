// src/modules/features/next-project.js

class NextProject {
    constructor() {
      this.initialized = false;
    }
  
    init(params = {}) {
      const { currentPage } = params;
      
      // Only initialize on project-details page
      if (currentPage !== 'project-details') {
        return;
      }
  
      this.setupNextProjectNavigation();
      this.initialized = true;
    }
  
    setupNextProjectNavigation() {
      const currentOrderElement = document.querySelector(".order-number");
      if (!currentOrderElement) {
        console.warn('Next project navigation: order-number element not found');
        return;
      }
  
      const currentOrder = parseInt(currentOrderElement.textContent.trim());
  
      const allProjects = Array.from(
        document.querySelectorAll(
          ".projects_collection .projects_collection-list .projects_collection-item"
        )
      );
      
      if (allProjects.length === 0) {
        console.warn('Next project navigation: projects collection not found');
        return;
      }
  
      const regularProjects = [];
      const orderNumbers = [];
  
      allProjects.forEach((project) => {
        const orderElement = project.querySelector(".order-number");
        if (orderElement) {
          const orderNum = parseInt(orderElement.textContent.trim());
  
          if (orderNum !== 99999) {
            regularProjects.push(project);
            orderNumbers.push(orderNum);
          }
        }
      });
  
      orderNumbers.sort((a, b) => a - b);
      const maxOrder = Math.max(...orderNumbers);
  
      let nextOrder;
      if (currentOrder === maxOrder) {
        nextOrder = Math.min(...orderNumbers);
      } else {
        nextOrder = orderNumbers.find((num) => num > currentOrder);
      }
  
      // Hide all projects initially
      allProjects.forEach((project) => {
        project.style.display = "none";
      });
  
      // Show only the next project
      let foundNextProject = false;
      regularProjects.forEach((project) => {
        const orderElement = project.querySelector(".order-number");
        if (orderElement) {
          const orderNum = parseInt(orderElement.textContent.trim());
  
          if (orderNum === nextOrder) {
            project.style.display = "block";
            foundNextProject = true;
          }
        }
      });
  
      // Make sure the collection list and wrapper are visible
      const collectionList = document.querySelector(
        ".projects_collection .projects_collection-list"
      );
      const collectionWrapper = document.querySelector(".projects_collection");
  
      if (collectionList && collectionWrapper) {
        collectionList.style.display = "block";
        collectionWrapper.style.display = "block";
      }
  
      if (!foundNextProject) {
        console.warn('Next project navigation: could not find next project with order number', nextOrder);
      }
    }
  
    refresh() {
      if (this.initialized) {
        this.setupNextProjectNavigation();
      }
    }
  }
  
  const nextProject = new NextProject();
  export { nextProject };