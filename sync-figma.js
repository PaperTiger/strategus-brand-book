#!/usr/bin/env node
/**
 * sync-figma.js — Sync brand.js ↔ Figma Brand Tokens file
 *
 * Usage:
 *   node sync-figma.js pull   — Figma → brand.js
 *   node sync-figma.js push   — brand.js → Figma
 *
 * What syncs:
 *   Colors   — BRAND.tokens (hex values) + BRAND.colors (palette cards)
 *   Fonts    — BRAND.typography.fonts (family, weight, file path)
 *
 * Setup:
 *   1. Copy sync.config.example.json → sync.config.json
 *   2. Add your Figma Personal Access Token
 *      (Figma → Account Settings → Personal access tokens)
 *   3. node sync-figma.js pull
 *
 * Requires Node 18+ (uses built-in fetch).
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const CONFIG_PATH   = path.join(__dirname, 'sync.config.json');
const BRAND_JS_PATH = path.join(__dirname, 'brand.js');

// ── Config ───────────────────────────────────────────────────────

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('sync.config.json not found.');
    console.error('Copy sync.config.example.json → sync.config.json and fill in your token.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  if (!config.figmaToken || config.figmaToken === 'YOUR_TOKEN_HERE') {
    console.error('Set figmaToken in sync.config.json');
    console.error('Get it: Figma → Account Settings → Personal access tokens');
    process.exit(1);
  }
  return config;
}

// ── Parse brand.js ───────────────────────────────────────────────

function loadBrand() {
  const brandJs = fs.readFileSync(BRAND_JS_PATH, 'utf8');
  const dataOnly = brandJs
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\(function init[\s\S]*/, '')
    .replace(/function \w+[\s\S]*/, '');
  const context = {};
  vm.createContext(context);
  vm.runInContext(dataOnly, context);
  return context.BRAND;
}

// ── Color helpers ────────────────────────────────────────────────

