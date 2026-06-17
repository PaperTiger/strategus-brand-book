/* ─────────────────────────────────────────────────────────────────
   Hudson County Brand Configuration
   Single source of truth for tokens, typography, color data, and nav.
───────────────────────────────────────────────────────────────── */
const BRAND = {

  meta: {
    client:           "Strategus",
    nameLine1:        "Strategus",
    nameLine2:        "",
    title:            "Brand guidelines",
    version:          "Version 1.0",
    date:             "June 2026",
    preparedBy:       "Paper Tiger",
    sidebarLogoImage: "images/logos/strategus-logo-full-dark.svg",
    coverSealImage:   "images/logos/strategus-logo-mark-light.svg",
  },

  /* ── Type specimen copy (from Figma Brand Tokens → Typography) ── */
  specimens: {
    // Display — PolySans Median
    display96:  "Strategus",
    display73:  "Connected audio",
    display64:  "Driving full-funnel results",
    display48:  "Connected TV",
    // Headlines — PolySans Median
    headline42: "Mobile & display ads",
    headline32: "Attribution & reporting",
    headline24: "A pioneer in developing and delivering programmatic",
    headline21: "100% return on investment",
    // Body — Inter (and fallback fonts)
    body18:     "Strategus is a pioneer in developing and delivering programmatic Connected TV.",
    body16:     "Connected TV (CTV) campaigns take time, the right tools, and real expertise. That’s why we give you a full programmatic team — strategists, media buyers, and campaign managers.",
    body14:     "Connected TV (CTV) campaigns take time, the right tools, and real expertise. That’s why we give you a full programmatic team — strategists, media buyers, and campaign managers — backed by a tech stack that’s always evolving. We constantly improve our data and platform partnerships.",
    body12:     "Connected TV (CTV) campaigns take time, the right tools, and real expertise. That’s why we give you a full programmatic team.",
    sentence:   "Strategus is a pioneer in developing and delivering programmatic Connected TV.",
    // "What to avoid" page specimens
    avoidText:      "Strategus is a pioneer in developing and delivering programmatic Connected TV advertising.",
    avoidTextPart1: "Strategus",
    avoidTextPart2: "is a pioneer in developing and delivering programmatic Connected TV advertising.",
    // Fallback font sections (sentence + generic note)
    fallbackGoogle16: "Strategus is a pioneer in developing and delivering programmatic Connected TV. When brand fonts are unavailable, Inter provides a clean, modern alternative with excellent on-screen legibility.",
    fallbackSystem16: "Strategus is a pioneer in developing and delivering programmatic Connected TV. When brand fonts are unavailable, Arial maintains clarity and legibility across all system environments.",
  },

  /* ── CSS custom properties ────────────────────────────────── */
  tokens: {
    "primary-blue": "#1CACFF",
    "dark-blue":    "#00346C",
    charcoal:       "#000000",
    white:          "#FFFFFF",
    orange:         "#F8682C",
    purple:         "#6D2EE2",
    "pale-green":   "#C5FF98",
    green:          "#27C35D",
    fuscia:         "#CC1188",
    gray:           "#F3F3F3",
  },

  /* ── Font faces ───────────────────────────────────────────────
     Strategus type system (per Figma Brand Tokens → Typography):
       Display + Headlines — PolySans Median
       Body               — Inter (Regular / Semibold / Bold)
     TODO: add the .woff2 files to fonts/ — PolySans is licensed
     (supply from brand kit); Inter is free (Google Fonts / rsms.me).
     Inter ships as one variable .ttf (covers all weights); PolySans
     Median is a single .otf. */
  typography: {
    fonts: [
      // PolySans ships only the Median weight here; declare a weight RANGE so any
      // requested weight renders the real Median glyphs (no faux-bold synthesis).
      { family: "PolySans", weight: "100 900", file: "fonts/PolySansTrial-Median.otf" },
      { family: "Inter",    weight: 400, file: "fonts/Inter-VariableFont_opsz,wght.ttf" },
      { family: "Inter",    weight: 600, file: "fonts/Inter-VariableFont_opsz,wght.ttf" },
      { family: "Inter",    weight: 700, file: "fonts/Inter-VariableFont_opsz,wght.ttf" },
    ],
  },

  /* ── Color palettes ───────────────────────────────────────── */
  colors: {
    primary: [
      { name: "Primary Blue", hex: "#1CACFF", textColor: "#000000" },
      { name: "Dark Blue",    hex: "#00346C", textColor: "#FFFFFF" },
      { name: "Black",        hex: "#000000", textColor: "#FFFFFF" },
      { name: "White",        hex: "#FFFFFF", textColor: "#000000" },
    ],
    secondary: [
      { name: "Orange",     hex: "#F8682C", textColor: "#000000" },
      { name: "Purple",     hex: "#6D2EE2", textColor: "#FFFFFF" },
      { name: "Pale Green", hex: "#C5FF98", textColor: "#000000" },
      { name: "Green",      hex: "#27C35D", textColor: "#000000" },
      { name: "Fuscia",     hex: "#CC1188", textColor: "#FFFFFF" },
      { name: "Gray",       hex: "#F3F3F3", textColor: "#000000", outline: "1px solid #DADADA" },
    ],
  },

  /* ── Navigation structure ─────────────────────────────────── */
  nav: [
    {
      group: "Visual identity",
      items: [
        { label: "Introduction", id: "vi-intro" },
      ],
    },
    {
      group: "Logo &amp; mark",
      items: [
        { label: "Full logo",             id: "logo-horizontal" },
        { label: "Stacked logo",          id: "logo-stacked" },
        { label: "Logo mark",             id: "h-logo-mark" },
        { label: "Avatar &amp; favicon",    id: "logo-avatar" },
        { label: "What to avoid",         id: "logo-avoid" },
      ],
    },
    {
      group: "Color",
      items: [
        { label: "Introduction",                   id: "color-intro" },
        { label: "Primary palette",                id: "primary-palette" },
        { label: "Secondary palette",              id: "secondary-palette" },
        { label: "Combinations &amp; accessibility", id: "color-combinations" },
        { label: "Color pathways",                 id: "color-pathways" },
      ],
    },
    {
      group: "Typography",
      items: [
        { label: "Introduction", id: "type-intro" },
        {
          label: "PolySans &amp; Inter", id: "fg-overview",
          groupId: "nav-fg-group", subId: "nav-fg-sub",
          children: [
            { label: "Overview",      id: "fg-overview" },
            { label: "Usage",         id: "fg-usage" },
            { label: "Type specimen", id: "fg-specimen" },
            { label: "Size &amp; scale", id: "fg-scale" },
          ],
        },
        { label: "Google fallback",  id: "google-fallback" },
        { label: "System fallback",  id: "type-fallback" },
        { label: "What to avoid",    id: "type-avoid" },
      ],
    },
  ],
};


