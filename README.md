# Portfolio — Modern Redesign

A modern, dark-themed portfolio website built with vanilla HTML, CSS, and JavaScript. All content is driven by a single `resumeData.json` file for easy updates.

## ✨ Features

- **Dark theme** with glassmorphism, gradient accents, and subtle glow effects
- **Scroll reveal animations** powered by `IntersectionObserver`
- **Vertical timeline** for work experience
- **Responsive design** — mobile-first with a collapsible nav
- **Single data source** — edit `resumeData.json` and the site updates automatically
- **Credly badge integration** for professional certifications
- **Zero dependencies** — no build tools, no frameworks, no npm

## 📁 Project Structure

```
resume/
├── css/
│   └── style.css          # All styles — design system, components, responsive
├── img/
│   ├── giskard.png        # Local tool logos
│   └── ocrolus.png
├── js/
│   └── script.js          # Data loading, DOM rendering, animations
├── index.html             # Semantic HTML shell
├── resumeData.json        # All portfolio content (edit this!)
├── resume.txt             # Plain-text resume
└── README.md
```

## 🛠 How to Update

1. **Edit `resumeData.json`** — all personal info, experience, skills, tools, etc. live here.
2. **Add local images** — drop logos into `img/` and reference them in the JSON.
3. **Customize colors** — edit the CSS custom properties in `:root` at the top of `css/style.css`.

## 🚀 Running Locally

No build step needed. Just serve the files:

```bash
python3 -m http.server 8888
# or
npx serve .
```

Then open [http://localhost:8888](http://localhost:8888).

## 📦 Deploying to GitHub Pages

1. Push to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set source to the branch and root directory.
4. Your site will be live at `https://<username>.github.io/<repo>`.

## License

MIT
