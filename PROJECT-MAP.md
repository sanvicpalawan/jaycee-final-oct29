# JayCee Trading & Services — Tech Stack & Code Tree

> Generated from a full read of the repository at commit `212340b` (branch `arena/84cbffb6-jaycee-final-oct29`).
> Everything below was verified against the actual source, not the README's description.

---

## 1. At a glance

The repository is **two tracked files**:

```
jaycee-final-oct29/
├── README.md                                  # marketing/company profile (3.1 KB)
└── premium-jaycee-website-rebuild.zip         # 192 KB archive
    └── index.html                             # the ENTIRE application (192,075 bytes)
```

There is no `src/`, no `styles/`, no `scripts/`, no `assets/`, no package manager, no build system, and no test suite. The README's "Code Structure" section describes a folder layout that **does not exist in this repo** — it describes an aspirational structure for the extracted site.

The whole product is a **single self-contained HTML document**: 3,363 lines, split into ~974 lines of inline CSS, ~1,090 lines of static markup, and ~2,060 lines of vanilla JS across two inline `<script>` blocks.

---

## 2. Tech stack (as actually used)

| Layer | Technology | Where | Notes |
|---|---|---|---|
| Markup | HTML5 | `index.html` body | Semantic landmarks (`header`, `nav`, `main`, 11 `section`, `footer`), 53 ARIA attributes |
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

