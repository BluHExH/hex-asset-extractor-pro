# HEX Asset Extractor Pro

![HTML5](https://img.shields.io/badge/HTML5-Modern-orange?style=for-the-badge&logo=html5)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Responsive-38B2AC?style=for-the-badge&logo=tailwind-css)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)

**HEX Asset Extractor Pro** is a professional, responsive, browser-based web application for analyzing HTML files and extracting embedded and external asset references. It is designed as a commercial-grade SaaS-style dashboard that runs entirely on the client side, making it ideal for portfolio showcases, static hosting, GitHub Pages, Netlify, and Vercel deployments.

The app supports drag-and-drop HTML uploads, Base64 asset extraction, external asset detection, image previews, duplicate analysis, ZIP export, file size statistics, and professional scan reporting.

---

## ✨ Features

### HTML File Upload

- Drag-and-drop upload workflow
- Native file picker support
- Large HTML file support using browser-native file reading
- File type validation for `.html` and `.htm`
- Client-side processing for safer file handling

### Base64 Asset Extraction

- JPEG image extraction
- PNG image extraction
- GIF image extraction
- SVG image extraction
- WebP image extraction
- Base64 audio extraction
- Base64 video extraction
- Correct file extension preservation during ZIP export

### External Asset Detection

- External image URLs
- External CSS files
- External JavaScript files
- External fonts
- Audio, video, poster, source, embed, object, iframe, srcset, and CSS `url(...)` references

### Asset Dashboard

- Total assets found
- Image count
- Audio count
- Video count
- CSS count
- JavaScript count
- External URL count
- Duplicate count
- File size and embedded asset statistics

### Asset Preview System

- Responsive image gallery
- Asset detail modal
- File type indicators
- Size indicators
- Duplicate indicators
- External reference display

### ZIP Export

- Download extracted images as ZIP
- Download all assets as ZIP
- Embedded Base64 assets are exported as real files
- External assets are exported as URL reference files for safe browser-only operation
- Manifest file included in each ZIP

### Duplicate Detection

- SHA-256 based duplicate detection
- Duplicate statistics panel
- Duplicate rate calculation
- Duplicate asset indicators

### Scan Report

- Professional report panel
- Asset breakdown
- Scan summary
- Extraction results
- Print-friendly layout

### Premium User Interface

- Clean SaaS-style dashboard
- Glassmorphism cards
- Smooth UI interactions
- Professional typography
- Mobile-first responsive design
- Tablet and desktop optimized layouts
- Loading, success, error, and empty states

---

## 📸 Screenshots

> Add your screenshots after deployment or local testing.

| Dashboard | Asset Gallery | Scan Report |
|---|---|---|
| `screenshots/dashboard.png` | `screenshots/gallery.png` | `screenshots/report.png` |

---

## 🚀 Installation Guide

Clone the repository:

```bash
git clone https://github.com/BluHExH/hex-asset-extractor-pro.git
cd hex-asset-extractor-pro
```

Because this is a static web application, no build step is required. You can open `index.html` directly, or run a local static server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

---

## 🧭 Usage Guide

1. Open the application in a modern browser.
2. Drag and drop an `.html` or `.htm` file into the upload area, or click **Choose HTML file**.
3. Wait for the scan to complete.
4. Review dashboard metrics, duplicate statistics, file size statistics, and gallery previews.
5. Use search and filters to locate specific assets.
6. Click any asset card to view detailed information.
7. Download embedded images or all detected assets as ZIP.
8. Print the professional scan report if needed.

You can also click **Load sample HTML** to test the interface instantly.

---

## 🛠 Technology Stack

- **HTML5** for semantic application structure
- **Tailwind CSS CDN** for utility-first responsive styling
- **Custom CSS** for glassmorphism, animations, print styling, and product polish
- **JavaScript ES6 Modules** for modular architecture
- **DOMParser API** for HTML analysis
- **Web Crypto API** for SHA-256 duplicate detection
- **JSZip** for client-side ZIP generation
- **Browser File API** for secure local file reading

---

## 📁 Folder Structure

```text
hex-asset-extractor-pro/
├── index.html
├── README.md
├── LICENSE
├── .gitignore
├── docs/
│   └── DEPLOYMENT.md
├── screenshots/
│   └── .gitkeep
└── src/
    ├── assets/
    │   └── .gitkeep
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js
        ├── exporter.js
        ├── extractor.js
        ├── sample.js
        ├── ui.js
        └── utils.js
```

---

## 🔐 Security Notes

HEX Asset Extractor Pro processes uploaded files locally in the browser. It does not upload HTML files to a server. External assets are not automatically downloaded into ZIP files because browser security restrictions and cross-origin policies may apply. Instead, external references are safely exported as URL text files.

---

## 🗺 Future Roadmap

- Optional dark mode theme
- Export scan report as PDF
- Advanced asset table view
- MIME validation from decoded binary headers
- Batch HTML scanning
- Offline PWA support
- Custom filename templates
- Local scan history
- Accessibility audit mode

---

## 🤝 Contribution Guide

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes with clear, readable code.
4. Test the application in multiple viewport sizes.
5. Submit a pull request with a concise description.

Please keep the design professional, clean, and aligned with the SaaS-style product direction.

---

## 📄 License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for details.

---

## 👤 Author

Created for professional portfolio and GitHub showcase use.

If you use this project, consider starring the repository and customizing the author section with your name, portfolio, and social links.
