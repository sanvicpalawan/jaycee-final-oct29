# JayCee Trading & Services

Static storefront for a Palawan food distributor, with a 16-tab content editor built into the page.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No dependencies](https://img.shields.io/badge/dependencies-none-1E8E4A?style=flat-square)
![No build](https://img.shields.io/badge/build_step-none-1E8E4A?style=flat-square)

Zero dependencies, no build step. Three files on any static host.

## Features

**Storefront** — editorial hero, product carousel, featured ranges, partner marquee, alternating story rows, flip cards, location with embedded map, FAQ accordion, CTA bands.

**Content editor** — 16 tabs covering every section. Drag-to-reorder lists, color swatches, toggles, JSON export/import, logo upload with canvas optimization and approval gate. Opens with `Ctrl` / `⌘` + `Shift` + `A`.

## Tech stack

| | |
|---|---|
| Markup | HTML5 — 11 sections, 37 ARIA attributes |
| Styling | Hand-authored CSS3 — design tokens, 13 media queries |
| Behavior | Vanilla ES6+ — 92 functions, no framework |
| Storage | `localStorage` + JSON export |
| Hosting | Static — no backend |

Not used: React, Vue, Tailwind, Sass, npm, Webpack, Vite.

## Structure

```
index.html            330 lines   shell, landmarks, render targets
styles/main.css       974 lines   design system and components
scripts/app.js      2,062 lines   interaction, state, render, CMS
```

Content model lives at `scripts/app.js:290`. Text edits save per tab; structural changes apply immediately. Architecture notes in [PROJECT-MAP.md](PROJECT-MAP.md).

## Run

```bash
git clone https://github.com/sanvicpalawan/jaycee-final-oct29.git
cd jaycee-final-oct29
python -m http.server 8000
```

Open http://localhost:8000.

## Author

Built by [@sanvicpalawan](https://github.com/sanvicpalawan). Content and branding © JayCee Trading & Services.