```
premium-jaycee-website-rebuild.zip
└── index.html                                            3,363 lines / 192 KB
    │
    ├── <head> ........................................... 1–11
    │   ├── meta charset / viewport / title / description
    │   ├── Google Fonts preconnect + stylesheet
    │   └── Tailwind browser CDN (unused — see findings)
    │
    ├── <style> — DESIGN SYSTEM .......................... 12–985
    │   ├── Design tokens ................................ 13–70
    │   │   ├── Color: --c-bg, --c-ink (+2 tints), --c-accent #B3261E,
    │   │   │   --c-green #1E8E4A, hairlines, image fallbacks
    │   │   ├── Spacing: 8 px scale (--s-1 … --s-18) + fluid --section-y
    │   │   ├── Radii: 10/16/20/24/999 px
    │   │   ├── Shadows: 3 layered elevation levels
    │   │   └── Type: fluid clamp() scale --t-xs … --t-display (11 steps)
    │   ├── Base / reset ................................. 72–130
    │   ├── Typography system ............................ 132–184
    │   ├── Progress bar + nav ........................... 186–233
    │   ├── Hero ......................................... 235–294
    │   ├── Flip cards ................................... 296–309
    │   ├── Category carousel ............................ 311–339
    │   ├── Featured cards ............................... 341–359
    │   ├── Logo marquee ................................. 361–377
    │   ├── Story rows (alternating) ..................... 379–390
    │   ├── Essentials ................................... 392–403
    │   ├── Story / 2017 ................................. 405–426
    │   ├── Location ..................................... 428–453
    │   ├── FAQ .......................................... 455–477
    │   ├── CTA bands + footer ........................... 479–514
    │   ├── Scroll reveal ................................ 516–528
    │   ├── RESPONSIVE (13 media queries) ................ 530–725
    │   ├── prefers-reduced-motion ....................... 727–729
    │   ├── Admin / CMS chrome ........................... 730–877
    │   ├── Official logo — live site .................... 878–892
    │   └── Official logo — admin manager ................ 893–985
    │
    ├── <body> markup .................................... 987–1299
    │   ├── Scroll progress bar .......................... 989–990
    │   ├── <header class="nav"> ......................... 993–1011
    │   │   └── brand · #navLinks · tel · CTA · burger
    │   ├── Mobile menu overlay .......................... 1012–1021
    │   ├── <main id="top"> — 11 sections ................ 1022–1256
    │   │   ├── #hero           Hero + h1 reveal lines ... 1025–1075
    │   │   ├── #products       Category carousel ........ 1076–1102
    │   │   ├── #featuredSection Featured cards .......... 1103–1109
    │   │   ├── #wholesale      Trusted-by marquee ....... 1110–1120
    │   │   ├── #delivery       Story rows (3) ........... 1121–1131
    │   │   ├── #(essentials)   Everyday essentials ...... 1132–1145
    │   │   ├── #story          Since 2017 + flip cards .. 1146–1166
    │   │   ├── #location       Address, hours, map ...... 1167–1215
    │   │   ├── #faq            Custom accordion ......... 1216–1229
    │   │   ├── #midCta         Mid-page CTA ............. 1230–1239
    │   │   └── #order          Final CTA band ........... 1240–1255
    │   ├── <footer> .................................... 1259–1270
    │   ├── Admin launcher button ....................... 1272–1276
    │   ├── Admin panel shell (16 tabs) ................. 1277–1297
    │   └── Toast live region ........................... 1299
    │
    ├── <script> #1 — SITE BEHAVIOR ....................... 1301–1562
    │   ├── IIFE, 'use strict', prefers-reduced-motion flag
    │   ├── Footer year injection
    │   ├── Hero entrance reveal (double rAF → .is-ready)
    │   ├── Nav scroll shadow + scroll progress bar
    │   │   (rAF-throttled scroll handler, passive listener)
    │   ├── Mobile menu (aria-expanded, ESC, outside click, resize)
    │   ├── window.__syncBodyOverflow bridge → used by CMS
    │   ├── Smooth anchor scroll w/ sticky-nav offset
    │   ├── Flip cards (touch tap toggle, Enter/Space/Escape, aria-pressed)
    │   ├── Category carousel (prev/next, disabled-state math)
    │   ├── Parallax, marquee, counters, open/closed status
    │   ├── FAQ accordion + typewriter answer reveal
    │   └── Scroll-reveal via IntersectionObserver
    │
    └── <script> #2 — STATE + CMS ........................ 1567–3361
        ├── LS_KEY = 'jaycee_site_state_v2' .............. 1569
        ├── ICONS — inline SVG sprite object ............. 1570–1580
        ├── DEFAULT — the entire site content model ...... 1588–1793
        │   ├── brand      name, tagline, phone, email, accent, green, fontHead
        │   ├── logo       src/mime/analysis/approval + 6 size controls
        │   ├── nav[]      label + href
        │   ├── hero       eyebrow, 3 lines, lede, 2 CTAs, bg, glass card
        │   ├── categories 5 items (title, sub, desc, cta, img, alt, fallback)
        │   ├── featured   3 items
        │   ├── trusted    6 partner names + brand colors
        │   ├── goodfood   title + 3 alternating rows (reverse flag)
        │   ├── essentials 3 items
        │   ├── story      year, 2 paragraphs, 4 flip-card services
        │   ├── location   address, maps URL, embed URL, 3 stats, hours[]
        │   ├── faq        6 Q&A
        │   ├── midCta / finalCta
        │   ├── footer     brandText, 3 link columns, copyright, location
        │   └── social     items[]
        ├── State layer ................................... 1794–1810
        │   └── clone() · loadState() deep-merge · saveState() w/ quota toast
        ├── Utilities ..................................... 1812–1820
        │   └── el() · esc() (HTML-escape) · toast() · readFileAsDataURL()
        ├── RENDER FUNCTIONS .............................. 1826–2232
        │   ├── setText/setAttr/setImg helpers
        │   ├── Logo plumbing (brandInner, applyLogoVars, applyFavicon)
        │   ├── renderNav, renderHero, renderCategories, renderFeatured
        │   ├── renderTrusted, renderRows, renderEssentials, renderStory
        │   ├── renderLocation, renderFAQ, renderMidCta, renderFinal
        │   ├── renderFooter
        │   └── shade() — hex color math for partner logos
        ├── RE-INIT helpers (post-render rebinding) ........ 2233–2348
        │   ├── wireFlips, wireParallax, wireReveal
        │   ├── initCounters, updateOpenStatus, updateCarouselArrows
        │   ├── wireFAQ (accordion + typing effect)
        │   └── renderAll() orchestrator
        ├── ADMIN PANEL ................................... 2350–2404
        │   ├── openPanel / closePanel + body overflow lock
        │   ├── Reset to defaults (confirm)
        │   ├── Export JSON (Blob download, dated filename)
        │   └── Import JSON (FileReader + deep merge)
        ├── Build panel UI ................................ 2406–2597
        │   ├── TABS[16] definition
        │   └── Field factory: field/input/textarea/htmlInput/
        │       uploadField/colorSwatch/sectionHeader/listEditor
        │       (listEditor = drag-reorder + enable/disable + delete)
        ├── TAB RENDERERS ×16 ............................. 2599–3013
        │   brand · theme · nav · hero · cats · feat · logos · rows ·
        │   ess · story · loc · faq · mid · final · footer
        ├── LOGO MANAGER TAB .............................. 3015–3338
        │   └── upload → canvas optimise → pixel checks
        │       (transparency, white box, contrast) → 3 live previews → approve
        ├── flashSaved() micro-interaction ................ 3336
        └── Initial render ................................ 3341–3361
            ├── document.fonts.ready → renderAll()
            ├── readyState fallback
            └── Ctrl/⌘+Shift+A opens the editor
```