function rgbToHex({ r, g, b }) {
  const h = v => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

// ── Figma REST API ────────────────────────────────────────────────

async function figmaGet(token, fileKey, endpoint) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}${endpoint}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) throw new Error(`Figma GET ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function figmaPost(token, fileKey, endpoint, body) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}${endpoint}`, {
    method: 'POST',
    headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Figma POST ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Shared: fetch + parse all Brand Token variables ───────────────

async function fetchBrandVariables(token, fileKey) {
  const data = await figmaGet(token, fileKey, '/variables/local');
  const variables   = Object.values(data.meta.variables);
  const collections = Object.values(data.meta.variableCollections);

  const brandCollection = collections.find(c => c.name === 'Brand Tokens');
  if (!brandCollection) throw new Error('"Brand Tokens" variable collection not found in Figma file.');

  const modeId   = brandCollection.defaultModeId;
  const collVars = variables.filter(v => v.variableCollectionId === brandCollection.id);

  return { brandCollection, modeId, collVars };
}

// ── PULL: Figma → brand.js ────────────────────────────────────────

async function pull(token, fileKey) {
  console.log('Pulling from Figma...');

  const { modeId, collVars } = await fetchBrandVariables(token, fileKey);

  const newTokens    = {};
  const newPrimary   = [];
  const newSecondary = [];
  // Typography: group by slug ("Founders Grotesk Condensed 700")
  const typographyMap = {};

  for (const variable of collVars) {
    const value = variable.valuesByMode[modeId];
    if (value === undefined || value === null) continue;

    // ── Colors ──
    if (variable.resolvedType === 'COLOR') {
      const hex = rgbToHex(value);
      if (variable.name.startsWith('tokens/')) {
        newTokens[variable.name.replace('tokens/', '')] = hex;
      } else if (variable.name.startsWith('palette/primary/')) {
        newPrimary.push({ name: variable.name.replace('palette/primary/', ''), hex });
      } else if (variable.name.startsWith('palette/secondary/')) {
        newSecondary.push({ name: variable.name.replace('palette/secondary/', ''), hex });
      }
    }

    // ── Typography ──
    if (variable.name.startsWith('typography/')) {
      const parts = variable.name.split('/'); // ['typography', 'Slug', 'family|weight|file']
      if (parts.length !== 3) continue;
      const [, slug, prop] = parts;
      if (!typographyMap[slug]) typographyMap[slug] = {};
      typographyMap[slug][prop] = variable.resolvedType === 'FLOAT' ? value : String(value);
    }
  }

  // Reconstruct fonts array preserving original order (sort by weight for consistency)
  const newFonts = Object.entries(typographyMap)
    .map(([, props]) => ({
      family: props.family ?? '',
      weight: Number(props.weight ?? 400),
      file:   props.file ?? '',
    }))
    .sort((a, b) => a.weight - b.weight || a.family.localeCompare(b.family));

  // Preserve textColor / outline values in palette entries
  const brand = loadBrand();
  function withExtras(newColors, existing) {
    return newColors.map(c => {
      const match = existing.find(e => e.name === c.name);
      const entry = { name: c.name, hex: c.hex, textColor: match?.textColor ?? '#000000' };
      if (match?.outline) entry.outline = match.outline;
      return entry;
    });
  }

  const primary   = withExtras(newPrimary,   brand.colors.primary);
  const secondary = withExtras(newSecondary, brand.colors.secondary);

  // ── Rewrite brand.js ──
  let brandJs = fs.readFileSync(BRAND_JS_PATH, 'utf8');

  // tokens block
  const tokenLines = Object.entries(newTokens)
    .map(([k, v]) => `    "${k}":  "${v}",`)
    .join('\n');
  brandJs = brandJs.replace(/(tokens:\s*\{)[^}]*(\})/s, `$1\n${tokenLines}\n  $2`);

  // primary colors block
  const primaryLines = primary
    .map(c => {
      const extra = c.outline ? `, outline: "${c.outline}"` : '';
      return `      { name: "${c.name}", hex: "${c.hex}", textColor: "${c.textColor}"${extra} },`;
    })
    .join('\n');
  brandJs = brandJs.replace(/(primary:\s*\[)[^\]]*(\])/s, `$1\n${primaryLines}\n    $2`);

  // secondary colors block
  const secondaryLines = secondary
    .map(c => {
      const extra = c.outline ? `, outline: "${c.outline}"` : '';
      return `      { name: "${c.name}", hex: "${c.hex}", textColor: "${c.textColor}"${extra} },`;
    })
    .join('\n');
  brandJs = brandJs.replace(/(secondary:\s*\[)[^\]]*(\])/s, `$1\n${secondaryLines}\n    $2`);

  // typography fonts block
  if (newFonts.length > 0) {
    const fontLines = newFonts
      .map(f => `      { family: "${f.family}", weight: ${f.weight}, file: "${f.file}" },`)
      .join('\n');
    brandJs = brandJs.replace(/(fonts:\s*\[)[^\]]*(\])/s, `$1\n${fontLines}\n    $2`);
  }

  fs.writeFileSync(BRAND_JS_PATH, brandJs);

  console.log('✓ brand.js updated');
  console.log(`  ${Object.keys(newTokens).length} tokens`);
  console.log(`  ${primary.length} primary + ${secondary.length} secondary colors`);
  console.log(`  ${newFonts.length} fonts`);
}

// ── PUSH: brand.js → Figma ────────────────────────────────────────

