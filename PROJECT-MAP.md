# JayCee Trading & Services — Tech Stack & Code Tree

> Generated from a full read of the repository at commit `212340b`.
> Everything below was verified against the actual source, not the README's description.
> Line references point at `index.html` in the repository root.

---

## 1. At a glance

The product is **three files**:

```
jaycee-final-oct29/
├── index.html              # document shell, landmarks, render targets  330 lines
├── styles/main.css         # design system and all component CSS        974 lines
├── scripts/app.js          # interaction, state, render layer, CMS     2,062 lines
├── README.md               # project profile
└── PROJECT-MAP.md          # this document
```

There is no `src/`, no `assets/`, no package manager, no build system, and no test suite. The project was originally distributed as a `premium-jaycee-website-rebuild.zip` archive containing a single `index.html` with inline `<style>` and `<script>` blocks; CSS and JS were later extracted into `styles/` and `scripts/` so that GitHub attributes the real language mix and browsers can cache each file independently. No application logic was changed during that split.

The whole product is a **single self-contained HTML document**: 3,363 lines, split into ~974 lines of inline CSS, ~1,090 lines of static markup, and ~2,060 lines of vanilla JS across two inline `<script>` blocks.

---

## 2. Tech stack (as actually used)

| Layer | Technology | Where | Notes |
|---|---|---|---|
| Markup | HTML5 | `index.html` body | Semantic landmarks (`header`, `nav`, `main`, 11 `section`, `footer`), 37 ARIA attributes |
| Styling | Hand-written CSS3 | `<style>`, lines 12–985 | Custom design-token system (CSS custom properties). No preprocessor, no framework classes |
| Layout | CSS Grid + Flexbox | throughout | 13 media queries at 420 / 600 / 768 / 900 / 1024 px breakpoints |
| Behavior | JavaScript (ES6+, vanilla) | 2 inline `<script>` blocks | IIFE-scoped, `'use strict'`, no modules, no transpilation |
| UI framework | **None** | — | No React/Vue/Alpine. DOM is rendered by string templates + `innerHTML` |
| CSS framework | Tailwind CSS v4 (**loaded but effectively unused**) | line 11, jsDelivr CDN | Only 2 incidental class-name matches across 218 `class=` attributes; none are Tailwind utilities |
| Fonts | Google Fonts — Inter, Inter Tight, Instrument Serif | line 10 | Loaded via `<link>` with `preconnect`; serif is in the token set but display type resolves to Inter Tight |
| Images | 16 unique Unsplash URLs (18 references) | embedded in state | **Hot-linked**, not bundled. Each has a hex color fallback via `onerror` |
| Maps | Google Maps embed `<iframe>` + `maps.app.goo.gl` deep link | `location` section | No API key |
| Persistence | `localStorage` | key `jaycee_site_state_v2` | Plus JSON export/import via `Blob` + `FileReader` |
| Media processing | Canvas 2D + `FileReader` | logo manager | Client-side resize to 1600 px max, alpha/white-bg/contrast pixel analysis, SVG→base64 |
| Hosting model | Static file | — | `python -m http.server` is enough |

**Language composition:** ~33% CSS, ~28% markup, ~39% JavaScript — all in one file.

Not present: dependency manifests, locks, CI, linters, tests, analytics, service worker, structured data (JSON-LD), Open Graph/Twitter meta, `robots.txt`, `sitemap.xml`, favicon file.

---

## 3. Code tree — annotated

### `index.html` — 330 lines

