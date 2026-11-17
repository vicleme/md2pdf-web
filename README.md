# MD2PDF

**English** | [Português (Brasil)](README.pt-BR.md)

Convert Markdown (`.md`) files to PDF right in your browser. Private, fast and free of uploads: your documents never leave your computer.

[![CI](https://github.com/vicleme/md2pdf-web/actions/workflows/ci.yml/badge.svg)](https://github.com/vicleme/md2pdf-web/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- Open a `.md` file (button or drag and drop) or just type/paste Markdown
- Live preview that matches the PDF
- GitHub Flavored Markdown: tables, task lists, strikethrough, code blocks
- Optional YAML front matter is ignored
- PDF options: page size (A4, Letter, Legal), orientation, margins, font size and style (clean or academic)
- Two export modes:
  - **Download PDF**: generates the file directly (text is rasterized as an image)
  - **Print / Save as PDF**: uses the browser print dialog (selectable text, smaller files)
- English and Brazilian Portuguese interface, auto-detected and remembered
- Light and dark interface, responsive layout
- 100% client side. No server, no tracking, no uploads
- HTML from the Markdown is sanitized (DOMPurify) before it reaches the page or the PDF

## Quick start

Requirements: [Node.js](https://nodejs.org/) 18 or newer.

```bash
git clone https://github.com/vicleme/md2pdf-web.git
cd md2pdf-web
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

### Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Starts the dev server with hot reload |
| `npm run build`   | Creates the production build in `dist/` |
| `npm run preview` | Serves the production build locally   |
| `npm test`        | Runs the unit tests (Node test runner) |

## Project structure

```text
md2pdf-web/
├── index.html              # Page markup
├── public/favicon.svg
├── src/
│   ├── main.js             # Entry point
│   ├── ui/
│   │   └── app.js          # DOM wiring (events, state, rendering)
│   ├── modules/            # Pure, testable logic
│   │   ├── markdown.js     # Markdown -> HTML (marked) + front matter
│   │   ├── sanitize.js     # HTML sanitizing (DOMPurify)
│   │   ├── options.js      # PDF options, validation and html2pdf config
│   │   ├── pdf.js          # HTML -> PDF export (html2pdf.js, lazy loaded)
│   │   ├── files.js        # File checks, PDF naming, title extraction
│   │   ├── i18n.js         # en / pt-BR messages and locale detection
│   │   ├── storage.js      # Safe localStorage wrapper
│   │   └── utils.js        # debounce, countWords
│   ├── samples/            # Example documents (en, pt-BR)
│   └── styles/
│       ├── main.css        # App interface
│       └── document.css    # Rendered document (preview and PDF)
├── tests/                  # node --test
└── .github/workflows/      # CI and GitHub Pages deploy
```

## Deploying to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.

The build uses relative paths, so it also works on Netlify, Vercel, Cloudflare Pages or any static host.

## Good to know

- **Download PDF** captures the rendered page as images, which is why text is not selectable and files can be larger. For selectable text, use **Print / Save as PDF** and choose "Save as PDF" as the destination.
- Remote images in the Markdown need to allow cross-origin requests (CORS) to appear in the downloaded PDF.
- Very long documents can take a few seconds to generate.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Released under the [MIT License](LICENSE).
