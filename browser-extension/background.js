// Background service worker for Synapse extension

// Initialize context menus on install
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for pages
  chrome.contextMenus.create({
    id: 'synapse-save-page',
    title: 'Save Page to Synapse',
    contexts: ['page']
  });

  // Create context menu for links
  chrome.contextMenus.create({
    id: 'synapse-save-link',
    title: 'Save Link to Synapse',
    contexts: ['link']
  });

  // Create context menu for selected text
  chrome.contextMenus.create({
    id: 'synapse-save-selection',
    title: 'Save Selection to Synapse',
    contexts: ['selection']
  });

  // Create context menu for images
  chrome.contextMenus.create({
    id: 'synapse-save-image',
    title: 'Save Image to Synapse',
    contexts: ['image']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await chrome.storage.sync.get(['serverUrl', 'authToken']);
  const serverUrl = settings.serverUrl || 'http://localhost:5000/api';
  const authToken = settings.authToken;

  if (!authToken) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Synapse - Not Configured',
      message: 'Please configure your API token in the extension settings'
    });
    return;
  }

  try {
    switch (info.menuItemId) {
      case 'synapse-save-page':
        await savePage(serverUrl, authToken, tab.url, tab.title);
        break;
      case 'synapse-save-link':
        await savePage(serverUrl, authToken, info.linkUrl, 'Saved Link');
        break;
      case 'synapse-save-selection':
        await saveText(serverUrl, authToken, info.selectionText, tab.url);
        break;
      case 'synapse-save-image':
        await saveImage(serverUrl, authToken, info.srcUrl, tab.url);
        break;
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Synapse - Saved!',
      message: 'Successfully saved to your brain'
    });
  } catch (error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Synapse - Error',
      message: 'Failed to save: ' + error.message
    });
  }
});

// Save page function
async function savePage(serverUrl, authToken, url, title) {
  const response = await fetch(`${serverUrl}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      url: url,
      type: 'web'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save page');
  }
}

// Save text function
async function saveText(serverUrl, authToken, text, sourceUrl) {
  const response = await fetch(`${serverUrl}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      text: text,
      url: sourceUrl,
      type: 'text'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save text');
  }
}

// Save image function
async function saveImage(serverUrl, authToken, imageUrl, sourceUrl) {
  // Fetch the image
  const imageResponse = await fetch(imageUrl);
  const blob = await imageResponse.blob();

  // Create form data
  const formData = new FormData();
  formData.append('file', blob, 'image.png');
  formData.append('caption', `Image from ${sourceUrl}`);

  // Upload to server
  const response = await fetch(`${serverUrl}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save image');
  }
}

// Keyboard shortcut listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-save') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const settings = await chrome.storage.sync.get(['serverUrl', 'authToken']);
    const serverUrl = settings.serverUrl || 'http://localhost:5000/api';
    const authToken = settings.authToken;

    if (!authToken) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Synapse - Not Configured',
        message: 'Please configure your API token'
      });
      return;
    }

    try {
      await savePage(serverUrl, authToken, tab.url, tab.title);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Synapse - Quick Saved!',
        message: 'Page saved to your brain'
      });
    } catch (error) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Synapse - Error',
        message: error.message
      });
    }
  }
});