```
├── <head> .............................................. 1–11
│   ├── meta charset / viewport / title / description
│   ├── Google Fonts preconnect + stylesheet
│   ├── Tailwind browser CDN (loaded, unused — see findings)
│   └── <link rel="stylesheet" href="styles/main.css"> ... 12
│
├── <body> markup ..................................... 13–327
│   ├── Scroll progress bar
│   ├── <header class="nav">  brand · #navLinks · tel · CTA · burger
│   ├── Mobile menu overlay
│   ├── <main id="top"> — 11 sections
│   │   ├── #hero             Hero + h1 reveal lines
│   │   ├── #products         Category carousel
│   │   ├── #featuredSection  Featured cards
│   │   ├── #wholesale        Trusted-by marquee
│   │   ├── #delivery         Story rows (3)
│   │   ├── (essentials)      Everyday essentials
│   │   ├── #story            Since 2017 + flip cards
│   │   ├── #location         Address, hours, map
│   │   ├── #faq              Custom accordion
│   │   ├── #midCta           Mid-page CTA
│   │   └── #order            Final CTA band
│   ├── <footer>
│   ├── Admin launcher button
│   ├── Admin panel shell (16 tabs)
│   └── Toast live region
│
└── <script src="scripts/app.js" defer> ................ 328
```

The document is a shell: 109 `id` attributes exist almost entirely as render targets that `app.js` fills from its content model.

### `styles/main.css` — 974 lines

```
├── Design tokens ....................................... 3–60
│   ├── Color: --c-bg, --c-ink (+2 tints), --c-accent #B3261E,
│   │   --c-green #1E8E4A, hairlines, image fallback colors
│   ├── Spacing: 8 px scale (--s-1 … --s-18) + fluid --section-y
│   ├── Radii: 10/16/20/24/999 px
│   ├── Shadows: 3 layered elevation levels
│   └── Type: fluid clamp() scale --t-xs … --t-display (11 steps)
├── Base / reset ....................................... 62–120
├── Typography system ................................. 122–174
├── Progress bar + nav ................................ 176–223
├── Hero .............................................. 225–284
├── Flip cards ........................................ 286–299
├── Category carousel ................................. 301–329
├── Featured cards .................................... 331–349
├── Logo marquee ...................................... 351–367
├── Story rows (alternating) .......................... 369–380
├── Essentials ........................................ 382–393
├── Story / 2017 ...................................... 395–416
├── Location .......................................... 418–443
├── FAQ ............................................... 445–467
├── CTA bands + footer ................................ 469–504
├── Scroll reveal ..................................... 506–518
├── RESPONSIVE — 13 media queries ..................... 520–715
│   └── 420 / 600 / 768 / 900 / 1024 px breakpoints
├── prefers-reduced-motion ............................ 717–718
├── Admin / CMS chrome ................................ 720–866
├── Official logo — live site ......................... 868–881
└── Official logo — admin manager ..................... 883–974
```

### `scripts/app.js` — 2,062 lines

Two strict-mode IIFEs in one file. They were two separate `<script>` blocks before the split; scope is unchanged because each IIFE keeps its own bindings.

```
IIFE 1 — SITE BEHAVIOR ................................. 3–265
├── prefers-reduced-motion flag, $ / $$ selectors
├── Footer year injection
├── Hero entrance reveal (double rAF → .is-ready)
├── Nav scroll shadow + scroll progress bar
│   └── rAF-throttled, passive listener
├── Mobile menu (aria-expanded, ESC, outside click, resize)
├── window.__syncBodyOverflow bridge → used by the CMS
├── Smooth anchor scroll with sticky-nav offset
├── Flip cards (touch tap, Enter/Space/Escape, aria-pressed)
├── Category carousel (prev/next, disabled-state math)
├── Parallax, marquee, counters, open/closed status
├── FAQ accordion + typewriter answer reveal
├── Scroll reveal via IntersectionObserver
└── Image error handler → reveal CSS fallback color

IIFE 2 — STATE, RENDER + CMS ......................... 270–2062
├── Content model (DEFAULT) .......................... 270–526
│   └── brand · logo · nav · hero · categories · featured ·
│       trusted · goodfood · essentials · story · location ·
│       faq · midCta · finalCta · footer · social
├── RENDER FUNCTIONS ................................. 527–933
│   ├── setText / setAttr / setImg helpers
│   ├── Logo plumbing (brandInner, applyLogoVars, applyFavicon)
│   ├── renderNav, renderHero, renderCategories, renderFeatured
│   ├── renderTrusted, renderRows, renderEssentials, renderStory
│   ├── renderLocation, renderFAQ, renderMidCta, renderFinal
│   ├── renderFooter
│   └── shade() — hex color math for partner logos
├── RE-INIT helpers .................................. 934–1050
│   └── wireFlips / wireParallax / wireReveal / initCounters /
│       updateOpenStatus / updateCarouselArrows / wireFAQ /
│       renderAll orchestrator
├── ADMIN PANEL ..................................... 1051–1105
│   └── open/close, body scroll lock, reset, export JSON, import JSON
├── Build panel UI .................................. 1106–1298
│   ├── TABS[16] definition
│   └── field factories: field/input/textarea/htmlInput/
│       uploadField/colorSwatch/sectionHeader/listEditor
│       (listEditor = drag-reorder, enable/disable, delete)
├── TAB RENDERERS ×16 ............................... 1299–1716
├── LOGO MANAGER TAB ................................ 1717–2041
│   └── upload → canvas optimise → pixel checks → previews → approve
└── Initial render .................................. 2042–2062
    ├── document.fonts.ready → renderAll()
    ├── readyState fallback
    └── Ctrl/⌘+Shift+A opens the editor
```

