// Generates flat-style SVG product illustrations for the catalog, one per
// product slug (referenced from the seed as /images/products/<slug>.svg).
// Run with: npm run images:products
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images", "products");
mkdirSync(outDir, { recursive: true });

const FONT = `font-family="Arial, Helvetica, sans-serif"`;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (c) => {
    const t = f < 0 ? 0 : 255;
    return Math.round((t - c) * Math.abs(f) + c);
  };
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textBlock(lines, cx, startY, { size = 30, fill = "#fff", weight = 700, gap = 1.3 } = {}) {
  return lines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${startY + i * size * gap}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle">${esc(line)}</text>`
    )
    .join("\n  ");
}

// bottom label chip used by templates where the product itself has no packaging text
function chip(color, lines) {
  const h = lines.length > 1 ? 92 : 60;
  const y = 624 - h;
  return `
  <rect x="160" y="${y}" width="320" height="${h}" rx="18" fill="${color}"/>
  ${textBlock(lines, 320, y + 40, { size: 27 })}`;
}

function frame(art, { shadowY = 540, shadowRx = 185 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <rect width="640" height="640" fill="#fafafa"/>
  <rect width="640" height="640" fill="url(#bgGlow)"/>
  <defs>
    <radialGradient id="bgGlow" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f1f1f0"/>
    </radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e4e4e7"/>
      <stop offset="0.5" stop-color="#9ca3af"/>
      <stop offset="1" stop-color="#d1d5db"/>
    </linearGradient>
  </defs>
  <ellipse cx="320" cy="${shadowY}" rx="${shadowRx}" ry="24" fill="#18181b" opacity="0.08"/>
  ${art}
</svg>`;
}

// ---------- templates ----------

// paper sack (cement, mortar, adhesives)
function sack(color, lines, weight) {
  const big = lines.length === 1;
  return frame(`
  <g>
    <rect x="185" y="178" width="270" height="338" rx="10" fill="#f6f4ee" stroke="#ddd8ca" stroke-width="2"/>
    <rect x="185" y="148" width="270" height="34" rx="8" fill="#e7e3d8" stroke="#d3cebf" stroke-width="2"/>
    <line x1="200" y1="165" x2="440" y2="165" stroke="#b9b29e" stroke-width="2" stroke-dasharray="7 6"/>
    <rect x="185" y="486" width="270" height="30" rx="8" fill="#e7e3d8" stroke="#d3cebf" stroke-width="2"/>
    <line x1="200" y1="501" x2="440" y2="501" stroke="#b9b29e" stroke-width="2" stroke-dasharray="7 6"/>
    <path d="M240 182 v300" stroke="#000" opacity="0.04" stroke-width="14"/>
    <path d="M400 182 v300" stroke="#000" opacity="0.04" stroke-width="14"/>
    <rect x="185" y="272" width="270" height="116" fill="${color}"/>
    <rect x="185" y="272" width="270" height="8" fill="${shade(color, -0.25)}"/>
    ${textBlock(lines, 320, big ? 343 : 322, { size: big ? 38 : 29 })}
    <text x="320" y="462" ${FONT} font-size="27" font-weight="600" fill="#6b7280" text-anchor="middle">${esc(weight)}</text>
  </g>`);
}

// plastic bucket / canister (primers, paints, ready-mixed putty)
function bucket(color, lines, sizeLabel) {
  return frame(`
  <g>
    <path d="M205 232 Q320 118 435 232" fill="none" stroke="#9ca3af" stroke-width="9" stroke-linecap="round"/>
    <circle cx="205" cy="232" r="7" fill="#9ca3af"/>
    <circle cx="435" cy="232" r="7" fill="#9ca3af"/>
    <path d="M198 232 L442 232 L414 522 L226 522 Z" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="2"/>
    <path d="M210 232 L240 232 L252 522 L226 522 Z" fill="#fff" opacity="0.6"/>
    <rect x="190" y="206" width="260" height="30" rx="12" fill="${shade(color, -0.2)}"/>
    <rect x="198" y="212" width="244" height="8" rx="4" fill="#fff" opacity="0.25"/>
    <rect x="240" y="276" width="160" height="184" rx="12" fill="#fff" stroke="#e4e4e7" stroke-width="2"/>
    <path d="M240 288 a12 12 0 0 1 12 -12 h136 a12 12 0 0 1 12 12 v44 h-160 Z" fill="${color}"/>
    ${textBlock([lines[0]], 320, 312, { size: 24 })}
    ${textBlock(lines.slice(1), 320, 370, { size: 20, fill: "#3f3f46" })}
    <text x="320" y="440" ${FONT} font-size="26" font-weight="700" fill="${color}" text-anchor="middle">${esc(sizeLabel)}</text>
  </g>`);
}

// flat sheet leaning slightly (drywall, OSB, plywood)
function board(face, edge, label, { flakes = false, stripe = null } = {}) {
  let texture = "";
  if (flakes) {
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const bits = [];
    for (let i = 0; i < 90; i++) {
      const x = 185 + rnd() * 260;
      const y = 95 + rnd() * 380;
      const w = 14 + rnd() * 26;
      const h = 5 + rnd() * 9;
      const rot = rnd() * 180;
      const tone = rnd() > 0.5 ? shade(face, -0.22) : shade(face, 0.28);
      bits.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${tone}" opacity="0.8" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`
      );
    }
    texture = `<g clip-path="url(#sheetClip)">${bits.join("")}</g>`;
  }
  const stripeArt = stripe
    ? `<rect x="170" y="86" width="300" height="26" fill="${stripe}" clip-path="url(#sheetClip)"/>`
    : "";
  return frame(`
  <defs>
    <clipPath id="sheetClip"><rect x="170" y="86" width="300" height="400" rx="6"/></clipPath>
  </defs>
  <g transform="rotate(-13 320 290)">
    <rect x="186" y="100" width="300" height="400" rx="6" fill="${shade(face, -0.3)}"/>
  </g>
  <g transform="rotate(-5 320 290)">
    <rect x="170" y="86" width="300" height="400" rx="6" fill="${face}" stroke="${edge}" stroke-width="2"/>
    ${texture}
    ${stripeArt}
  </g>
  ${chip(label.color, label.lines)}`, { shadowY: 508 });
}