---

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

- **Every keystroke in the editor re-renders the whole page** (`bind()` → `saveState()` + `renderAll()`), then `buildPanel()` rebuilds the form. This is why all event wiring lives in separate `wire*()` helpers — listeners are destroyed on each render.
- **Content lives in the visitor's browser, not on a server.** An edit made in the CMS is visible only in that browser profile. It does not reach other visitors, because `index.html` is a static file. The documented workflow for that is Export JSON → hand-edit the `DEFAULT` object / re-import.
- **Markup is duplicated conceptually**: `DEFAULT` holds the copy, and the static HTML holds empty shells with matching `id`s (`#heroLine1`, `#footerCopy`, `#catCarousel`, …). 112 `id` attributes exist largely to serve as render targets.
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
| Save | Debounced-free auto-save to `localStorage` on every change; quota failure shows an error toast pushing the user to export |
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
6. **Everything in one 192 KB file.** No caching granularity — any copy tweak invalidates the whole document. Splitting CSS/JS into `styles/` and `scripts/` (as the README already claims) gives caching and makes the file navigable in editors.
7. **README code tree is fictional.** It lists `styles/`, `scripts/`, `assets/`, `admin/` directories that aren't in the repo. Either extract the archive into that structure or correct the README to match reality.
8. **`innerHTML` rendering with an `esc()` helper that isn't consistently applied.** Rich-text fields intentionally accept HTML (hero line 3, story titles), but image `alt` text and URLs flow through the same path in places. Worth an audit before any content becomes multi-user.
9. **No reduced-data story for the map.** The Google Maps iframe loads on page load; a click-to-load poster would cut several hundred KB.

### What's genuinely good

Accessibility is above the norm for this class of project: 53 ARIA attributes, `aria-expanded`/`aria-pressed` maintained by JS, an `aria-live` toast region, ESC handling throughout, a full `prefers-reduced-motion` path that disables parallax and smooth scrolling, `:focus-visible` styling, and labeled landmarks. The design-token system is disciplined and would port cleanly to any component framework.

---

## 7. Run locally

```bash
unzip premium-jaycee-website-rebuild.zip -d site
cd site
python -m http.server 8000
# open http://localhost:8000
```

No install step, no build step, no environment variables. Editing is via the in-page CMS (`Ctrl/⌘+Shift+A`) or by editing the `DEFAULT` object at `index.html:1588`.
