#!/usr/bin/env node
/**
 * Converts every palette colour in brand.js from RGB to CMYK using a
 * real ICC printer profile, and writes the result back into the config.
 *
 *   npm run convert-cmyk
 *   npm run convert-cmyk -- --profile "/path/to/Profile.icc"
 *   npm run convert-cmyk -- --dry-run
 *
 * Why this exists, rather than a formula:
 *
 * The book used to derive CMYK arithmetically, K = 1 - max(R,G,B) and so on.
 * That treats ink as inverted light, which no press does. It round-trips through
 * its own inverse perfectly, so it always looked self-consistent, and it is
 * wrong in a way nothing catches. Measured: RGB 116,251,215 computed to
 * C54 M0 Y14 K2, where the real build is C43 M0 Y29 K0. Too much cyan, not
 * enough yellow, and 2% black that should not be there. A printer handed those
 * numbers prints a different colour. `color-convert` is the identical formula,
 * so swapping libraries changes nothing.
 *
 * Real conversion needs a profile and a colour engine. This shells out to
 * littleCMS through Python's Pillow, which is the same engine Illustrator-class
 * tools use, against an ICC profile on disk. Verified against a designer's own
 * value: US Web Coated (SWOP) v2 at relative colorimetric returns C44 M0 Y29 K0
 * for that colour, matching to within rounding.
 *
 * It runs at setup rather than in the browser because littleCMS cannot run in
 * the page. The values are stored in the config so the guidelines and the PDF
 * both show a build a printer can actually use.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { execFileSync } from 'child_process'
import path from 'path'
import os from 'os'

const CONFIG = path.resolve('brand.js')

/** Where US Web Coated (SWOP) v2 usually lives. First hit wins. */
const PROFILE_HINTS = [
  // Affinity ships SWOP too, and is often the only place it exists on a Mac
  // without Creative Cloud installed.
  '/Applications/Affinity.app/Contents/Resources/USWebCoatedSWOP.icc',
  '/Library/Application Support/Adobe/Color/Profiles/Recommended/USWebCoatedSWOP.icc',
  '/Library/Application Support/Adobe/Color/Profiles/USWebCoatedSWOP.icc',
  `${os.homedir()}/Library/ColorSync/Profiles/USWebCoatedSWOP.icc`,
  '/System/Library/ColorSync/Profiles/Generic CMYK Profile.icc',
]

function findProfile(explicit) {
  if (explicit) {
    if (!existsSync(explicit)) throw new Error(`profile not found: ${explicit}`)
    return explicit
  }
  const hit = PROFILE_HINTS.find(p => existsSync(p))
  if (!hit) {
    throw new Error(
      'no CMYK profile found. Pass one with --profile "/path/to/USWebCoatedSWOP.icc".\n' +
      'Installing Adobe Creative Cloud puts it in /Library/Application Support/Adobe/Color/Profiles/.',
    )
  }
  return hit
}

