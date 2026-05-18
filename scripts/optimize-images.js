const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'img');

async function convertWithSharp() {
  const sharp = require('sharp');
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.png'));
  const results = [];

  for (const file of files) {
    const inputPath = path.join(IMG_DIR, file);
    const outputName = file.replace(/\.png$/, '.webp');
    const outputPath = path.join(IMG_DIR, outputName);

    if (fs.existsSync(outputPath)) {
      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      results.push({ file: outputName, inputSize, outputSize, skipped: true });
      continue;
    }

    const inputSize = fs.statSync(inputPath).size;
    const metadata = await sharp(inputPath).metadata();
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    const outputSize = fs.statSync(outputPath).size;

    results.push({ file: outputName, inputSize, outputSize, skipped: false, width: metadata.width, height: metadata.height });
  }

  return results;
}

function convertWithCwebp() {
  const { execSync } = require('child_process');
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.png'));
  const results = [];

  for (const file of files) {
    const inputPath = path.join(IMG_DIR, file);
    const outputName = file.replace(/\.png$/, '.webp');
    const outputPath = path.join(IMG_DIR, outputName);

    if (fs.existsSync(outputPath)) {
      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      results.push({ file: outputName, inputSize, outputSize, skipped: true });
      continue;
    }

    const inputSize = fs.statSync(inputPath).size;
    execSync(`cwebp -q 80 "${inputPath}" -o "${outputPath}"`, { stdio: 'ignore' });
    const outputSize = fs.statSync(outputPath).size;
    results.push({ file: outputName, inputSize, outputSize, skipped: false });
  }

  return results;
}

function convertWithFfmpeg() {
  const { execSync } = require('child_process');
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.png'));
  const results = [];

  for (const file of files) {
    const inputPath = path.join(IMG_DIR, file);
    const outputName = file.replace(/\.png$/, '.webp');
    const outputPath = path.join(IMG_DIR, outputName);

    if (fs.existsSync(outputPath)) {
      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      results.push({ file: outputName, inputSize, outputSize, skipped: true });
      continue;
    }

    const inputSize = fs.statSync(inputPath).size;
    execSync(`ffmpeg -i "${inputPath}" -q:v 80 "${outputPath}" -y`, { stdio: 'ignore' });
    const outputSize = fs.statSync(outputPath).size;
    results.push({ file: outputName, inputSize, outputSize, skipped: false });
  }

  return results;
}

function pictureElement(pngPath, webpPath, alt, className) {
  const imgSrc = pngPath.startsWith('/') ? pngPath : '/' + pngPath;
  const webpSrc = webpPath.startsWith('/') ? webpPath : '/' + webpPath;
  const cls = className ? ` class="${className}"` : '';
  return `<picture${cls}>
  <source srcset="${webpSrc}" type="image/webp">
  <img src="${imgSrc}" alt="${alt}"${cls} loading="lazy">
</picture>`;
}

async function main() {
  console.log('Optimizing images...\n');

  let results;
  try {
    require.resolve('sharp');
    console.log('Using sharp for conversion\n');
    results = await convertWithSharp();
  } catch {
    try {
      require('child_process').execSync('which cwebp', { stdio: 'ignore' });
      console.log('Using cwebp for conversion\n');
      results = convertWithCwebp();
    } catch {
      try {
        require('child_process').execSync('which ffmpeg', { stdio: 'ignore' });
        console.log('Using ffmpeg for conversion\n');
        results = convertWithFfmpeg();
      } catch {
        console.error('No conversion tool found. Install sharp, cwebp, or ffmpeg.');
        process.exit(1);
      }
    }
  }

  let totalInput = 0;
  let totalOutput = 0;

  for (const r of results) {
    const savings = ((1 - r.outputSize / r.inputSize) * 100).toFixed(1);
    const inputKb = (r.inputSize / 1024).toFixed(1);
    const outputKb = (r.outputSize / 1024).toFixed(1);
    const dims = r.width ? ` (${r.width}x${r.height})` : '';
    const status = r.skipped ? 'SKIP' : ' OK ';
    console.log(`[${status}] ${r.file}${dims}`);
    console.log(`       ${inputKb}K → ${outputKb}K  (${savings}% savings)`);
    totalInput += r.inputSize;
    totalOutput += r.outputSize;
  }

  const totalSavings = ((1 - totalOutput / totalInput) * 100).toFixed(1);
  console.log(`\nTotal: ${(totalInput / 1024).toFixed(1)}K → ${(totalOutput / 1024).toFixed(1)}K (${totalSavings}% savings)`);

  console.log('\n--- Picture element generator ---');
  console.log("Import with: const { pictureElement } = require('./scripts/optimize-images.js');");
  console.log('Usage: pictureElement("img/icon-ix.png", "img/icon-ix.webp", "INDXONE icon", "my-class")');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { pictureElement };
