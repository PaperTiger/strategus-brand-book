# Strategus Brand Identity Guide

A self-contained digital brand book for **Strategus** — the managed Connected TV (CTV) advertising agency. Built as a single HTML file with a fixed sidebar navigation and fully responsive layout — no build tools or dependencies required.

## What's inside

- **Logo & mark** — Full logo, stacked logo, logo mark, clear space & sizing, what to avoid
- **Color** — Primary and secondary palettes, approved combinations, usage pathways
- **Typography** — PolySans Median & Inter overview, usage rules, type scale, fallback fonts, what to avoid
- **Photography** — Direction and dos/don'ts *(placeholder imagery — pending Strategus assets)*
- **Applications** — Collateral and in-the-wild usage *(placeholder mockups — pending Strategus assets)*
- **Iconography** — Icon library *(placeholder set — pending Strategus icons)*

## Project structure

```
strategus-brand-book/
├── index.html        # The entire brand guide (single file)
├── brand.js          # Single source of truth: tokens, type, color data, nav, meta
├── sync-figma.js     # Pull tokens/logos from the Figma "Brand Tokens" file
├── fonts/            # PolySans Median (.otf) + Inter (variable .ttf)
└── images/logos/     # Strategus logo SVGs
```

## Usage

Open `index.html` directly in any modern browser — no server needed. Fonts and images load from relative paths, so keep `fonts/` and `images/` alongside the HTML file.

## Brand tokens

| Token | Value | Usage |
|---|---|---|
| Primary Blue | `#1CACFF` | Primary brand color / accent |
| Dark Blue | `#00346C` | Dark brand / depth |
| Black | `#000000` | Body text, dark backgrounds |
| White | `#FFFFFF` | Light backgrounds |
| Orange | `#F8682C` | Secondary |
| Purple | `#6D2EE2` | Secondary |
| Pale Green | `#C5FF98` | Secondary |
| Green | `#27C35D` | Secondary |
| Fuscia | `#CC1188` | Secondary |
| Gray | `#F3F3F3` | Surfaces, neutrals |

## Typography

- **PolySans Median** — display and headlines
- **Inter** (Regular / Semibold / Bold) — body copy

Inter is free (Google Fonts / rsms.me). PolySans is licensed — supply the production weights from the brand kit. (The repo currently bundles the PolySans **trial** weight.)

## Figma sync

Brand colors, typography, and logos live in the Figma **Brand Tokens** file (key `7YL5YDM3IMdS4Hk4we9l8j`). To re-pull:

1. Copy `sync.config.example.json` → `sync.config.json` and add a Figma Personal Access Token with `file_content:read` scope.
2. `node sync-figma.js pull-logos` — export logo SVGs from the Figma "Logos" page.

> Note: the colors/typography `pull` command uses Figma's Variables REST API, which is **Enterprise-only**. On non-Enterprise accounts, read the values from the file directly (as was done here) instead.

## Outstanding assets (gaps)

- Reversed (white) logo lockups for dark / photographic backgrounds
- Licensed PolySans production font files
- Strategus photography, application mockups, and icon set
- Download bundles: `downloads/strategus-fonts.zip`, `downloads/strategus-logos.zip`, `strategus-icon-set.zip`
