# 📚 Markdown Viewer

A modern **React-based** interactive markdown documentation viewer with **edit mode** and **export functionality**. Built with React, Vite, and deployed as a static site.

## ✨ Features

- **📁 File Upload**: Drag-and-drop or click to upload markdown (.md) files
- **💾 LocalStorage Persistence**: Uploaded files are saved in browser localStorage
- **✏️ Edit Mode**: Edit markdown files directly in the browser
- **📥 Export**: Download edited files as .md
- **📚 Dynamic Navigation**: Auto-generates sidebar navigation from markdown headings
- **🔍 Search**: Filter files in real-time
- **📱 Responsive Design**: Mobile-friendly with collapsible sidebar
- **🎨 Syntax Highlighting**: Code blocks highlighted using highlight.js
- **⚡ Fast**: Built with Vite for lightning-fast development and optimized production builds
- **🌐 100% Static**: Deploys as static files - no server required

## 🚀 Quick Start

### Local Development

```bash
git clone <repository-url>
cd markdown-viewer
npm install      # Install dependencies
npm run dev      # Start development server
```

Then open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌐 Deploy to Vercel

Deploy your markdown viewer to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/markdown-viewer)

### How It Works

1. **Vite builds the React app** to static files in the `dist/` folder
2. **Vercel serves the static files** with optimized caching
3. **All routes redirect to index.html** for client-side routing

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

That's it! No build process needed - Vercel serves the static files directly.

### Other Static Hosts

You can deploy to any static hosting platform:

- **Netlify**: Connect your repo, no build command needed, publish directory: `.` (root)
- **GitHub Pages**: Just push to `gh-pages` branch
- **Cloudflare Pages**: Connect repo, no build command needed
- **Any static host**: Just upload all files (no build required)

## 📖 Usage

### Local Preview

Preview the site locally:

```bash
npm run serve
```

Or simply open `index.html` in your browser - no server required!

Then open http://localhost:3000 in your browser.

### Using the Viewer

1. **Upload Files**: Click the "📤 Choose Markdown Files" button or drag and drop `.md` files onto the upload area
2. **Navigate**: Use the sidebar to browse through your uploaded files and sections
3. **Search**: Use the search box to filter topics
4. **Remove Files**: Click the red ✕ button next to any uploaded file to remove it
5. **Mobile**: Click the hamburger menu (☰) to toggle the sidebar on mobile devices

**Note**: Uploaded files are saved in your browser's localStorage and will persist across sessions.

## ⚙️ Configuration

Edit the `DOCS_CONFIG` object in `index.html` (inside the `<script>` tag) to customize your documentation viewer:

```javascript
const DOCS_CONFIG = {
  siteTitle: "📚 Documentation Viewer",
  siteSubtitle: "Interactive Markdown Viewer",
  footerText: "© 2026 CodeMaravic. All rights reserved.",
  footerLinks: [
    { text: "GitHub", url: "https://github.com/..." }
  ],
  sections: [
    {
      id: "getting-started",
      name: "Getting Started",
      files: [
        { id: "intro", name: "Introduction", file: "docs/intro.md" }
      ]
    }
  ],
  welcome: {
    title: "🚀 Welcome to Documentation Viewer",
    subtitle: "Upload your markdown files to get started",
    quickLinks: [],
    stats: []
  },
  showFileNameInNav: false,
  syntaxTheme: "github-dark"
};
```

### Configuration Options

- `siteTitle`: Main title displayed in the sidebar header
- `siteSubtitle`: Subtitle displayed below the title
- `footerText`: Text displayed in the sidebar footer
- `footerLinks`: Array of links to display in the footer
- `sections`: Pre-configured documentation sections and files (optional - can upload files directly)
- `welcome`: Welcome screen configuration
- `showFileNameInNav`: Show file names in navigation
- `syntaxTheme`: Syntax highlighting theme

## 📁 Project Structure

```
markdown-viewer/
├── css/
│   └── styles.css      # Custom CSS styles
├── libs/
│   ├── marked.min.js   # Local markdown parser
│   └── highlight.js/   # Local syntax highlighting
├── scripts/
│   └── script.js       # Main application logic
├── docs/
│   └── example.md      # Example documentation
├── index.html          # Main HTML file (includes config)
├── vercel.json         # Vercel deployment config
├── package.json        # Scripts only (no dependencies!)
└── README.md           # This file
```

**Note**: All JavaScript libraries (marked.js, highlight.js) are loaded from CDN - no local copies needed!

## 🛠️ Development

### Prerequisites

- Node.js >= 14.0.0 (only for local development server)
- Or any static file server
- Or just open `index.html` in your browser!

### Setup

No setup required! Just clone and run:

```bash
git clone <repository-url>
cd markdown-viewer
npm run serve    # Or open index.html directly
```

## 📦 Dependencies

All dependencies are loaded locally with fallback to CDN:

- **marked** (v17.0.1): Fast markdown parser - from [jsDelivr](https://cdn.jsdelivr.net/npm/marked@17.0.1/lib/marked.umd.min.js)
- **highlight.js** (v11.11.1): Syntax highlighting - from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js)
- **github-dark theme**: Syntax highlighting theme - from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css)

**Zero npm dependencies!** All libraries are included locally - works fully offline, no build process required!

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

