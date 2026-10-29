# JayCee Trading & Services

**A production static storefront for a Palawan food distributor — with a content editor built into the page.**

A single-file, zero-dependency website for a frozen food and imported meats business serving homes, restaurants, resorts and retailers across Puerto Princesa and the wider Palawan archipelago. It pairs a premium editorial storefront with a 16-tab content manager, so the business can rewrite its own site without a developer, a CMS subscription or a database.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No dependencies](https://img.shields.io/badge/dependencies-none-1E8E4A?style=flat-square)
![No build step](https://img.shields.io/badge/build_step-none-1E8E4A?style=flat-square)
![Accessibility](https://img.shields.io/badge/accessibility-WCAG--oriented-0F1115?style=flat-square)
![Single file](https://img.shields.io/badge/deploy-single_file-B3261E?style=flat-square)

---

## Overview

JayCee Trading & Services is a family-owned distributor shipping imported meats, frozen seafood, dairy and frozen essentials across Palawan since 2017. The website's job is narrow and commercial: establish trust in a brand most customers meet at a warehouse gate, show the range at a glance, and make a wholesale enquiry effortless on a phone with a slow connection.

That brief drove every technical decision. There is no framework, no bundler and no server. The entire site — styles, markup, behavior and content management — is one `index.html` you can drop on any static host.

| | |
|---|---|
| **Type** | Static marketing site + in-page content editor |
| **Client** | JayCee Trading & Services, Puerto Princesa City, Palawan |
| **Scope** | Design system, storefront, CMS, logo pipeline, responsive QA |
| **Source** | 1 file · 3,363 lines · 192 KB |
| **Runtime** | Browser only — no backend, no build, no dependencies |

---

## What it does

### Storefront

- **Editorial hero** — masked line-reveal headline, live "open now" status, scroll-linked parallax, glass spec card
- **Category carousel** — five product ranges with keyboard-accessible scroller and arrow states that disable at the edges
- **Featured ranges** — full-bleed image cards with bullet specs
- **Trusted-by marquee** — partner wall with per-brand color math
- **Three-story section** — alternating reverse rows for home, business and delivery audiences
- **Our Story / 2017** — flip cards that work on hover, tap and keyboard, with dedicated back-face copy
- **Location** — embedded map, address block, travel-time counters, store hours, "open now" indicator
- **FAQ** — accordion with typed answer reveal, six real operational questions
- **Dual CTA bands** and a structured footer with three link columns

### Content editor

- **16 tabs** covering brand, logo, theme, navigation, hero, categories, featured, trusted-by, stories, essentials, story, location, FAQ, mid CTA, final CTA and footer
- **Drag-to-reorder lists** with add, delete and per-item enable/disable
- **Color swatches**, range sliders and toggles for theming and logo sizing
- **Live re-render** on every change, auto-saved to the browser
- **JSON export / import** for backup and handoff
- **Logo pipeline**: upload → canvas downscale → pixel inspection → three live previews → explicit approval gate

Opened with the floating button or `Ctrl` / `⌘` + `Shift` + `A`.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Markup | HTML5 | Semantic landmarks, 11 sections, 53 ARIA attributes |
| Styling | Hand-authored CSS3 | 703 rules on a full design-token system — no framework, no preprocessor |
| Layout | CSS Grid + Flexbox | 13 media queries at 420 / 600 / 768 / 900 / 1024 px |
| Behavior | Vanilla JavaScript (ES6+) | 92 functions across two strict-mode IIFEs; no modules, no transpiler |
| Type | Google Fonts | Inter and Inter Tight, fluid `clamp()` scale (11 steps) |
| Imagery | Unsplash + CSS fallbacks | Every image carries a hex fallback color |
| Maps | Google Maps embed | Zero-config iframe plus deep-link |
| Persistence | `localStorage` | Plus `Blob` / `FileReader` for JSON round-trips |
| Media | Canvas 2D | Client-side resize and pixel analysis for uploaded logos |

**Deliberately not used:** React, Vue, Svelte, jQuery, Tailwind, Sass, npm, Webpack, Vite.

### Language composition

Measured by bytes of the actual source:

```
JavaScript  ████████████████████████████████████████░░░░░░  57.2%   2,055 lines
CSS         █████████████████████████░░░░░░░░░░░░░░░░░░░░░  34.7%     973 lines
HTML        ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   8.0%     313 lines
```

Two notes for anyone reading the numbers closely. The JavaScript share is inflated by a 15.7 KB content model — plain data describing every headline, image and Q&A, not logic. And because the whole project is a single `.html` file, GitHub's linguist classifies it as 100% HTML; the split above counts the three code regions inside that file instead.

---

## Project structure

```
jaycee-final-oct29/
├── index.html          # The entire application — styles, markup, storefront, editor
├── README.md           # This document
└── PROJECT-MAP.md      # Detailed annotated code tree and architecture notes
```

Inside `index.html`, in order:

```
1,588–1,793   Content model     Every string, image and price the site renders
1,826–2,232   Render layer      16 render* functions, state → DOM
2,350–3,338   Editor            16 tabs, field factories, logo pipeline
1,301–1,562   Interaction       Nav, carousel, accordion, reveal, parallax
   12–985     Design system     Tokens, components, responsive, editor chrome
```

`PROJECT-MAP.md` breaks this down line by line, including the state-to-render loop and the trade-offs behind the single-file approach.

---

## Running locally

No install. No build. No environment variables.

```bash
git clone https://github.com/sanvicpalawan/jaycee-final-oct29.git
cd jaycee-final-oct29
python -m http.server 8000
```

Open <http://localhost:8000>.

Any static host works unchanged — GitHub Pages, Netlify, Cloudflare Pages, S3, or a folder on shared hosting. Deploying is copying one file.

---

## How the editor works

There is no backend, so content lives in the browser:

```
DEFAULT (content model)  →  localStorage  →  renderAll()  →  DOM
                                  ↑                │
                            editor forms  ←  buildPanel()
```

Every edit saves to `localStorage` under `jaycee_site_state_v2` and re-renders the page. Because listeners are destroyed on each render, interaction wiring is isolated in separate `wire*()` helpers that re-bind afterward.

**Editing workflow.** Change content in the editor, hit **Export JSON**, and use that file as the source of truth for the next build — or import it back to restore a previous state at any time. To publish globally, the JSON is folded into the `DEFAULT` object at `index.html:1,588`, which is what every visitor receives.

**Scope, stated plainly.** Edits are per-browser until they reach the `DEFAULT` object. That is a deliberate trade-off for a business with no servers to maintain, not an oversight — and it is why export is one click away.

---

## Engineering notes

**Design system, not styling.** Color, spacing, radii, elevation and an 11-step fluid type scale all live in custom properties at the top of the file. Section rhythm is a single variable: `--section-y: clamp(80px, 10vw, 144px)`. Components consume tokens, so a rebrand is a handful of lines.

**Accessibility.** 53 ARIA attributes with `aria-expanded` and `aria-pressed` maintained by JavaScript, labeled landmarks and sections, an `aria-live` toast region, focus-visible styling throughout, `Escape` closes every overlay, flip cards respond to `Enter` / `Space` / `Escape`, and the carousel supports keyboard scrolling with honest disabled states.

**Motion, respectfully.** A full `prefers-reduced-motion` path disables parallax and smooth scrolling and swaps animation for instant state changes. Scroll work is `requestAnimationFrame`-throttled on passive listeners, and entrance reveals use `IntersectionObserver`.

**Logo QA.** The most involved feature in the project. Uploads are capped at 8 MB, SVGs are base64-inlined, rasters above 1,600 px are downscaled on a canvas at quality 0.9, and pixel sampling detects transparent backgrounds, solid white boxes and low-contrast artwork on white. A logo flagged as unsuitable cannot be published without review, and nothing goes live until "Approve & publish" is pressed.

**Performance by subtraction.** One file, no framework runtime, six lazy-loaded images and CSS fallbacks behind every remote asset. The largest remaining cost is a third-party script that is no longer needed (see roadmap).

---

## Roadmap

Known limitations, stated honestly:

- [ ] Remove the unused Tailwind CDN script — currently a blocking request generating utilities nothing uses
- [ ] Add Open Graph / Twitter cards and JSON-LD `LocalBusiness` + `FAQPage` structured data
- [ ] Self-host and responsively serve product imagery instead of hot-linking Unsplash
- [ ] Split CSS and JavaScript into `styles/` and `scripts/` for cache granularity
- [ ] Add a "Download updated site" action to close the loop between editor and deployment
- [ ] Click-to-load the map iframe to cut initial payload

---

## Author

Designed and built by [@sanvicpalawan](https://github.com/sanvicpalawan) — information architecture, design system, front-end implementation, content editor, logo pipeline, responsive and accessibility work.

Content, branding and product copy belong to JayCee Trading & Services.

## Copyright

© JayCee Trading & Services. All rights reserved.
