// BRAND-01-V2 — Derive browser, iPhone and home-screen assets from ONE SVG.
// Source is the Site favicon.svg. No image CDN, network access or new dependency.
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const OUTPUTS = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
];

function icoFromPngs(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  for (const [index, size, png] of pngs.map(([size, bytes], i) => [i, size, bytes])) {
    const start = 6 + index * 16;
    header.writeUInt8(size, start); // 0 would represent 256px; max here is 48px.
    header.writeUInt8(size, start + 1);
    header.writeUInt8(0, start + 2);
    header.writeUInt8(0, start + 3);
    header.writeUInt16LE(1, start + 4);
    header.writeUInt16LE(32, start + 6);
    header.writeUInt32LE(png.length, start + 8);
    header.writeUInt32LE(offset, start + 12);
    offset += png.length;
  }
  return Buffer.concat([header, ...pngs.map(([, png]) => png)]);
}

async function generateFavicons({ root, dist }) {
  const source = path.join(root, "favicon.svg");
  if (!fs.existsSync(source)) throw new Error(`Brand favicon source not found: ${source}`);
  const svg = fs.readFileSync(source);
  const imgDir = path.join(dist, "img");
  fs.mkdirSync(imgDir, { recursive: true });
  const icoPngs = [];
  for (const [name, size] of OUTPUTS) {
    const bytes = await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
    fs.writeFileSync(path.join(imgDir, name), bytes);
    if (size <= 48) icoPngs.push([size, bytes]);
  }
  fs.writeFileSync(path.join(dist, "favicon.ico"), icoFromPngs(icoPngs));
}

module.exports = { generateFavicons };