// long bars at an angle (metal profiles, corner bead, timber)
function bars(fill, label, { grain = false, inner = true } = {}) {
  const bar = (y) => `
    <rect x="70" y="${y}" width="500" height="32" rx="5" fill="${fill}"/>
    ${inner ? `<rect x="70" y="${y + 10}" width="500" height="9" rx="4" fill="#52525b" opacity="0.25"/>` : ""}
    ${grain ? `<path d="M80 ${y + 8} h480 M90 ${y + 22} h460" stroke="#7c4a1e" stroke-width="2.5" opacity="0.5" fill="none"/>` : ""}`;
  return frame(`
  <g transform="rotate(-24 320 290)">
    ${bar(230)}
    ${bar(282)}
    ${bar(334)}
  </g>
  ${chip(label.color, label.lines)}`, { shadowY: 506 });
}

// isometric masonry block (BCA, brick)
function block(base, label, { holes = false, grooves = false, stack = false } = {}) {
  const one = (x, y, s = 1) => {
    const w = 200 * s, h = 165 * s, dx = 80 * s, dy = 52 * s;
    let detail = "";
    if (holes) {
      detail = [0, 1, 2]
        .map((i) => {
          const hx = x + 34 * s + i * 56 * s;
          return `<path d="M${hx} ${y - dy + 18 * s} l${44 * s} 0 l${-14 * s} ${dy - 28 * s} l${-44 * s} 0 Z" fill="${shade(base, -0.45)}"/>`;
        })
        .join("");
    }
    if (grooves) {
      detail = `<path d="M${x + 8 * s} ${y + 44 * s} h${w - 16 * s} M${x + 8 * s} ${y + 88 * s} h${w - 16 * s}" stroke="${shade(base, -0.12)}" stroke-width="3" fill="none"/>`;
    }
    return `
    <path d="M${x} ${y} l${dx} ${-dy} h${w} l${-dx} ${dy} Z" fill="${shade(base, 0.35)}" stroke="${shade(base, -0.18)}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${base}" stroke="${shade(base, -0.18)}" stroke-width="2"/>
    <path d="M${x + w} ${y} l${dx} ${-dy} v${h} l${-dx} ${dy} Z" fill="${shade(base, -0.22)}" stroke="${shade(base, -0.3)}" stroke-width="2"/>
    ${detail}`;
  };
  const art = stack
    ? `
    <rect x="130" y="478" width="390" height="20" rx="4" fill="#a16207"/>
    <rect x="150" y="498" width="34" height="16" fill="#854d0e"/>
    <rect x="420" y="498" width="34" height="16" fill="#854d0e"/>
    ${one(160, 318, 0.82)}
    ${one(340, 318, 0.82)}
    ${one(250, 188, 0.82)}`
    : one(210, 270, 1.05);
  return frame(`${art}${chip(label.color, label.lines)}`, { shadowY: 512 });
}

