// src/modules/core/page-detector.js

class PageDetector {
    constructor() {
      this.currentPage = null;
    }
  
    init() {
      this.detectCurrentPage();
      return this.currentPage;
    }
  
    detectCurrentPage() {
      // Use data-page attribute for page detection
      const bodyElement = document.body;
      if (bodyElement && bodyElement.dataset.page) {
        this.currentPage = bodyElement.dataset.page;
      } else {
        // If no data-page attribute is found, set to unknown
        this.currentPage = 'unknown';
        console.warn('No data-page attribute found on body element. Add data-page="pagename" to the body tag in Webflow.');
      }
      
      return this.currentPage;
    }
  
    isPage(pageName) {
      if (!this.currentPage) {
        this.detectCurrentPage();
      }
      return this.currentPage === pageName;
    }
  
    isOneOfPages(pageNames) {
      if (!this.currentPage) {
        this.detectCurrentPage();
      }
      return pageNames.includes(this.currentPage);
    }
  }
  
  const pageDetector = new PageDetector();
  export default pageDetector;