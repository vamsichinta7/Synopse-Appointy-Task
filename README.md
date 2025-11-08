# 🧠 Project Synapse - Your AI-Powered Second Brain

**Save anything, find everything, remember forever.**

Synapse is an intelligent personal knowledge management system that uses AI to help you capture, organize, and retrieve information effortlessly. Built with the MERN stack and powered by Claude AI.


## ✨ Features

### 🎯 Capture Anything, Instantly
- **URL Scraping**: Save articles, products, videos, research papers with one click
- **File Upload**: Upload images (with OCR), PDFs, documents
- **Text Notes**: Quick capture of ideas, thoughts, and to-dos
- **Chrome Extension**: Save from any webpage without leaving your browser
- **Handwritten Notes**: OCR extracts text from photos of handwritten notes

### 🎨 Beautiful Visual Organization
- **Smart Card Types**: Each item is displayed as a beautiful card optimized for its type
  - Articles with featured images and key points
  - Products with prices and images
  - Videos with embedded players
  - To-do lists with checkboxes
  - Quotes with elegant typography
  - Research papers with metadata
  - Ideas with actionable steps
- **Masonry Layout**: Pinterest-style responsive grid
- **Category Filtering**: Filter by articles, products, videos, books, papers, ideas, etc.
- **Tagging System**: Automatic and manual tagging

### 🔍 Intelligent Search
- **Natural Language Queries**: Search like you think
  - "Articles about AI I saved last month"
  - "That quote about new beginnings from the handwritten note"
  - "Black leather shoes under $300"
  - "What did Karpathy say about tokenization?"
- **Semantic Search**: Understands context and meaning, not just keywords
- **Multi-dimensional Filtering**: Category, tags, time range, price, source
- **Vector Embeddings**: Uses OpenAI embeddings for semantic similarity

### 🌟 AI-Powered Features
- **Content Understanding**: Claude AI analyzes and categorizes everything you save
- **Automatic Summarization**: Generates concise summaries of long content
- **Key Points Extraction**: Pulls out the most important information
- **Smart Tagging**: Automatically generates relevant tags
- **Reflection & Insights**: Weekly/monthly summaries of your saved content
- **Contextual Metadata**: Extracts authors, dates, prices, sources automatically

### 📊 Reflection & Analytics
- **Brain Digests**: Weekly, monthly, or yearly summaries
- **Pattern Recognition**: Discover your interests and themes
- **Statistics**: Category breakdowns, top tags, saving trends
- **Suggested Actions**: AI-powered recommendations based on what you save

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API server
- **MongoDB**: Document database with text indexing
- **Claude AI (Anthropic)**: Content analysis and intelligent processing
- **OpenAI Embeddings**: Semantic search with vector similarity
- **Tesseract.js**: OCR for image text extraction
- **Cheerio**: Web scraping and metadata extraction
- **JWT**: Secure authentication

### Frontend
- **React 18**: UI library
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Zustand**: State management
- **React Router**: Client-side routing
- **React Hot Toast**: Notifications
- **React Masonry**: Responsive grid layout

### Browser Extension
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript**: Lightweight and fast

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Anthropic API key (Claude)
- OpenAI API key (for embeddings)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/project-synapse.git
cd project-synapse
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Required:
# - MONGODB_URI
# - JWT_SECRET
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY

# Start the backend
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The Synapse extension is now installed!

### 5. Create Your Account

1. Open `http://localhost:3000`
2. Click "Sign up"
3. Create your account
4. Start building your second brain!

## 📖 Usage Guide

### Saving Content

#### Via Web App
1. Click "Add to Brain" button
2. Choose your method:
   - **URL**: Paste any link (article, product, video, etc.)
   - **Upload File**: Upload images, PDFs, or text files
   - **Text Note**: Write a quick note or idea
3. The AI will automatically:
   - Analyze and categorize the content
   - Extract key information
   - Generate tags
   - Create a beautiful visual card

#### Via Chrome Extension
1. While browsing any webpage, click the Synapse extension icon
2. Login if needed
3. Choose:
   - **Save Page**: Save the entire current page
   - **Save Selection**: Highlight text and save just that
   - **Add Note**: Write a quick note about the page
4. Or right-click anywhere and select "Save to Synapse"

### Searching Your Brain

1. Go to the Search page
2. Ask in natural language:
   - "Show me articles about machine learning from last month"
   - "Find that productivity tip I saved"
   - "Laptops under $1000"
   - "What did Paul Graham say about startups?"
3. The AI understands:
   - **Content type**: articles, videos, products, etc.
   - **Time**: yesterday, last week, this month, etc.
   - **Topics**: Keywords and semantic meaning
   - **Constraints**: Price ranges, authors, sources

### Viewing Reflections

1. Go to the Reflection page
2. Select a timeframe (day, week, month, year)
3. Get AI-generated insights:
   - Summary of what you've been interested in
   - Main themes and patterns
   - Key insights from your content
   - Suggested next actions
   - Statistics and visualizations

## 🎨 Customization

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/synapse

# Security
JWT_SECRET=your_secret_key_change_this

# AI Services
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# App
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Supported File Types

- **Images**: jpg, jpeg, png, gif, webp (with OCR)
- **Documents**: pdf, txt
- **URLs**: Any valid webpage

### Card Types

Synapse automatically chooses the best visual style:
- `article` - Featured image, author, key points
- `product` - Product image, price, details
- `video` - Embedded player or thumbnail
- `todo` - Interactive checklist
- `quote` - Beautiful typography
- `book` - Book cover, author, takeaways
- `paper` - Research paper with findings
- `idea` - Highlighted with actionable steps
- `code` - Syntax highlighted code blocks
- `image` - Image with OCR text
- `note` - Simple text note

## 🔒 Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **CORS Protection**: Configured for your domain
- **Input Validation**: Express-validator on all endpoints
- **Rate Limiting**: Recommended for production
- **HTTPS**: Required for production deployment

## 📦 Deployment

### Backend (Render, Railway, etc.)

1. Push code to GitHub
2. Create new web service
3. Set environment variables
4. Deploy!

### Frontend (Vercel, Netlify)

```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Database (MongoDB Atlas)

1. Create a free cluster at mongodb.com/atlas
2. Get connection string
3. Update MONGODB_URI in your backend .env

### Chrome Extension

1. Create extension icons (16x16, 48x48, 128x128)
2. Package extension as .zip
3. Submit to Chrome Web Store

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or building your own!

## 🙏 Acknowledgments

- **Anthropic** - Claude AI for intelligent content processing
- **OpenAI** - Text embeddings for semantic search
- **Tesseract.js** - OCR capabilities
- **MongoDB** - Flexible document storage
- **React** - Amazing UI library
- **TailwindCSS** - Beautiful styling system

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/project-synapse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/project-synapse/discussions)

## 🗺️ Roadmap

- [ ] Mobile apps (React Native)
- [ ] Shared collections
- [ ] Public profile pages
- [ ] API webhooks (Zapier, IFTTT)
- [ ] Browser bookmarklet
- [ ] Email forwarding
- [ ] Slack/Discord integration
- [ ] Export to Notion, Obsidian
- [ ] Offline mode with sync
- [ ] Dark/light theme toggle

---

**Built with 🧠 and ❤️**

Start building your second brain today!