// lying roll (foil, membrane, mesh)
function roll(color, label) {
  return frame(`
  <g>
    <ellipse cx="190" cy="320" rx="28" ry="98" fill="${shade(color, -0.3)}"/>
    <rect x="190" y="222" width="240" height="196" fill="${color}"/>
    <rect x="190" y="222" width="240" height="34" fill="#fff" opacity="0.22"/>
    <ellipse cx="430" cy="320" rx="34" ry="98" fill="${shade(color, 0.55)}"/>
    <ellipse cx="430" cy="320" rx="22" ry="64" fill="none" stroke="${shade(color, -0.15)}" stroke-width="5"/>
    <ellipse cx="430" cy="320" rx="11" ry="32" fill="${shade(color, -0.5)}"/>
  </g>
  ${chip(label.color, label.lines)}`, { shadowY: 470, shadowRx: 165 });
}

// front-facing tape roll with unrolled strip
function tapeRoll(color, label) {
  return frame(`
  <g>
    <path d="M320 392 h210 v44 h-210 Z" fill="${shade(color, 0.4)}" stroke="${shade(color, -0.2)}" stroke-width="2"/>
    <circle cx="300" cy="290" r="146" fill="${color}" stroke="${shade(color, -0.2)}" stroke-width="3"/>
    <circle cx="300" cy="290" r="62" fill="#fafafa" stroke="${shade(color, -0.25)}" stroke-width="3"/>
    <path d="M300 144 a146 146 0 0 1 146 146" fill="none" stroke="#fff" stroke-width="8" opacity="0.5"/>
  </g>
  ${chip(label.color, label.lines)}`, { shadowY: 472, shadowRx: 170 });
}

// cardboard box (screws, dowels, nails)
function box(accent, lines) {
  return frame(`
  <g>
    <path d="M180 256 L240 206 L520 206 L460 256 Z" fill="#dcc193"/>
    <path d="M340 256 L400 206 L420 206 L360 256 Z" fill="#c9a36b"/>
    <rect x="180" y="256" width="280" height="210" fill="#c9a36b"/>
    <path d="M460 256 L520 206 L520 416 L460 466 Z" fill="#a87f4b"/>
    <path d="M348 206 h24 v50 h-24 Z" fill="#e7e0d2" opacity="0.9"/>
    <rect x="208" y="286" width="224" height="150" rx="10" fill="#fff"/>
    <path d="M208 298 a10 10 0 0 1 10 -10 h204 a10 10 0 0 1 10 10 v36 h-224 Z" fill="${accent}"/>
    ${textBlock([lines[0]], 320, 318, { size: 21 })}
    ${textBlock(lines.slice(1), 320, 372, { size: 22, fill: "#3f3f46" })}
  </g>`, { shadowY: 500 });
}

// aerosol can (PU foam)
function can(color, lines) {
  return frame(`
  <g>
    <rect x="296" y="142" width="48" height="36" rx="8" fill="#71717a"/>
    <rect x="338" y="148" width="58" height="12" rx="6" fill="#52525b" transform="rotate(-18 338 154)"/>
    <rect x="282" y="174" width="76" height="26" rx="10" fill="#d4d4d8"/>
    <path d="M260 214 a60 24 0 0 1 120 0 Z" fill="${shade(color, 0.25)}"/>
    <rect x="260" y="212" width="120" height="296" rx="14" fill="${color}"/>
    <rect x="272" y="212" width="18" height="296" fill="#fff" opacity="0.3"/>
    <rect x="260" y="296" width="120" height="142" fill="#fff"/>
    ${textBlock([lines[0]], 320, 332, { size: 20, fill: color })}
    ${textBlock(lines.slice(1), 320, 364, { size: 19, fill: "#3f3f46" })}
    <ellipse cx="320" cy="508" rx="60" ry="10" fill="${shade(color, -0.3)}"/>
  </g>`);
}