## 4. Runtime architecture

There is no backend. The architecture is a one-way **state → render** loop:

```
                 ┌─────────────────────────────────────────┐
                 │  DEFAULT (hard-coded content model)      │
                 │  ~206 lines of nested JS objects         │
                 └───────────────┬─────────────────────────┘
                                 │ clone() + Object.assign deep merge
                 ┌───────────────▼─────────────────────────┐
                 │  state  ← localStorage['jaycee_site_state_v2']
                 └───────────────┬─────────────────────────┘
                                 │
        ┌────────────────────────┴────────────────────────┐
        │                                                 │
┌───────▼─────────┐                              ┌────────▼────────┐
│  renderAll()    │                              │  buildPanel()   │
│  ~16 render*()  │                              │  16 tab forms   │
│  set innerHTML  │                              │  inputs bound   │
└───────┬─────────┘                              └────────┬────────┘
        │                                                 │
┌───────▼─────────┐                              ┌────────▼────────┐
│  wire*()        │  re-bind after DOM replace   │  on input →     │
│  observers,     │◄─────────────────────────────┤  bind()         │
│  listeners      │                              │  save+renderAll │
└─────────────────┘                              └─────────────────┘
```

Key consequences of this design:

- **Saving re-renders the whole page.** Each text tab ends in a `Save changes` button that runs `bind()` → `saveState()` + `renderAll()`; structural actions (reorder, add, delete, logo approval) commit immediately. Text edits are intentionally save-gated so the page does not thrash on every keystroke. Because `renderAll()` replaces DOM nodes, all event wiring lives in separate `wire*()` helpers that re-bind afterwards.
- **Content lives in the visitor's browser, not on a server.** An edit made in the CMS is visible only in that browser profile. It does not reach other visitors, because `index.html` is a static file. The documented workflow for that is Export JSON → hand-edit the `DEFAULT` object / re-import.
- **Markup is duplicated conceptually**: `DEFAULT` holds the copy, and the static HTML holds empty shells with matching `id`s (`#heroLine1`, `#footerCopy`, `#catCarousel`, …). 109 `id` attributes exist largely to serve as render targets.
- **Images are remote.** 16 Unsplash URLs + a Google Maps iframe are the only network calls after the initial page load, apart from fonts and the Tailwind CDN script.

### The CSS technique worth knowing

Layout is driven by a token layer, not by utility classes. Fluid type and spacing use single-line `clamp()` definitions, so the 13 media queries mostly handle **component restructuring** (carousel → stack, nav → burger), not font sizing. Section rhythm is one variable: `--section-y: clamp(80px, 10vw, 144px)`.

---

## 5. The admin CMS in detail

