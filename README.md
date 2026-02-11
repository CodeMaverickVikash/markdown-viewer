# 📚 Markdown Viewer

A **pure static** interactive markdown documentation viewer with **zero npm dependencies**. All libraries are downloaded from CDN during build and bundled locally. Perfect for deploying on Vercel, Netlify, or any static hosting platform.

## ✨ Features

- **📁 File Upload**: Drag-and-drop or click to upload markdown (.md) files
- **📚 Dynamic Navigation**: Auto-generates sidebar navigation from markdown headings
- **🔍 Search**: Filter topics in real-time
- **📱 Responsive Design**: Mobile-friendly with collapsible sidebar
- **🎨 Syntax Highlighting**: Code blocks highlighted using highlight.js
- **⚙️ Configurable**: Customizable via `config.js` (site title, sections, welcome screen, etc.)
- **🌐 100% Static**: No server required - pure HTML/CSS/JavaScript
- **📦 Zero npm Dependencies**: All libraries downloaded from CDN during build
- **🚀 One-Command Build**: Single command downloads and bundles everything

## 🚀 Quick Start

### Local Development

```bash
git clone <repository-url>
cd markdown-viewer
npm run build    # Downloads dependencies from CDN and builds
npm run dev      # Preview the site
```

Then open http://localhost:3000 in your browser.

**Note**: No `npm install` needed! The build script downloads everything from CDN.

## 🌐 Deploy to Vercel

Deploy your markdown viewer to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/markdown-viewer)

### How It Works

The build process automatically:
1. **Downloads dependencies from CDN**:
   - `marked.js` (v11.2.0) from jsDelivr
   - `highlight.js` (v11.9.0) from cdnjs
   - `github-dark.min.css` theme from cdnjs
2. **Creates static site** - Outputs everything to `public/` directory
3. **Bundles libraries** - All dependencies stored in `public/lib/`
4. **Updates paths** - Ensures all library references are correct

### Manual Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

That's it! No `npm install` needed - the build script downloads everything from CDN automatically.

### Other Static Hosts

You can deploy to any static hosting platform:

- **Netlify**: Connect your repo, build command: `npm run build`, publish directory: `public`
- **GitHub Pages**: Build locally and push the `public/` folder
- **Cloudflare Pages**: Same as Netlify configuration
- **Any static host**: Just upload the contents of `public/` after running `npm run build`

## 📖 Usage

### Building the Static Site

```bash
npm run build
```

This single command:
1. Downloads `marked.js`, `highlight.js`, and CSS theme from CDN
2. Copies all HTML, CSS, and JavaScript files to `public/`
3. Bundles all libraries into `public/lib/`
4. Updates all paths to reference local libraries
5. Creates a production-ready static site

**No npm dependencies required!** Everything is downloaded from CDN during build.

### Local Preview

After building, preview the site locally:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Using the Viewer

1. **Upload Files**: Click the "Upload Files" button or drag and drop `.md` files onto the upload area
2. **Navigate**: Use the sidebar to browse through your documentation sections
3. **Search**: Use the search box to filter topics
4. **Mobile**: Click the hamburger menu (☰) to toggle the sidebar on mobile devices

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
├── scripts/
│   └── build.js        # Build script (downloads from CDN & creates static site)
├── lib/                # Downloaded libraries (created during build)
│   ├── marked.min.js   # Downloaded from jsDelivr
│   ├── highlight.min.js # Downloaded from cdnjs
│   └── github-dark.min.css # Downloaded from cdnjs
├── docs/
│   └── example.md      # Example documentation
├── public/             # Build output (created by npm run build)
│   ├── index.html      # Main HTML (with updated paths)
│   ├── script.js       # Application logic
│   ├── styles.css      # Styles
│   ├── config.js       # Configuration
│   ├── docs/           # Documentation files
│   └── lib/            # Bundled libraries (copied from lib/)
│       ├── marked.min.js
│       ├── highlight.min.js
│       └── github-dark.min.css
├── config.js           # Configuration file
├── index.html          # Main HTML file (source)
├── script.js           # Application logic (source)
├── styles.css          # Styles (source)
├── vercel.json         # Vercel deployment config
├── package.json        # Build scripts only (no dependencies!)
├── DEPLOYMENT.md       # Deployment guide
└── README.md           # This file
```

## 🛠️ Development

### Prerequisites

- Node.js >= 14.0.0

### Setup

```bash
npm install
```

This will automatically download the highlight.js browser build to the `lib/` directory. The marked.js library is used directly from `node_modules`.

### Running Locally

```bash
npm start
```

## 📦 Dependencies

All dependencies are downloaded from CDN during build:

- **marked** (v11.2.0): Fast markdown parser - from [jsDelivr](https://cdn.jsdelivr.net/npm/marked@11.2.0/marked.min.js)
- **highlight.js** (v11.9.0): Syntax highlighting - from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js)
- **github-dark theme**: Syntax highlighting theme - from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css)

**Zero npm dependencies!** All libraries are downloaded during build and bundled into the static site. No runtime CDN dependencies!

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