async function push(token, fileKey) {
  console.log('Pushing to Figma...');

  const brand = loadBrand();
  const { brandCollection, modeId, collVars } = await fetchBrandVariables(token, fileKey);

  function findVar(name) {
    return collVars.find(v => v.name === name);
  }

  const updates = [];

  // ── Colors ──
  for (const [key, hex] of Object.entries(brand.tokens)) {
    const v = findVar(`tokens/${key}`);
    if (v) updates.push({ action: 'UPDATE', id: v.id, setValueForMode: { [modeId]: hexToRgb01(hex) } });
  }
  for (const color of brand.colors.primary) {
    const v = findVar(`palette/primary/${color.name}`);
    if (v) updates.push({ action: 'UPDATE', id: v.id, setValueForMode: { [modeId]: hexToRgb01(color.hex) } });
  }
  for (const color of brand.colors.secondary) {
    const v = findVar(`palette/secondary/${color.name}`);
    if (v) updates.push({ action: 'UPDATE', id: v.id, setValueForMode: { [modeId]: hexToRgb01(color.hex) } });
  }

  // ── Typography ──
  for (const font of brand.typography.fonts) {
    const slug = `${font.family} ${font.weight}`;
    const familyVar = findVar(`typography/${slug}/family`);
    const weightVar = findVar(`typography/${slug}/weight`);
    const fileVar   = findVar(`typography/${slug}/file`);
    if (familyVar) updates.push({ action: 'UPDATE', id: familyVar.id, setValueForMode: { [modeId]: font.family } });
    if (weightVar) updates.push({ action: 'UPDATE', id: weightVar.id, setValueForMode: { [modeId]: font.weight } });
    if (fileVar)   updates.push({ action: 'UPDATE', id: fileVar.id,   setValueForMode: { [modeId]: font.file } });
  }

  if (updates.length === 0) {
    console.log('No matching variables found to update.');
    return;
  }

  await figmaPost(token, fileKey, '/variables', { variables: updates });

  const colorCount = Object.keys(brand.tokens).length + brand.colors.primary.length + brand.colors.secondary.length;
  const fontCount  = brand.typography.fonts.length;
  console.log('✓ Figma updated');
  console.log(`  ${colorCount} color variables`);
  console.log(`  ${fontCount * 3} typography variables (family + weight + file × ${fontCount} fonts)`);
}

// ── PULL LOGOS: Figma Logos page → images/logos/*.svg ────────────

async function pullLogos(token, fileKey) {
  console.log('Pulling logos from Figma...');

  // Get file tree to find the Logos page and its top-level frames
  const file = await figmaGet(token, fileKey, '?depth=2');
  const logosPage = file.document.children.find(p => p.name === 'Logos');
  if (!logosPage) throw new Error('No "Logos" page found in Figma file.');

  const frames = logosPage.children.filter(n => n.type === 'FRAME' && !n.name.startsWith('_'));
  if (frames.length === 0) {
    console.log('No logo frames found on the Logos page (frames starting with _ are skipped).');
    return;
  }

  const ids = frames.map(f => f.id).join(',');
  // Render endpoint is /v1/images/:key (keyed by node id), NOT /v1/files/:key/images (image fills).
  const exportRes = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=svg&svg_include_id=false`,
    { headers: { 'X-Figma-Token': token } },
  ).then(async r => {
    if (!r.ok) throw new Error(`Figma image export → ${r.status}: ${await r.text()}`);
    return r.json();
  });
  const images = exportRes.images;

  const outDir = path.join(__dirname, 'images', 'logos');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const frame of frames) {
    const url = images[frame.id];
    if (!url) { console.warn(`  ⚠ No export URL for "${frame.name}"`); continue; }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download SVG for "${frame.name}": ${res.status}`);
    const svg = await res.text();

    const filename = frame.name.endsWith('.svg') ? frame.name : `${frame.name}.svg`;
    fs.writeFileSync(path.join(outDir, filename), svg);
    console.log(`  ✓ images/logos/${filename}`);
  }

  console.log(`✓ ${frames.length} logo(s) saved to images/logos/`);
}

// ── CLI ───────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];

  if (!command || command === 'help') {
    console.log(`
sync-figma.js — Sync brand.js ↔ Figma

  node sync-figma.js pull         Pull from Figma → update brand.js
  node sync-figma.js push         Push from brand.js → update Figma
  node sync-figma.js pull-logos   Export SVGs from Figma Logos page → images/logos/

Syncs: colors (tokens + palette), typography (family, weight, file), logos (SVG export)

Figma file: https://www.figma.com/design/qfgcG4lTk8FAPUGNEd2N2j
    `);
    return;
  }

  const { figmaToken, figmaFileKey } = loadConfig();

  if (command === 'pull')            await pull(figmaToken, figmaFileKey);
  else if (command === 'push')       await push(figmaToken, figmaFileKey);
  else if (command === 'pull-logos') await pullLogos(figmaToken, figmaFileKey);
  else {
    console.error(`Unknown command: "${command}". Use pull, push, or pull-logos.`);
    process.exit(1);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
