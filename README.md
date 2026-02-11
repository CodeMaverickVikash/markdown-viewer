# 📚 Markdown Viewer

A **pure static** interactive markdown documentation viewer with **zero npm dependencies**. All libraries are loaded from CDN. Perfect for deploying on Vercel, Netlify, or any static hosting platform.

## ✨ Features

- **📁 File Upload**: Drag-and-drop or click to upload markdown (.md) files
- **💾 LocalStorage Persistence**: Uploaded files are saved in browser localStorage
- **📚 Dynamic Navigation**: Auto-generates sidebar navigation from markdown headings
- **🔍 Search**: Filter topics in real-time
- **📱 Responsive Design**: Mobile-friendly with collapsible sidebar
- **🎨 Syntax Highlighting**: Code blocks highlighted using highlight.js
- **⚙️ Configurable**: Customizable via `config.js` (site title, sections, welcome screen, etc.)
- **🌐 100% Static**: No server required - pure HTML/CSS/JavaScript
- **📦 Zero npm Dependencies**: All libraries loaded from CDN
- **🚀 Zero Build Process**: No build step required - deploy directly

## 🚀 Quick Start

### Local Development

```bash
git clone <repository-url>
cd markdown-viewer
npm run serve    # Start local server
```

Then open http://localhost:3000 in your browser.

**Note**: No `npm install` or build step needed! Just open `index.html` in your browser or use any static server.

## 🌐 Deploy to Vercel

Deploy your markdown viewer to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/markdown-viewer)

### How It Works

This is a pure static site with **zero build process**:
1. **All dependencies loaded from CDN**:
   - `marked.js` (v17.0.1) from jsDelivr
   - `highlight.js` (v11.11.1) from cdnjs
   - `github-dark.min.css` theme from cdnjs
2. **No build step required** - Deploy directly to Vercel
3. **Instant deployment** - Just push to Git and Vercel deploys automatically

### Manual Deployment

1. **Install Vercel CLI** (optional):
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

Edit `config.js` to customize your documentation viewer:

```javascript
const DOCS_CONFIG = {
  siteTitle: "📚 Documentation Viewer",
  siteSubtitle: "Interactive Markdown Viewer",
  footerText: "Made with ❤️",
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
  navigationHeadingLevel: 2,
  showFileNameInNav: false,
  syntaxTheme: "github-dark"
};
```

### Configuration Options

- `siteTitle`: Main title displayed in the sidebar header
- `siteSubtitle`: Subtitle displayed below the title
- `footerText`: Text displayed in the sidebar footer
- `footerLinks`: Array of links to display in the footer
- `sections`: Pre-configured documentation sections and files
- `welcome`: Welcome screen configuration
- `navigationHeadingLevel`: Heading level to use for navigation (default: 2 for H2)
- `showFileNameInNav`: Show file names in navigation
- `syntaxTheme`: Syntax highlighting theme

## 📁 Project Structure

```
markdown-viewer/
├── css/
│   └── styles.css      # Custom CSS styles
├── scripts/
│   ├── config.js       # Configuration file
│   └── script.js       # Main application logic
├── docs/
│   └── example.md      # Example documentation
├── index.html          # Main HTML file
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

All dependencies are loaded from CDN at runtime:

- **marked** (v17.0.1): Fast markdown parser - from [jsDelivr](https://cdn.jsdelivr.net/npm/marked@17.0.1/lib/marked.umd.min.js)
- **highlight.js** (v11.11.1): Syntax highlighting - from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js)
- **github-dark theme**: Syntax highlighting theme - from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css)

**Zero npm dependencies!** All libraries are loaded from CDN - no local files, no build process required!

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

