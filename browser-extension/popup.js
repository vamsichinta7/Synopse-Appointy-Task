// Configuration
let serverUrl = 'http://localhost:5000/api';
let authToken = '';

// Load settings on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkConnection();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get(['serverUrl', 'authToken']);
  if (result.serverUrl) {
    serverUrl = result.serverUrl;
    document.getElementById('serverUrl').value = serverUrl;
  }
  if (result.authToken) {
    authToken = result.authToken;
    document.getElementById('apiToken').value = authToken;
  }
}

// Check connection to server
async function checkConnection() {
  const statusEl = document.getElementById('status');

  if (!authToken) {
    statusEl.classList.remove('connected');
    statusEl.querySelector('.status-text').textContent = 'Not Configured';
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/items?limit=1`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      statusEl.classList.add('connected');
      statusEl.querySelector('.status-text').textContent = 'Connected';
    } else {
      statusEl.classList.remove('connected');
      statusEl.querySelector('.status-text').textContent = 'Auth Failed';
    }
  } catch (error) {
    statusEl.classList.remove('connected');
    statusEl.querySelector('.status-text').textContent = 'Cannot Connect';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Settings toggle
  document.getElementById('settingsBtn').addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', async () => {
    const newServerUrl = document.getElementById('serverUrl').value;
    const newAuthToken = document.getElementById('apiToken').value;

    await chrome.storage.sync.set({
      serverUrl: newServerUrl,
      authToken: newAuthToken
    });

    serverUrl = newServerUrl;
    authToken = newAuthToken;

    showMessage('Settings saved successfully!', 'success');
    document.getElementById('settingsPanel').classList.add('hidden');
    await checkConnection();
  });

  // Quick actions
  document.getElementById('savePageBtn').addEventListener('click', saveCurrentPage);
  document.getElementById('saveSelectionBtn').addEventListener('click', saveSelection);
  document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
  document.getElementById('customSaveBtn').addEventListener('click', customSave);
}

// Save current page
async function saveCurrentPage() {
  if (!authToken) {
    showMessage('Please configure your API token in settings', 'error');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  setLoading('savePageBtn', true);

  try {
    const response = await fetch(`${serverUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        url: tab.url,
        type: 'web'
      })
    });

    if (response.ok) {
      showMessage('Page saved to your brain!', 'success');
    } else {
      const error = await response.json();
      showMessage(error.error || 'Failed to save page', 'error');
    }
  } catch (error) {
    showMessage('Network error: ' + error.message, 'error');
  } finally {
    setLoading('savePageBtn', false);
  }
}

// Save selected text
async function saveSelection() {
  if (!authToken) {
    showMessage('Please configure your API token in settings', 'error');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Get selection from content script
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  const selectedText = result.result;

  if (!selectedText || selectedText.trim().length === 0) {
    showMessage('Please select some text first', 'error');
    return;
  }

  setLoading('saveSelectionBtn', true);

  try {
    const response = await fetch(`${serverUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        text: selectedText,
        url: tab.url,
        type: 'text'
      })
    });

    if (response.ok) {
      showMessage('Selection saved to your brain!', 'success');
    } else {
      const error = await response.json();
      showMessage(error.error || 'Failed to save selection', 'error');
    }
  } catch (error) {
    showMessage('Network error: ' + error.message, 'error');
  } finally {
    setLoading('saveSelectionBtn', false);
  }
}

// Take screenshot
async function takeScreenshot() {
  if (!authToken) {
    showMessage('Please configure your API token in settings', 'error');
    return;
  }

  setLoading('screenshotBtn', true);

  try {
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'screenshot.png');
    formData.append('caption', 'Screenshot');

    // Upload to server
    const uploadResponse = await fetch(`${serverUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    if (uploadResponse.ok) {
      showMessage('Screenshot saved to your brain!', 'success');
    } else {
      const error = await uploadResponse.json();
      showMessage(error.error || 'Failed to save screenshot', 'error');
    }
  } catch (error) {
    showMessage('Error taking screenshot: ' + error.message, 'error');
  } finally {
    setLoading('screenshotBtn', false);
  }
}

// Custom save with options
async function customSave() {
  if (!authToken) {
    showMessage('Please configure your API token in settings', 'error');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const category = document.getElementById('category').value;
  const caption = document.getElementById('caption').value;
  const tags = document.getElementById('tags').value;

  const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

  setLoading('customSaveBtn', true);

  try {
    const response = await fetch(`${serverUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        url: tab.url,
        type: 'web',
        caption: caption || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        category: category || undefined
      })
    });

    if (response.ok) {
      showMessage('Saved to your brain with custom options!', 'success');
      // Clear form
      document.getElementById('caption').value = '';
      document.getElementById('tags').value = '';
      document.getElementById('category').value = '';
    } else {
      const error = await response.json();
      showMessage(error.error || 'Failed to save', 'error');
    }
  } catch (error) {
    showMessage('Network error: ' + error.message, 'error');
  } finally {
    setLoading('customSaveBtn', false);
  }
}

// Utility: Show message
function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.classList.remove('hidden');

  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 4000);
}

// Utility: Set loading state
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}