| Aspect | Implementation |
|---|---|
| Entry points | Floating button bottom-right (hidden-ish on mobile), or `Ctrl/⌘ + Shift + A` |
| Auth | **None.** Explicit comment: "opens editor directly — no login" |
| Form | Full-screen drawer (`z-index: 2001`), 16 tabs, `role="tablist"` |
| Tabs | Brand & Contact, Logo, Theme, Navigation, Hero, Categories, Featured, Trusted By, Three Stories, Essentials, Our Story, Location, FAQ, Mid CTA, Final CTA, Footer |
| Editing | Text/textarea/HTML inputs, URL fields, file uploads, 6-swatch color pickers, range sliders (logo sizing), toggle switches |
| List editing | `listEditor()` — HTML5 drag-reorder, add, delete, per-item enable/disable, collapsible item bodies |
| Save | Per-tab `Save changes` commits to `localStorage`; quota failure shows an error toast pushing the user to export |
| Portability | Export JSON (dated `jaycee-site-YYYY-MM-DD.json`), Import JSON, Reset to defaults |
| Logo pipeline | Accepts SVG/PNG/WebP/AVIF/GIF/JPEG ≤ 8 MB → SVG inboxed as base64, rasters >1600 px downscaled via canvas at q=0.9 → pixel sampling for transparency / white-background box / light-artwork detection → 3 live previews (header, footer, hero) → explicit "Approve & publish" gate before the logo goes live |

The logo manager is the most substantial single feature in the codebase (~320 lines) and is genuinely well-built: it refuses to publish a logo it has flagged as a solid white box or low-contrast-on-white, and it clamps file size with a clear message rather than failing silently.

---

## 6. Findings & risks

Ordered by what I'd fix first.

1. **Tailwind is dead weight.** `@tailwindcss/browser@4` is a ~400 KB blocking CDN script that scans the DOM at runtime and generates utilities — but the page uses **zero** Tailwind classes. It costs startup time on mobile connections for nothing. Removing line 11 is a free win. (Note: the "browser" build is explicitly not recommended for production by Tailwind's own docs.)
2. **No SEO surface.** No Open Graph or Twitter card tags, no JSON-LD `LocalBusiness`/`FAQPage` schema, no `robots.txt`, no `sitemap.xml`. For a local business trading on search visibility and social sharing, the FAQ markup and the address block are the two most valuable structured-data opportunities available here.
3. **The CMS can mislead the client.** "Auto-saved to this browser" is honest, but an owner who edits hero copy on their laptop will reasonably believe the site changed for everyone. Either add a "Download updated index.html" path or make the local-only scope impossible to miss.
4. **No auth on a content editor that's visible to every visitor.** The launcher is public. Impact is low today (state is per-browser), but it becomes serious the moment persistence moves server-side.
5. **16 hot-linked Unsplash images.** Off-site dependency, no `srcset`, no local control, and an external party can change or remove them. Six have `loading="lazy"`; the hero background does not. Consider downloading into `assets/` with responsive variants.
6. ~~**Everything in one 192 KB file.**~~ **Resolved.** CSS and JS now live in `styles/main.css` and `scripts/app.js`, so a copy tweak no longer invalidates the whole document and each file caches independently.
7. ~~**README code tree is fictional.**~~ **Resolved.** The documented structure now matches the repository. There is still no `assets/` directory — imagery is hot-linked from Unsplash.
8. **`innerHTML` rendering with an `esc()` helper that isn't consistently applied.** Rich-text fields intentionally accept HTML (hero line 3, story titles), but image `alt` text and URLs flow through the same path in places. Worth an audit before any content becomes multi-user.
9. **No reduced-data story for the map.** The Google Maps iframe loads on page load; a click-to-load poster would cut several hundred KB.

### What's genuinely good

Accessibility is above the norm for this class of project: 37 ARIA attributes in markup plus 12 managed at runtime, `aria-expanded`/`aria-pressed` maintained by JS, an `aria-live` toast region, ESC handling throughout, a full `prefers-reduced-motion` path that disables parallax and smooth scrolling, `:focus-visible` styling, and labeled landmarks. The design-token system is disciplined and would port cleanly to any component framework.

---

## 7. Run locally

```bash
git clone https://github.com/sanvicpalawan/jaycee-final-oct29.git
cd jaycee-final-oct29
python -m http.server 8000
# open http://localhost:8000
```

No install step, no build step, no environment variables. Editing is via the in-page CMS (`Ctrl/⌘+Shift+A`) or by editing the `DEFAULT` object at `scripts/app.js:290`.
