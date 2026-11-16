# Veeboo AI marketing site

A static HTML site for Veeboo AI. No framework and no dependencies: a small Node script turns the files in
`content/` into plain HTML in `dist/`.

## Run it

Needs Node 18 or newer. Nothing to install.

```bash
npm run dev        # builds, then serves http://localhost:4321
npm run build      # builds into dist/ only
```

There is no live reload. After a change, run `npm run build` again and refresh the browser.

## Edit content

Every word on the site lives in `content/`. You do not need to touch `src/` to change copy, prices, projects or posts.

| File                                                | What it controls                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `content/site.json`                                 | Name, tagline, domain, email, Calendly link, form endpoint, menu, CTA band        |
| `content/home.json`                                 | Home page: hero, example runs, problem/solution, process, FAQ                     |
| `content/services.json`, `services-page.json`       | The five services and the services page copy                                      |
| `content/industries.json`, `industries-page.json`   | One entry per niche. Add an entry and a new industry page is generated            |
| `content/pricing.json`                              | The three tiers (setup fee and monthly retainer), inclusions, pricing FAQ         |
| `content/portfolio.json`                            | Portfolio grid. Filters are built from each project's `industry` and `services`   |
| `content/case-studies.json`                         | Case studies. Each entry becomes a page at `/case-studies/<slug>/`                |
| `content/testimonials.json`                         | Quotes used on the home page and elsewhere                                        |
| `content/about.json`, `contact.json`                | About and contact pages                                                           |
| `content/blog/*.md`, `blog-page.json`               | Blog posts in Markdown, one file per post                                         |

Rules that keep the build happy:

- JSON must stay valid (double quotes, no trailing commas). The build names the broken file if it is not.
- Keep each `slug` unique and lowercase with hyphens. Slugs become URLs.
- Industry slugs and service slugs are used as links between files (a case study's `industry` must match a slug in
  `industries.json`).
- Items with `"sample": true` show a small "Sample" marker. Remove the flag only when the item is a real client result.

### Change prices

Open `content/pricing.json` and edit `setupFee` and `monthly` on each tier. The pricing page, the payback calculator
and the home page preview all read from that one file.

### Add a blog post

Create `content/blog/my-post-title.md`:

```md
---
title: My post title
description: One sentence shown in search results and on the blog list.
date: 2026-12-01
author: Aditya
---

First paragraph.

## A heading
```

Supported Markdown: `##` to `####` headings, paragraphs, `-` and `1.` lists, `>` quotes, fenced code, `**bold**`,
`*italic*`, `` `code` `` and `[links](https://example.com)`. Tables, images and raw HTML are not supported.

### Add a case study or portfolio project

Copy an existing entry in `content/case-studies.json` or `content/portfolio.json`, change the `slug`, and edit the
fields. Mock screenshots are drawn from data in the entry; to use real screenshots, put the image in
`public/assets/img/work/` and see the note in `TODO.md`.

## How it is put together

```
content/            all copy and data (JSON, plus Markdown for the blog)
src/layout.mjs      page shell: head and SEO tags, header, footer, closing CTA
src/components.mjs  shared pieces: buttons, ledger, run log, chat and workflow mock-ups, FAQ
src/pages/*.mjs     one file per page type; each returns the pages it produces
src/styles/*.css    base.css is the design system; the rest are per-page styles (bundled into one file)
public/             copied to dist/ as is (images, scripts, favicon)
build.mjs           the builder (also writes sitemap.xml and robots.txt)
serve.mjs           local preview server
```

Design: cobalt blue on cool paper with marigold as the one accent; Bricolage Grotesque for headings and Instrument
Sans for text (loaded from Google Fonts). Colours, type sizes and spacing are variables at the top of
`src/styles/base.css`. Icons are from Lucide (ISC licence), stored in `src/icons.json`.

## Deploy to Vercel

1. Put this folder in its own Git repository (or set it as the "Root Directory" of the Vercel project).
2. Import the repository in Vercel. `vercel.json` already sets the build command (`node build.mjs`) and the output
   folder (`dist`). Choose "Other" as the framework preset.
3. Set your real domain in `content/site.json` (`url`) before the first production deploy: the sitemap, canonical tags
   and share images use it.

Any static host works the same way (Netlify, Cloudflare Pages, GitHub Pages): build command `node build.mjs`, publish
folder `dist`.

## Before launch

Work through `TODO.md`. `grep -rn "TODO" content/` lists every placeholder that is still in the content.