/* ─────────────────────────────────────────────────────────────────
   Initialisation — runs before the nav/routing script
───────────────────────────────────────────────────────────────── */
(function init() {
  injectTokens();
  injectFonts();
  renderNav();
  renderPalette("primary-palette-grid",   BRAND.colors.primary,   384);
  renderPalette("secondary-palette-grid", BRAND.colors.secondary, 336);
  renderCoverMeta();
  renderContent();
})();


/* Inject CSS custom properties into :root */
function injectTokens() {
  const declarations = Object.entries(BRAND.tokens)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
  const style = document.createElement("style");
  style.textContent = `:root { ${declarations} }`;
  document.head.appendChild(style);
}


/* Inject @font-face rules */
function injectFonts() {
  const fontFormat = (file) => {
    if (file.endsWith(".woff2")) return "woff2";
    if (file.endsWith(".woff"))  return "woff";
    if (file.endsWith(".otf"))   return "opentype";
    if (file.endsWith(".ttf"))   return "truetype";
    return "woff2";
  };
  const rules = BRAND.typography.fonts.map(f =>
    `@font-face {
      font-family: '${f.family}';
      src: url('${f.file}') format('${fontFormat(f.file)}');
      font-weight: ${f.weight};
      font-style: normal;
      font-display: swap;
    }`
  ).join("\n");
  const style = document.createElement("style");
  style.textContent = rules;
  document.head.appendChild(style);
}


