# JayCee Trading & Services

A premium B2B food and supply web presence for JayCee Trading & Services, built to showcase imported meats, frozen seafood, dairy, cheese, and essentials for homes, restaurants, and hotels across Puerto Princesa and Palawan.

This project is a polished static marketing website with a built-in admin-style content editor for updating sections, products, stories, banners, and contact details without needing a separate front-end framework stack.

## Tech Stack

- HTML5
- CSS3
- JavaScript (vanilla ES modules / DOM scripting)
- Tailwind CSS via CDN (`@tailwindcss/browser`)
- Google Fonts (`Inter` + `Inter Tight`)
- Responsive single-page layout
- Custom in-browser admin editor / CMS-like interface

### Stack notes

The site is intentionally lightweight and fast: it works as a static front-end and uses inline styling + script logic rather than a full React/Vue/Next.js app. That keeps deployment simple and makes the admin experience feel like a lightweight content management layer on top of the marketing site.

## Code Tree

```text
jaycee-final-oct29/
├── premium-jaycee-website-rebuild.zip   # packaged source archive
├── README.md                             # project profile / repo landing page
├── index.html                            # main storefront and content layout
├── styles                                # embedded CSS inside index.html
├── scripts                               # embedded JavaScript logic inside index.html
├── assets                                # product, hero, and brand imagery referenced by the page
├── admin                                 # in-page admin/editor UI and content management controls
└── static content                       # sections for hero, categories, products, story, FAQ, location, CTA
```

> In the current build, the implementation is centered around a single-page `index.html` with design system CSS and interactive logic embedded directly in the page, rather than a large multi-folder codebase.

## About the Admin Backend

The project's admin layer is a lightweight custom backend-like experience built directly into the website rather than a separate server application.

### What it does

- Lets the business edit hero content, CTAs, and marketing copy
- Manages product/service category blocks
- Updates featured items and company story sections
- Controls contact details, locations, and opening hours
- Shows an admin panel with tabs, form fields, upload slots, and save actions
- Provides a CMS-like interface for quick content updates without a full app backend

### Current backend shape

This version is best described as:

- Front-end admin editor
- Local content management interface
- Static-site publishing model
- No production database or API layer in the shipped build

In other words, the admin experience is designed as a practical content manager for a marketing website, not a full enterprise backend with authentication, user roles, and database persistence.

## Project Focus

JayCee is positioned as a distribution and supply partner for:

- Imported meats
- Frozen seafood
- Dairy and cheese
- Frozen essentials
- Restaurant, hotel, and home supply orders

The website emphasizes trust, product variety, fast delivery, and reliable service in Palawan.

## Quick Start

Because this is a static website, the simplest way to run it locally is:

```bash
# from the project folder
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

If the site is served as a packaged archive, extract the zip first and open the generated `index.html` in a browser or serve the folder with a static web server.

## Summary

This project is a premium B2B food distribution website with a strong visual identity, responsive design, and a built-in admin-style content management interface. It is designed for fast deployment, easy content updates, and a polished brand presentation for JayCee Trading & Services.