/** hex -> [c,m,y,k] via littleCMS. Batched: one python call for the palette. */
function convert(hexes, profile) {
  const py = `
import sys, json
from PIL import Image, ImageCms
profile = sys.argv[1]
hexes = json.loads(sys.argv[2])
src = ImageCms.createProfile('sRGB')
dst = ImageCms.getOpenProfile(profile)
# Relative colorimetric: matches what a designer gets converting in Illustrator
# with the same profile. Verified against a known reference build.
# Relative colorimetric with black point compensation: Photoshop's and
# Illustrator's default Convert to Profile settings, so these are the numbers a
# designer gets by hand. Verified against a designer's own value: RGB
# 116,251,215 returns C43 M0 Y29 K0, matching exactly.
BPC = getattr(getattr(ImageCms, 'Flags', None), 'BLACKPOINTCOMPENSATION', 8192)
tf = ImageCms.buildTransform(src, dst, 'RGB', 'CMYK', renderingIntent=1, flags=BPC)
out = {}
for h in hexes:
    s = h.lstrip('#')
    rgb = tuple(int(s[i:i+2], 16) for i in (0, 2, 4))
    c, m, y, k = ImageCms.applyTransform(Image.new('RGB', (1, 1), rgb), tf).getpixel((0, 0))
    out[h] = [round(c/255*100), round(m/255*100), round(y/255*100), round(k/255*100)]
print(json.dumps(out))
`
  try {
    const raw = execFileSync('python3', ['-c', py, profile, JSON.stringify(hexes)], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
    return JSON.parse(raw)
  } catch (e) {
    const msg = String(e.stderr || e.message)
    if (/No module named ['"]?PIL/.test(msg)) {
      throw new Error('Pillow is not installed. Run: python3 -m pip install --user Pillow')
    }
    throw new Error(`conversion failed: ${msg.trim().split('\n').pop()}`)
  }
}

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
// Automatic runs (prebuild, setup) use --if-available: a machine without Python,
// Pillow or a profile should warn and carry on with the committed values, not
// fail the build. A direct `npm run convert-cmyk` stays strict.
const ifAvailable = argv.includes('--if-available')
const pIdx = argv.indexOf('--profile')

let profile
try {
  profile = findProfile(pIdx !== -1 ? argv[pIdx + 1] : undefined)
} catch (e) {
  if (!ifAvailable) { console.error(`[cmyk] ${e.message}`); process.exit(1) }
  console.warn(`[cmyk] skipped: ${e.message.split('\n')[0]}`)
  console.warn('[cmyk] existing values in brand.config.ts are unchanged.')
  process.exit(0)
}

let src = readFileSync(CONFIG, 'utf8')

// Palette entries are one object per line: { name: '…', hex: '#…', … },
// Names are space-padded for alignment, so allow run of spaces before `hex:`.
const LINE = /^(\s*\{ name: "[^"]*",\s*hex: ")(#[0-9A-Fa-f]{6})(")(.*?)(\},)[ \t]*$/gm
const hexes = [...new Set([...src.matchAll(LINE)].map(m => m[2].toUpperCase()))]
if (!hexes.length) {
  console.error('[cmyk] found no palette entries in brand.js')
  process.exitCode = 1
} else {
  let table
  try {
    table = convert(hexes, profile)
  } catch (e) {
    if (!ifAvailable) { console.error(`[cmyk] ${e.message}`); process.exit(1) }
    console.warn(`[cmyk] skipped: ${e.message}`)
    console.warn('[cmyk] existing values in brand.config.ts are unchanged.')
    process.exit(0)
  }
  let changed = 0

  src = src.replace(LINE, (line, head, hex, q, rest, tail) => {
    const v = table[hex.toUpperCase()]
    if (!v) return line
    // Drop any previous cmyk, then append the fresh one.
    const cleaned = rest.replace(/,\s*cmyk:\s*\[[^\]]*\]/, '')
    changed++
    return `${head}${hex}${q}${cleaned.replace(/\s*$/, '')}, cmyk: [${v.join(', ')}] ${tail}`
  })

  console.log(`[cmyk] profile: ${path.basename(profile)}`)
  console.log(`[cmyk] intent:  relative colorimetric, black point compensation`)
  // The profile IS the answer. Generic CMYK and US Web Coated (SWOP) v2 return
  // materially different builds for the same colour: one mint measured C34 M0
  // Y22 K0 against Generic and C44 M0 Y29 K0 against SWOP, and the designer's
  // own value was C43. Say which one produced these numbers.
  if (/generic/i.test(path.basename(profile))) {
    console.warn('[cmyk] ! this is the macOS Generic CMYK profile, not a press profile.')
    console.warn('[cmyk] ! Install Adobe Creative Cloud, or pass --profile "/path/to/USWebCoatedSWOP.icc",')
    console.warn('[cmyk] ! to match what a designer gets converting in Illustrator.')
  }
  for (const h of hexes) console.log(`  ${h}  ->  C${table[h][0]} M${table[h][1]} Y${table[h][2]} K${table[h][3]}`)

  if (dryRun) {
    console.log('\n[cmyk] --dry-run, nothing written.')
  } else {
    writeFileSync(CONFIG, src)
    console.log(`\n[cmyk] wrote ${changed} colour(s) into brand.js`)
  }
}
