// Generates PWA PNG icons (no native deps) — a rounded dark square with an
// orange "stacked bricks" mark, matching the app accent color.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const DARK = [24, 24, 27, 255]; // zinc-900
const ORANGE = [249, 115, 22, 255]; // orange-500
const WHITE = [250, 250, 250, 255];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawIcon(size, { maskable = false } = {}) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b, a]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };

  const radius = maskable ? 0 : Math.round(size * 0.22);
  const inCorner = (x, y) => {
    const corners = [
      [radius, radius],
      [size - 1 - radius, radius],
      [radius, size - 1 - radius],
      [size - 1 - radius, size - 1 - radius],
    ];
    const inX = x < radius || x > size - 1 - radius;
    const inY = y < radius || y > size - 1 - radius;
    if (!inX || !inY) return false;
    return corners.every(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 > radius ** 2);
  };

  // background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!maskable && inCorner(x, y)) continue; // transparent corner
      set(x, y, DARK);
    }
  }

  const rect = (x0, y0, w, h, color) => {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) set(x, y, color);
    }
  };

  // stacked bricks mark (3 rows, offset like real brickwork)
  const pad = maskable ? size * 0.3 : size * 0.22;
  const markW = size - pad * 2;
  const gap = Math.max(1, Math.round(size * 0.025));
  const rowH = (size - pad * 2 - gap * 2) / 3;
  const y0 = pad;

  // row 1: two bricks
  rect(pad, y0, markW * 0.55 - gap / 2, rowH, ORANGE);
  rect(pad + markW * 0.55 + gap / 2, y0, markW * 0.45 - gap / 2, rowH, ORANGE);
  // row 2: offset, white middle brick
  rect(pad, y0 + rowH + gap, markW * 0.3 - gap / 2, rowH, ORANGE);
  rect(pad + markW * 0.3 + gap / 2, y0 + rowH + gap, markW * 0.4 - gap, rowH, WHITE);
  rect(pad + markW * 0.7 + gap / 2, y0 + rowH + gap, markW * 0.3 - gap / 2, rowH, ORANGE);
  // row 3: two bricks
  rect(pad, y0 + (rowH + gap) * 2, markW * 0.45 - gap / 2, rowH, ORANGE);
  rect(pad + markW * 0.45 + gap / 2, y0 + (rowH + gap) * 2, markW * 0.55 - gap / 2, rowH, ORANGE);

  return encodePng(size, px);
}

const targets = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["icon-maskable-192.png", 192, { maskable: true }],
  ["icon-maskable-512.png", 512, { maskable: true }],
  ["apple-touch-icon.png", 180, { maskable: true }],
];

for (const [name, size, opts] of targets) {
  writeFileSync(join(outDir, name), drawIcon(size, opts));
  console.log(`Generated ${name}`);
}
