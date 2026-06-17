# Brand Book — Claude Guide

Single-file brand book. All content lives in `index.html` (~3,400 lines). `brand.js` is the single source of truth for tokens, type, color, nav, and metadata. Edit tokens/copy there, never in `index.html` directly.

Preview server: `brand-book` on port 8743 (defined in `.claude/launch.json`).

---

## Writing style rules (apply everywhere in this codebase)

**No em dashes.** Never write `—` in any user-visible text (headings, body copy, labels, captions, or nav labels). Use these alternatives instead:
- Introductory or explanatory clauses: use a colon (`:`)
- Parenthetical asides: use commas or parentheses
- Two separate thoughts: use a period and start a new sentence

**Sentence case always.** Headings, nav labels, section titles, and button text use sentence case: capitalize the first word and proper nouns only.

---

## Template repository

The master template lives at: `../brand-book-template/` (sibling folder of this project).
That repo should be pushed to GitHub and marked as a Template Repository so new client books can be created with "Use this template" in one click.

Any structural improvements made here (CSS fixes, mobile patterns, clearspace corrections) should be ported back to the template — the template CLAUDE.md has the same guidance.

---

## Starting a new brand book for a new client

**If the user says they want to set up a new brand book, ask these questions one group at a time. Wait for the answers before moving to the next group. Do not start editing files until all questions are answered.**

### Group 1 — Client basics
1. What is the client's full company name? (e.g. "Strategus")
2. What is the document title? (e.g. "Brand guidelines")
3. What version number and date should appear on the cover? (e.g. "Version 1.0 / June 2026")
4. Who is listed as having prepared this? (e.g. "Paper Tiger")

### Group 2 — Colors
5. What are the PRIMARY brand colors? For each one, provide: name + hex value. (e.g. "Primary Blue #1CACFF, Dark Blue #00346C, Black #000000, White #FFFFFF")
6. Are there SECONDARY brand colors? If yes, provide: name + hex value for each. (e.g. "Orange #F8682C, Purple #6D2EE2")
7. For each color, does black or white text look better on top of it?

### Group 3 — Typography
8. What font is used for headlines and display text? Is the font file available locally, or should it use a Google Font?
9. What font is used for body text? Same question — local file or Google Font?
10. If fonts are local files, what are the filenames? (They should be placed in the `fonts/` folder.)

### Group 4 — Logos
11. What logo files are available? List the filenames — they should be placed in `images/logos/`. (e.g. "acme-logo-dark.svg, acme-logo-light.svg, acme-logo-mark.svg")
12. Which file is the "dark" full logo (used on light backgrounds)?
13. Which file is the "light" full logo (used on bright/color backgrounds)?
14. Which file is the "white" full logo (used on dark backgrounds)?
15. Which file is the standalone mark/icon (used as the cover page seal)?

### Group 5 — Type specimens (the big display text on the Typography pages)
16. What short word or phrase should appear in the largest display size? (e.g. the company name — "Strategus")
17. What 2–4 word phrase captures what the company does? (e.g. "Connected audio" or "Award-winning creative")
18. What is a short tagline or value proposition sentence? (e.g. "Driving full-funnel results")
19. What is a 1–2 sentence description of the company for body copy specimens?

### Group 6 — Navigation / sections
20. Which sections should the brand book include? (Default set: Logo & mark, Color, Typography. Optional: Photography, Applications, Iconography — only include if the client has real assets for these.)

**Once all answers are in, run `node setup.js` — it will write `brand.js` automatically. Then do a find-and-replace pass in `index.html` to swap the client name in any hardcoded copy (page intros, section descriptions).**

---

---

## Clearspace diagrams

### How the system works

Three logo pages use clearspace diagrams: `#logo-horizontal`, `#logo-stacked`, `#h-logo-mark`. Each diagram is built from a set of `.cs-*` CSS classes defined around line 1044 in `index.html`.

**HTML structure** (copy this block for each new diagram):

```html
<div class="cs-outer">
  <div class="cs-zone" style="--cs-x: 34px;">   <!-- set --cs-x to half the logo height -->
    <div class="cs-logo-box">
      <img src="images/logos/strategus-logo-full-dark.svg" alt="..." style="max-height:68px; width:auto; display:block;">
    </div>
    <div class="cs-dim-v top"><span class="cs-lbl">x</span></div>
    <div class="cs-dim-v bottom"><span class="cs-lbl">x</span></div>
    <div class="cs-dim-h left"><span class="cs-lbl">x</span></div>
    <div class="cs-dim-h right"><span class="cs-lbl">x</span></div>
  </div>
  <div class="cs-def">
    <span class="cs-def-x">x</span>
    <span>= ½ the height of the [Client] mark</span>
  </div>
</div>
```

**`--cs-x`** = the clearspace amount (half the logo mark height). Set it as an inline CSS variable on `.cs-zone`. Dimension lines and padding both derive from this value.

### Critical: never use `@apply` in cs-* rules

The page loads Tailwind via CDN (`<script src="https://cdn.tailwindcss.com">`). The CDN **does not process `@apply`** directives in `<style>` blocks — they are silently ignored at runtime. All `.cs-*` classes must use plain CSS properties.

