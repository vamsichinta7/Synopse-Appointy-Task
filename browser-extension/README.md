# Synapse Browser Extension

Save anything from the web to your Synapse brain with one click!

## Features

- **Quick Save**: Save the current page with one click
- **Save Selection**: Highlight text and save it to your brain
- **Screenshot Capture**: Take and save screenshots of web pages
- **Context Menu Integration**: Right-click to save pages, links, images, or text
- **Custom Metadata**: Add categories, tags, and captions to your saved items
- **Offline Queue**: Saves are queued if you're offline

## Installation

### Chrome/Edge

1. Open your browser and navigate to extensions:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. Enable "Developer mode" (toggle in the top right)

3. Click "Load unpacked"

4. Select the `browser-extension` folder

5. The Synapse extension should now appear in your extensions list

### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`

2. Click "Load Temporary Add-on"

3. Select the `manifest.json` file from the `browser-extension` folder

## Configuration

1. Click the Synapse extension icon in your browser toolbar

2. Click the settings gear icon

3. Configure:
   - **Server URL**: Your Synapse API endpoint (default: `http://localhost:5000/api`)
   - **API Token**: Your authentication token (get this from your Synapse web app)

4. Click "Save Settings"

5. The status indicator should show "Connected" if configured correctly

## Getting Your API Token

1. Open your Synapse web application (default: `http://localhost:3000`)

2. Go to Settings or Profile section

3. Look for "API Token" or "Browser Extension Token"

4. Copy the token and paste it into the extension settings

## Usage

### Quick Save Options

- **Save This Page**: Saves the current webpage URL and metadata
- **Save Selection**: Select text on the page, then click this button
- **Screenshot**: Captures a screenshot of the visible area

### Custom Capture

Use the custom capture section to:
- Select a category (Article, Product, Video, etc.)
- Add a personal caption or note
- Add tags for better organization

### Context Menu (Right-Click)

Right-click anywhere on a webpage to access:
- Save Page to Synapse
- Save Link to Synapse (when right-clicking a link)
- Save Selection to Synapse (when text is selected)
- Save Image to Synapse (when right-clicking an image)

## Troubleshooting

### "Not Configured" Status
- Make sure you've entered your API token in settings
- Verify the Server URL matches your Synapse API endpoint

### "Cannot Connect" Status
- Check if your Synapse server is running
- Verify the Server URL is correct
- Check for any firewall or CORS issues

### "Auth Failed" Status
- Your API token may be invalid or expired
- Generate a new token from the Synapse web app

### Icons Not Loading
- Icons should be automatically generated
- If missing, run: `node generate-icons.js` in the extension directory

## Development

### Regenerate Icons

```bash
cd browser-extension
npm install sharp
node generate-icons.js
```

### Reload Extension

After making changes:
1. Go to your browser's extensions page
2. Click the reload icon for the Synapse extension
3. The changes should take effect immediately

## Privacy

- The extension only sends data to YOUR Synapse server
- No data is sent to third parties
- All data stays within your control
- The extension requires permissions for:
  - `activeTab`: To read current page URL and title
  - `contextMenus`: To add right-click menu options
  - `storage`: To save your settings locally
  - `tabs`: To capture screenshots
  - `scripting`: To read selected text
  - `notifications`: To show save confirmations
  - `host_permissions`: To access any website you visit

## Support

If you encounter issues, check:
1. Browser console for errors (F12)
2. Extension popup console (right-click extension icon > Inspect)
3. Synapse server logs

## License

Part of the Synapse project - Your Second Brain