// sealant / chemical anchor cartridge
function cartridge(color, lines) {
  return frame(`
  <g transform="rotate(-12 320 340)">
    <rect x="138" y="288" width="20" height="104" rx="7" fill="#52525b"/>
    <rect x="156" y="282" width="270" height="116" rx="14" fill="#fff" stroke="#d4d4d8" stroke-width="2"/>
    <rect x="156" y="282" width="64" height="116" rx="14" fill="${color}"/>
    <rect x="206" y="282" width="14" height="116" fill="${color}"/>
    <path d="M426 304 L480 322 L480 358 L426 376 Z" fill="${shade(color, -0.25)}"/>
    <rect x="478" y="330" width="62" height="20" rx="9" fill="#d4d4d8"/>
    ${textBlock([lines[0]], 332, 326, { size: 25, fill: color })}
    ${textBlock(lines.slice(1), 332, 360, { size: 18, fill: "#3f3f46" })}
  </g>`, { shadowY: 470, shadowRx: 175 });
}

// stacked insulation panels (EPS, XPS, mineral wool)
function panels(base, label) {
  const panel = (y) => `
    <path d="M170 ${y} l64 -42 h240 l-64 42 Z" fill="${shade(base, 0.4)}" stroke="${shade(base, -0.15)}" stroke-width="2"/>
    <rect x="170" y="${y}" width="240" height="40" fill="${base}" stroke="${shade(base, -0.15)}" stroke-width="2"/>
    <path d="M410 ${y} l64 -42 v40 l-64 42 Z" fill="${shade(base, -0.18)}" stroke="${shade(base, -0.25)}" stroke-width="2"/>`;
  return frame(`
  <g>
    ${panel(440)}
    ${panel(384)}
    ${panel(328)}
  </g>
  ${chip(label.color, label.lines)}`, { shadowY: 504 });
}

