// Content script for Synapse extension
// This script runs on all web pages and can interact with the page content

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  } else if (request.action === 'getPageContent') {
    const pageData = extractPageData();
    sendResponse(pageData);
  }

  return true; // Keep message channel open for async response
});

// Extract useful data from the current page
function extractPageData() {
  // Get page metadata
  const title = document.title;
  const url = window.location.href;

  // Extract meta tags
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const author = document.querySelector('meta[name="author"]')?.content || '';
  const keywords = document.querySelector('meta[name="keywords"]')?.content || '';

  // Try to get the main content
  let mainContent = '';

  // Try to find article content
  const article = document.querySelector('article');
  if (article) {
    mainContent = article.innerText;
  } else {
    // Fall back to main tag or body
    const main = document.querySelector('main') || document.body;
    mainContent = main.innerText;
  }

  // Get all images on the page
  const images = Array.from(document.querySelectorAll('img'))
    .map(img => ({
      src: img.src,
      alt: img.alt
    }))
    .filter(img => img.src && !img.src.startsWith('data:'))
    .slice(0, 10); // Limit to first 10 images

  return {
    title,
    url,
    description,
    author,
    keywords,
    content: mainContent.substring(0, 5000), // Limit content size
    images
  };
}

// Add visual feedback when content is saved
function showSaveConfirmation() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.5);
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>Saved to Synapse!</span>
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// Listen for successful saves from background script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'showConfirmation') {
    showSaveConfirmation();
  }
});