/* Render sidebar navigation from BRAND.nav */
function renderNav() {
  const CHEVRON = `<svg class="nav-chevron" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 9l6 6l6-6"/></svg>`;
  const SECTION_CHEVRON = `<svg class="nav-section-chevron" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 9l6 6l6-6"/></svg>`;

  const html = BRAND.nav.map((section, sIdx) => {
    const items = section.items.map(item => {
      if (item.children) {
        const children = item.children.map(c =>
          `<a class="nav-link nav-child" href="#${c.id}" data-target="${c.id}">${c.label}</a>`
        ).join("");
        return `
        <div class="nav-expandable" id="${item.groupId}">
          <a class="nav-link nav-parent" href="#${item.id}" data-target="${item.id}" aria-expanded="false">
            ${item.label}
            ${CHEVRON}
          </a>
          <div class="nav-sub" id="${item.subId}">
            ${children}
          </div>
        </div>`;
      }
      return `<a class="nav-link" href="#${item.id}" data-target="${item.id}">${item.label}</a>`;
    }).join("");

    // First section (Logo & mark) open by default on mobile
    const openByDefault = sIdx === 0 ? ' open' : '';
    return `
    <div class="nav-group${openByDefault}" data-nav-section="${sIdx}">
      <div class="nav-group-header" role="button" aria-expanded="${sIdx === 0 ? 'true' : 'false'}">
        ${section.group}
        ${SECTION_CHEVRON}
      </div>
      <div class="nav-group-items">
        ${items}
      </div>
    </div>`;
  }).join("");

  const container = document.getElementById("nav-groups");
  if (container) {
    container.innerHTML = html;
    initNavSectionToggles();
  }
}

function initNavSectionToggles() {
  document.querySelectorAll('.nav-group-header[role="button"]').forEach(header => {
    header.addEventListener('click', function() {
      if (window.innerWidth > 768) return;
      const group = this.closest('.nav-group');
      const isOpen = group.classList.contains('open');
      document.querySelectorAll('.nav-group').forEach(g => {
        g.classList.remove('open');
        const h = g.querySelector('.nav-group-header[role="button"]');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        group.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/* Convert hex color to RGB array */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/* Convert hex color to CMYK array (mathematical, not profile-aware) */
function hexToCmyk(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);
  return [c, m, y, Math.round(k * 100)];
}

/* Render a color palette grid from an array of color objects */
function renderPalette(containerId, colors, minHeight) {
  function colorValues(c) {
    const [r, g, b] = hexToRgb(c.hex);
    const [cm, m, y, k] = hexToCmyk(c.hex);
    const hex = c.hex.replace("#", "");
    return `
      <div style="display:grid; grid-template-columns:14px 1fr; gap:0 10px; line-height:1.1;">
        <span>R</span><span>${r}</span>
        <span>G</span><span>${g}</span>
        <span>B</span><span>${b}</span>
        <div style="grid-column:1/-1; height:7px;"></div>
        <span>C</span><span>${cm}</span>
        <span>M</span><span>${m}</span>
        <span>Y</span><span>${y}</span>
        <span>K</span><span>${k}</span>
        <div style="grid-column:1/-1; height:7px;"></div>
        <span>#</span><span>${hex}</span>
        <div style="grid-column:1/-1; height:7px;"></div>
        <span>P</span><span>---</span>
      </div>`;
  }

  const html = colors.map(c => `
    <div style="background:${c.hex}; padding:32px 40px; display:flex; flex-direction:column; justify-content:space-between; min-height:${minHeight}px;${c.outline ? " box-shadow:inset 0 0 0 1px #C8C8C8;" : ""}">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px;">
        <div style="width:8px; height:8px; border-radius:50%; background:${c.textColor}; flex-shrink:0;"></div>
        <span style="font-size:16px; font-weight:600; color:${c.textColor}; letter-spacing:0.02em; line-height:1; font-family:inherit;">${c.name}</span>
      </div>
      <div style="font-size:11px; color:${c.textColor}; font-family:inherit;">
        ${colorValues(c)}
      </div>
    </div>`
  ).join("");

  const el = document.getElementById(containerId);
  if (el) el.innerHTML = html;
}


/* Populate cover page metadata */
function renderCoverMeta() {
  const el = document.getElementById("cover-meta");
  if (!el) return;
  const m = BRAND.meta;
  el.innerHTML = `
    <div style="font-weight:600;">${m.title}</div>
    <div>${m.version}</div>
    <div>${m.date}</div>
    <div style="white-space:nowrap;">Prepared by ${m.preparedBy}</div>`;
}

/* Fill data-brand (text) and data-brand-src (image src) from BRAND config */
function renderContent() {
  document.title = `${BRAND.meta.nameLine1}${BRAND.meta.nameLine2 ? " " + BRAND.meta.nameLine2 : ""}, Brand Identity`;

  document.querySelectorAll('[data-brand-src]').forEach(el => {
    const val = resolveKey(el.getAttribute('data-brand-src'));
    if (val) el.src = val;
  });

  document.querySelectorAll('[data-brand]').forEach(el => {
    const val = resolveKey(el.getAttribute('data-brand'));
    if (val !== undefined) el.textContent = val;
  });
}

function resolveKey(path) {
  return path.split('.').reduce((obj, k) => (obj != null ? obj[k] : undefined), BRAND);
}