// ---------- catalog ----------
const IMAGES = {
  // ciment și mortare
  "ciment-holcim-structo-plus-40kg": sack("#dc2626", ["CIMENT", "STRUCTO PLUS"], "40 kg"),
  "mortar-zidarie-m10-40kg": sack("#d97706", ["MORTAR", "ZIDĂRIE M10"], "40 kg"),
  "sapa-autonivelanta-25kg": sack("#7c3aed", ["ȘAPĂ", "AUTONIVELANTĂ"], "25 kg"),
  "var-hidratat-20kg": sack("#16a34a", ["VAR HIDRATAT"], "20 kg"),
  "ciment-alb-25kg": sack("#52525b", ["CIMENT ALB", "CEM I 52,5R"], "25 kg"),
  // adezivi și gleturi
  "adeziv-gresie-faianta-ceresit-cm9-25kg": sack("#2563eb", ["ADEZIV CM9", "GRESIE·FAIANȚĂ"], "25 kg"),
  "adeziv-flexibil-c2te-25kg": sack("#0891b2", ["ADEZIV FLEX", "C2TE"], "25 kg"),
  "glet-interior-knauf-super-finish-20kg": bucket("#0284c7", ["GLET", "Super Finish", "gata preparat"], "20 kg"),
  "adeziv-polistiren-baumit-procontact-25kg": sack("#e11d48", ["ADEZIV EPS", "PROCONTACT"], "25 kg"),
  // gips-carton și profile
  "placa-gips-carton-rigips-rb-125mm": board("#e4e4e7", "#a1a1aa", { color: "#3b82f6", lines: ["GIPS-CARTON RB", "12,5 mm"] }, { stripe: "#3b82f6" }),
  "profil-cd-60-3m": bars("url(#metal)", { color: "#52525b", lines: ["PROFIL CD 60", "3 m"] }),
  "profil-ud-28-3m": bars("url(#metal)", { color: "#52525b", lines: ["PROFIL UD 28", "3 m"] }),
  "banda-imbinare-rigips-90m": tapeRoll("#e7e5e4", { color: "#3b82f6", lines: ["BANDĂ ROSTURI", "90 m"] }),
  "coltar-aluminiu-25x25-3m": bars("url(#metal)", { color: "#64748b", lines: ["COLȚAR ALUMINIU", "25×25 · 3 m"] }, { inner: false }),
  // zidărie
  "bca-ytong-nf": block("#f1f0ec", { color: "#0ea5e9", lines: ["BCA YTONG NF"] }, { grooves: true }),
  "caramida-porotherm-25-nf": block("#c2410c", { color: "#9a3412", lines: ["POROTHERM 25", "N+F"] }, { holes: true }),
  "bca-palet-complet": block("#f1f0ec", { color: "#0ea5e9", lines: ["BCA PALET", "60 buc"] }, { grooves: true, stack: true }),
  // lemn și plăci
  "osb3-12mm": board("#d9a45f", "#a16207", { color: "#92400e", lines: ["OSB3", "12 mm"] }, { flakes: true }),
  "osb3-18mm": board("#d9a45f", "#a16207", { color: "#92400e", lines: ["OSB3", "18 mm"] }, { flakes: true }),
  "cherestea-rasinoase-5x10-4m": bars("#c08552", { color: "#92400e", lines: ["GRINDĂ 5×10", "4 m"] }, { grain: true, inner: false }),
  "placaj-tego-18mm": board("#6b4226", "#3f2310", { color: "#7c2d12", lines: ["PLACAJ TEGO", "18 mm"] }),
  // izolații
  "polistiren-eps-80-10cm": panels("#f4f4f5", { color: "#0ea5e9", lines: ["EPS 80", "10 cm"] }),
  "polistiren-xps-5cm": panels("#f9a8d4", { color: "#db2777", lines: ["XPS", "5 cm"] }),
  "vata-minerala-bazaltica-10cm": panels("#b5a878", { color: "#65a30d", lines: ["VATĂ BAZALTICĂ", "10 cm"] }),
  "folie-anticondens": roll("#3b82f6", { color: "#1d4ed8", lines: ["FOLIE", "ANTICONDENS"] }),
  "membrana-bituminoasa-ardezie": roll("#44403c", { color: "#292524", lines: ["MEMBRANĂ", "BITUMINOASĂ"] }),
  "plasa-fibra-sticla-160g": roll("#fbbf24", { color: "#d97706", lines: ["PLASĂ FIBRĂ", "160 g/mp"] }),
  // organe de asamblare
  "suruburi-rigips-35x25": box("#334155", ["ȘURUBURI RIGIPS", "3,5 × 25 mm", "1000 buc"]),
  "dibluri-fatada-10x160": box("#ea580c", ["DIBLURI FAȚADĂ", "10 × 160 mm", "100 buc"]),
  "cuie-constructii-100mm-5kg": box("#57534e", ["CUIE CONSTRUCȚII", "100 mm", "5 kg"]),
  "ancora-chimica-300ml": cartridge("#dc2626", ["ANCORĂ", "CHIMICĂ · 300 ml"]),
  // chimice și consumabile
  "silicon-universal-280ml": cartridge("#2563eb", ["SILICON", "UNIVERSAL · 280 ml"]),
  "spuma-poliuretanica-pistol-750ml": can("#eab308", ["SPUMĂ PU", "PISTOL", "750 ml"]),
  "amorsa-perete-10l": bucket("#4f46e5", ["AMORSĂ", "universală", "perete"], "10 L"),
  "amorsa-profunzime-5l": bucket("#0d9488", ["AMORSĂ", "de profunzime"], "5 L"),
  "vopsea-lavabila-15l": bucket("#ea580c", ["VOPSEA", "lavabilă", "interior"], "15 L"),
};

for (const [slug, svg] of Object.entries(IMAGES)) {
  writeFileSync(join(outDir, `${slug}.svg`), svg);
}
console.log(`Generated ${Object.keys(IMAGES).length} product images in public/images/products/`);
