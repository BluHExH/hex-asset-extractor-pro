# Deployment Guide

HEX Asset Extractor Pro is a static web application. It can be deployed without a backend or build process.

---

## GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Click **Save**.
7. GitHub will publish the site at:

```text
https://your-username.github.io/hex-asset-extractor-pro/
```

If the project is inside a subfolder, move `index.html`, `src/`, and `docs/` to the repository root before deploying.

---

## Netlify

### Option 1: Drag and Drop

1. Go to [Netlify](https://www.netlify.com/).
2. Open **Sites**.
3. Drag the `hex-asset-extractor-pro` folder into the deploy area.
4. Netlify will publish the static site automatically.

### Option 2: Git Deployment

1. Push the project to GitHub.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Connect your repository.
4. Use these settings:

```text
Build command: Leave empty
Publish directory: /
```

5. Deploy the site.

---

## Vercel

1. Push the project to GitHub.
2. Go to [Vercel](https://vercel.com/).
3. Click **Add New → Project**.
4. Import your GitHub repository.
5. Use these settings:

```text
Framework Preset: Other
Build Command: Leave empty
Output Directory: .
Install Command: Leave empty
```

6. Click **Deploy**.

---

## Local Preview

Run a simple static server from the project root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

---

## Production Notes

- Keep `index.html` at the deployment root.
- Keep the `src/` directory path unchanged unless you update references in `index.html`.
- The app uses CDN-hosted Tailwind CSS, Google Fonts, and JSZip.
- For fully offline operation, vendor those dependencies locally and update the script and stylesheet references.
