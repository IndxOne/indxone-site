const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');
const { assembleFile } = require('./assemble');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const HTML_MINIFY_OPTIONS = {
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeEmptyAttributes: true,
  minifyCSS: true,
  minifyJS: true,
};

const COPY_DIRS = ['css', 'js', 'img', 'fonts', '_includes'];
const COPY_FILES = [
  '_redirects',
  'netlify.toml',
  'robots.txt',
  'sitemap.xml',
  'favicon.svg',
  'favicon.ico',
  'startup-launch-kit-bloc.html',
];
const HTML_DIRS = [
  { src: 'collectivites', dest: 'collectivites' },
  { src: 'projets', dest: 'projets' },
  { src: 'merci', dest: 'merci' },
  { src: 'accessibilite', dest: 'accessibilite' },
  { src: 'en', dest: 'en' },
];

const ROOT_HTML = [
  'index.html',
  '404.html',
];

// Ces pages sont générées comme répertoires (src.html → dest/index.html)
// pour que Python http.server les serve sans extension, cohérent avec les autres pages
const ROOT_HTML_AS_DIRS = [
  { src: 'mentions-legales.html',          dest: 'mentions-legales' },
  { src: 'politique-confidentialite.html', dest: 'politique-confidentialite' },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.name.endsWith('.backup')) continue;
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function minifyAndCopyHtml(src, dest, assemble = false) {
  if (!fs.existsSync(src)) return;
  ensureDir(path.dirname(dest));

  if (fs.statSync(src).isDirectory()) {
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry.endsWith('.backup') || entry.startsWith('.')) continue;
      await minifyAndCopyHtml(path.join(src, entry), path.join(dest, entry), assemble);
    }
    return;
  }

  if (!src.endsWith('.html')) return;

  try {
    let content = fs.readFileSync(src, 'utf8');
    if (assemble) {
      const assembled = assembleFile(src);
      if (assembled) content = assembled;
    }
    const minified = await minify(content, HTML_MINIFY_OPTIONS);
    fs.writeFileSync(dest, minified, 'utf8');

    const originalSize = Buffer.byteLength(content, 'utf8');
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    const relPath = path.relative(ROOT, dest);
    console.log(`  ${relPath}  ${(originalSize / 1024).toFixed(1)}K -> ${(minifiedSize / 1024).toFixed(1)}K  (-${reduction}%)`);
  } catch (err) {
    console.error(`  Error processing ${src}: ${err.message}`);
  }
}

async function main() {
  console.log('Building site to dist/\n');

  // Clean dist
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  ensureDir(DIST);

  // Copy HTML files
  console.log('--- HTML ---');
  for (const dir of HTML_DIRS) {
    const srcDir = path.join(ROOT, dir.src);
    const destDir = path.join(DIST, dir.dest);
    if (fs.existsSync(srcDir)) {
      await minifyAndCopyHtml(srcDir, destDir, true);
    }
  }
  for (const file of ROOT_HTML) {
    const src = path.join(ROOT, file);
    const dest = path.join(DIST, file);
    if (fs.existsSync(src)) {
      await minifyAndCopyHtml(src, dest, true);
    }
  }
  for (const { src: srcFile, dest: destDir } of ROOT_HTML_AS_DIRS) {
    const src = path.join(ROOT, srcFile);
    const dest = path.join(DIST, destDir, 'index.html');
    if (fs.existsSync(src)) {
      await minifyAndCopyHtml(src, dest, true);
    }
  }

  // Copy static directories
  console.log('\n--- Assets ---');
  for (const dir of COPY_DIRS) {
    const src = path.join(ROOT, dir);
    const dest = path.join(DIST, dir);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      console.log(`  ${dir}/`);
    }
  }

  // Copy root files
  for (const file of COPY_FILES) {
    const src = path.join(ROOT, file);
    const dest = path.join(DIST, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ${file}`);
    }
  }

  // Build CSS with PostCSS
  console.log('\n--- CSS (PostCSS) ---');
  try {
    const postcss = require('postcss');
    const postcssConfig = require(path.join(ROOT, 'postcss.config.js'));
    const cssContent = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
    const plugins = Object.entries(postcssConfig.plugins).map(([name, opts]) => {
      const plugin = require(name);
      return plugin(opts);
    });
    const result = await postcss(plugins).process(cssContent, { from: path.join(ROOT, 'css/style.css'), to: path.join(DIST, 'css/optimized.css') });
    ensureDir(path.join(DIST, 'css'));
    fs.writeFileSync(path.join(DIST, 'css/optimized.css'), result.css);
    // Overwrite style.css with the optimized bundle (HTML references style.css)
    fs.writeFileSync(path.join(DIST, 'css/style.css'), result.css);
    console.log(`  css/optimized.css  (${(result.css.length / 1024).toFixed(1)}K)`);
  } catch (err) {
    console.error(`  PostCSS build failed: ${err.message}`);
    console.log('  Falling back: copying CSS files as-is');
    copyDir(path.join(ROOT, 'css'), path.join(DIST, 'css'));
  }

  // Copy _redirects with assemble support
  const redirectsSrc = path.join(ROOT, '_redirects');
  if (fs.existsSync(redirectsSrc)) {
    const redirectsDest = path.join(DIST, '_redirects');
    let redirectsContent = fs.readFileSync(redirectsSrc, 'utf8');
    const assembledRedirects = assembleFile ? assembleFile(redirectsSrc) : null;
    if (assembledRedirects) redirectsContent = assembledRedirects;
    fs.writeFileSync(redirectsDest, redirectsContent, 'utf8');
    console.log('  _redirects');
  }

  // Copy optimized.css if exists
  const optCss = path.join(ROOT, 'css/optimized.css');
  if (fs.existsSync(optCss)) {
    ensureDir(path.join(DIST, 'css'));
    fs.copyFileSync(optCss, path.join(DIST, 'css/optimized.css'));
  }

  // Summary
  let totalSize = 0;
  let fileCount = 0;
  function countFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        countFiles(fullPath);
      } else {
        totalSize += fs.statSync(fullPath).size;
        fileCount++;
      }
    }
  }
  countFiles(DIST);

  console.log(`\n✅ Build complete`);
  console.log(`   Files: ${fileCount}`);
  console.log(`   Total size: ${(totalSize / 1024).toFixed(1)}K`);
  console.log(`   Output: dist/`);
}

main().catch(console.error);