The five classes that must stay as plain CSS (around line 1044):

```css
.cs-outer {
  border: 1px solid var(--light-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  box-sizing: border-box;
}
.cs-zone {
  background: color-mix(in srgb, var(--primary-blue) 20%, transparent);
  padding: var(--cs-x, 36px);
  position: relative;
  display: inline-block;   /* sizes to content so diagram is compact */
}
.cs-logo-box {
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.cs-def {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  font-size: 12px;
}
.cs-def-x {
  font-weight: 700;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 2px;
  flex-shrink: 0;
}
```

### Critical: mobile media query — dimension lines must match scaled padding

Inside `@media (max-width: 768px)`, the zone padding is scaled down so the diagram fits narrow screens. The `.cs-dim-v` and `.cs-dim-h` dimension lines use `height/width: var(--cs-x)` in the base CSS — which would make them much larger than the scaled padding strips. They **must be overridden to match** the same scaled value:

```css
/* Mobile clearspace — all three rules are required together */
.cs-outer { padding: 16px !important; }
.cs-zone {
  padding: max(12px, calc(var(--cs-x, 36px) * 0.38)) !important;
  max-width: 100% !important;
}
.cs-dim-v { height: max(12px, calc(var(--cs-x, 36px) * 0.38)) !important; }
.cs-dim-h { width:  max(12px, calc(var(--cs-x, 36px) * 0.38)) !important; }
.cs-logo-box img { max-height: 56px !important; width: auto !important; }
```

If you omit the `cs-dim-v` / `cs-dim-h` overrides, the dimension lines will be 34–75px tall/wide while the padding strip is only 12–28px, making the lines extend into the white box and produce broken visual output on mobile.

### Adapting for a new client

1. Update the logo `src` attribute and `--cs-x` value (= half the logo mark height in px).
2. Update the definition text: `= ½ the height of the [Client] mark`.
3. Adjust `max-height` on the `<img>` for the desktop display size (the mobile override at `56px` covers mobile automatically).
4. If the client's primary brand color is not `--primary-blue`, update the `color-mix` tint in `.cs-zone` and `.cs-def-x` background.
5. Do NOT add `@apply` to any `.cs-*` rule — always use plain CSS.

---

## Mobile responsive patterns

- **Type specimens**: use per-element `clamp()` inline font-sizes. A blanket `@media` override collapses all sizes to the same value and destroys hierarchy.
- **Inline grids with `repeat(N, ...)`**: override with attribute selectors in the mobile media query: `.main [style*="grid-template-columns:repeat(3"]`. Use an ID selector to scope overrides to a specific section when needed (ID specificity beats class + attribute).
- **Full-height flex containers**: `height: 100dvh` + `flex:1` spacers create large voids on mobile. Override with `height: auto !important` and `flex: 0 0 32px !important` on the spacer.
- **fg-overview fluid type**: uses `container-type: inline-size` + `cqi` units to scale within the column — do not replace with `vw`.
- **Section titles**: `clamp(22px, 5.5vw, 34px)` in the mobile block prevents 3-line wraps on narrow screens.

---

## Logo color rules

| Background | Logo to use |
|---|---|
| Light (White, Gray, Pale Green) | `full-dark` — dark ink, blue diamond |
| Bright (Primary Blue, Orange, Green) | `full-light` — black wordmark, WHITE diamond |
| Dark (Dark Blue, Black) | `full-white` — all white |

The mobile header logo (`#mobile-logo`) is swapped in the `showPage()` JS function — it sets `full-light` when `targetId === 'home'` (Primary Blue cover), `sidebarLogoImage` (full-dark) otherwise.

**Stacked logo naming is inverted** from the full logo: `stacked-dark` = white/reversed version, `stacked-light` = dark ink version. See in-page note on the Stacked page.

---

## brand.js — key fields to update per client

```js
meta: {
  client, nameLine1, nameLine2,   // cover page heading
  title, version, date, preparedBy,
  sidebarLogoImage,               // path to logo for sidebar (dark version)
  coverSealImage,                 // path to mark for cover page seal
}
tokens: { ... }                   // CSS custom properties injected into :root
colors: { primary: [], secondary: [] }  // palette grid data
typography: { fonts: [] }        // @font-face declarations
nav: [ { group, items: [...] } ] // sidebar navigation structure
specimens: { ... }               // type specimen copy (data-brand attributes)
```

---

## Common pitfalls

- **Smart/curly quotes in `src` attributes** break image loading (encoded as `%E2%80%9D`). Use `cat -v` to detect them; `grep` normalises display and won't show them. Use Python to replace: `content.replace('“', '"').replace('”', '"')`.
- **Tailwind CDN `@apply` is a no-op** in `<style>` blocks — always check computed styles if a layout looks wrong.
- **`flex:1` spacers in `h-dvh` containers** create large voids on mobile — see the mobile pattern above.
- **ID specificity** (100) beats class + attribute selector (10 + 10) — use an ID selector to override a generic grid rule for a specific section.
