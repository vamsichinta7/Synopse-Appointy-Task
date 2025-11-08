# 🛠️ Detailed Setup Guide for Project Synapse

This guide will walk you through setting up Project Synapse from scratch.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- [ ] **MongoDB** - Choose one:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (free cloud) - [Sign up](https://www.mongodb.com/atlas)
- [ ] **Anthropic API Key** - [Get here](https://console.anthropic.com/)
- [ ] **OpenAI API Key** - [Get here](https://platform.openai.com/api-keys)
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **Chrome Browser** - For the extension

## Step-by-Step Installation

### 1. Get API Keys

#### Anthropic API Key (Claude)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

#### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy the key (starts with `sk-`)

### 2. Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to https://www.mongodb.com/atlas
2. Click "Try Free"
3. Create an account
4. Create a free cluster:
   - Choose a cloud provider (AWS recommended)
   - Select a region close to you
   - Use the free M0 tier
5. Wait for cluster creation (2-5 minutes)
6. Click "Connect" on your cluster
7. Add your IP address (or use 0.0.0.0/0 for development)
8. Create a database user with username and password
9. Choose "Connect your application"
10. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
11. Replace `<password>` with your database user password

#### Option B: Local MongoDB

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download installer from mongodb.com
# Run installer with default settings
# MongoDB will start automatically

# Verify installation
mongosh
# You should see MongoDB shell
```

Your local connection string: `mongodb://localhost:27017/synapse`

### 3. Clone and Install Backend

```bash
# Clone repository
cd /path/where/you/want/project
git clone <repository-url>
cd project-synapse

# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Open .env in your text editor and fill in:
```

#### backend/.env configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB - Use YOUR connection string
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/synapse
# OR for local:
# MONGODB_URI=mongodb://localhost:27017/synapse

# JWT Secret - Change this to any random string
JWT_SECRET=change_this_to_a_random_secret_string_123456

# Claude API - Paste your Anthropic key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI API - Paste your OpenAI key
OPENAI_API_KEY=sk-your-openai-key-here

# CORS
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

```bash
# Create uploads directory
mkdir uploads

# Start the backend
npm run dev

# You should see:
# ✅ MongoDB connected successfully
# 🚀 Synapse Backend running on port 5000
```

**Troubleshooting Backend:**
- If MongoDB connection fails, check your connection string
- If port 5000 is in use, change PORT in .env
- Make sure your IP is whitelisted in MongoDB Atlas

### 4. Install Frontend

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend from project root
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# You should see:
# ➜  Local:   http://localhost:3000/
```

**Troubleshooting Frontend:**
- If dependencies fail, try `npm install --legacy-peer-deps`
- If port 3000 is in use, Vite will automatically use 3001

### 5. Test the Application

1. Open browser to http://localhost:3000
2. Click "Sign up"
3. Create an account:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. You should be logged in and see the dashboard!

### 6. Install Chrome Extension

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Navigate to `project-synapse/chrome-extension` folder
6. Click "Select Folder"
7. The extension should appear in your extensions list

#### Using the Extension:

1. Click the Synapse extension icon (🧠) in your toolbar
2. Login with your credentials
3. Navigate to any webpage
4. Click the extension and "Save This Page"
5. Check your Synapse dashboard - the page should be saved!

### 7. Create Extension Icons (Optional)

The extension needs icon files. You can:

**Option 1: Use placeholders**
Create a simple colored square for now:
1. Use any image editor
2. Create 3 PNG files:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
3. Save them in `chrome-extension/icons/`

**Option 2: Use emoji screenshot**
1. Open browser, zoom in on 🧠 emoji
2. Screenshot it
3. Resize to 16px, 48px, 128px
4. Save as PNG files

## Testing Everything Works

### Test URL Scraping
1. Click "Add to Brain"
2. Select "URL"
3. Paste: `https://www.paulgraham.com/weird.html`
4. Click "Save to Brain"
5. Wait a few seconds
6. The article should appear as a card!

### Test File Upload
1. Click "Add to Brain"
2. Select "Upload File"
3. Upload a screenshot or PDF
4. Wait for processing
5. Check if it appears in your dashboard

### Test Search
1. Save a few different items (articles, notes, etc.)
2. Go to Search page
3. Try: "articles I saved today"
4. Results should appear!

### Test Reflection
1. After saving a few items
2. Go to Reflection page
3. Select "Today" or "This Week"
4. You should see AI-generated insights!

## Common Issues & Solutions

### Backend won't start

**Error: Cannot connect to MongoDB**
```
Solution:
1. Check MongoDB is running: mongosh
2. Verify connection string in .env
3. If using Atlas, check IP whitelist
4. Make sure password doesn't have special characters
```

**Error: Missing API keys**
```
Solution:
1. Check .env file has ANTHROPIC_API_KEY and OPENAI_API_KEY
2. Make sure keys start with sk-ant- and sk- respectively
3. No quotes around the keys in .env
```

**Port already in use**
```
Solution:
1. Change PORT in backend/.env to 5001
2. Update frontend API URL accordingly
```

### Frontend won't start

**Error: Module not found**
```bash
Solution:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Error: Cannot connect to backend**
```
Solution:
1. Make sure backend is running on port 5000
2. Check browser console for CORS errors
3. Verify FRONTEND_URL in backend .env matches your frontend URL
```

### Extension not working

**Extension doesn't save**
```
Solution:
1. Check that backend is running
2. Login to extension first
3. Check Chrome developer tools console for errors
4. Make sure API_URL in popup.js points to http://localhost:5000/api
```

**Cannot load extension**
```
Solution:
1. Make sure you selected the chrome-extension folder, not a subfolder
2. Check that manifest.json is in the root of the selected folder
3. Try removing and re-adding the extension
```

## Next Steps

Now that everything is working:

1. **Customize**: Update colors, fonts, or add features
2. **Add Content**: Start saving articles, videos, notes
3. **Test Search**: Try complex natural language queries
4. **Explore**: Check out the reflection insights
5. **Deploy**: When ready, deploy to production (see README.md)

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes reflect immediately
- Backend: Uses nodemon for auto-restart

### Debugging
- Backend: Add `console.log` or use Chrome DevTools
- Frontend: Use React DevTools extension
- Extension: Check `chrome://extensions` > Inspect views

### Adding Features
- New routes: Add to `backend/routes/`
- New components: Add to `frontend/src/components/`
- New pages: Add to `frontend/src/pages/` and update routes

## Getting Help

If you're stuck:
1. Check error messages in terminal/console
2. Review this guide again
3. Check MongoDB/API key configuration
4. Open an issue on GitHub
5. Ask in project discussions

## Production Deployment

When you're ready to deploy, see:
- README.md for deployment options
- Use production MongoDB cluster
- Set NODE_ENV=production
- Enable HTTPS
- Use environment-specific URLs

---

**Congratulations! 🎉**

You now have a fully functional AI-powered second brain!

Start saving your thoughts, articles, ideas, and watch your knowledge base grow.
