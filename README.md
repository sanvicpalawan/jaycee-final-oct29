# JayCee Trading & Services

This repository is the company profile and sales website for JayCee Trading & Services — a Palawan-based food and supply business focused on reliable product distribution for homes, restaurants, hotels, and commercial buyers.

This project represents our digital presence: a premium static web application designed to present the brand, communicate the product range, and provide a lightweight admin-style content manager for updating public-facing information.

## Computer Languages

- HTML5
- CSS3
- JavaScript (vanilla ES6+)
- Tailwind CSS via CDN

## Tech Stack

- Static front-end architecture
- Responsive single-page marketing website
- Embedded admin/editor interface
- Google Fonts integration
- CSS-driven design system and layout
- Vanilla JavaScript for interactivity and CMS-like controls

## What This Project Is

This is a premium business website for a wholesale and retail food distribution company. It highlights product categories such as imported meats, frozen seafood, dairy, cheese, and frozen essentials. The site is designed to feel trustworthy, premium, and conversion-focused for B2B and consumer sales.

## Company Profile

JayCee Trading & Services supplies essential food and grocery products in and around Palawan, with an emphasis on consistency, quality, and dependable service. The website is structured to communicate professionalism, product availability, location coverage, and customer confidence.

## Code Structure

```text
jaycee-final-oct29/
├── premium-jaycee-website-rebuild.zip   # packaged source archive for the web app
├── README.md                             # repository/company profile
├── index.html                            # main site markup and content
├── style/system                          # embedded CSS design system and responsive styles
├── script logic                          # embedded JavaScript for navigation, UI, and admin controls
├── assets                                # imagery used for hero, products, and brand visuals
├── admin panel                           # in-page CMS-like content editor
└── public marketing sections             # hero, categories, story, FAQ, services, location, CTA
```

## Admin Backend

The admin layer is not a separate database-backed backend. Instead, it functions as a lightweight content management experience built directly into the website.

It supports:

- updating hero and call-to-action text
- managing categories and featured items
- editing company story and services
- updating business location and contact details
- saving content through a front-end admin panel

This makes the project easy to deploy and maintain as a static marketing website while still giving the business a practical editing interface.

## How It Works

The project is a static website build with no heavy framework dependency. It runs as a front-end application and can be served locally or deployed to any static hosting platform.

## Run Locally

```bash
# extract the zip if needed
unzip premium-jaycee-website-rebuild.zip

# then serve the folder
cd <extracted-folder>
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Summary

This repository is our company website and digital identity for JayCee Trading & Services. It combines a polished product marketing experience with a simple, admin-friendly content system, using a stack built around HTML, CSS, and JavaScript.
