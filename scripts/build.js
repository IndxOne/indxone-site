const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const { minify } = require("html-minifier-terser");
const { assembleFile } = require("./assemble");

const ROOT = path.join(__dirname, "..");
const HTML_FILES = ["index.html", "404.html"];
const HTML_DIRS = ["collectivites", "projets", "merci", "votre-idee", "accessibilite"];
const HTML_ROUTES = ["mentions-legales", "politique-confidentialite"];
const ASSET_DIRS = ["js", "img", "fonts"];
const ROOT_ASSETS = ["robots.txt", "sitemap.xml", "favicon.svg", "favicon.ico"];
const MINIFY_OPTIONS = {
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeEmptyAttributes: true,
  minifyCSS: true,
  minifyJS: true,
};

function requireSource(source) {
  if (!fs.existsSync(source)) throw new Error(`Source not found: ${source}`);
}

function copyAssets(source, target) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.endsWith(".backup")) continue;
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyAssets(from, to);
    else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

async function buildSite({ root = ROOT, dist = path.join(root, "dist") } = {}) {
  root = path.resolve(root);
  dist = path.resolve(dist);
  if (dist === root || root.startsWith(dist + path.sep)) throw new Error("Output cannot contain the source root");
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  async function html(source, target) {
    requireSource(source);
    if (fs.statSync(source).isDirectory()) {
      for (const entry of fs.readdirSync(source)) {
        if (entry.startsWith(".") || entry.endsWith(".backup")) continue;
        await html(path.join(source, entry), path.join(target, entry));
      }
      return;
    }
    if (!source.endsWith(".html")) return;
    const content = assembleFile(source, root).replace(/\s*<link\s+rel="alternate"\s+hreflang="en"[^>]*>/gi, "");
    const output = await minify(content, MINIFY_OPTIONS);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, output);
  }
  try {
    for (const file of HTML_FILES) await html(path.join(root, file), path.join(dist, file));
    for (const dir of HTML_DIRS) {
      requireSource(path.join(root, dir, "index.html"));
      await html(path.join(root, dir), path.join(dist, dir));
    }
    for (const route of HTML_ROUTES) await html(path.join(root, `${route}.html`), path.join(dist, route, "index.html"));
    requireSource(path.join(root, "js", "main.js"));
    for (const dir of ASSET_DIRS) {
      const source = path.join(root, dir);
      if (fs.existsSync(source)) copyAssets(source, path.join(dist, dir));
    }
    for (const file of ROOT_ASSETS) {
      const source = path.join(root, file);
      if (fs.existsSync(source)) fs.copyFileSync(source, path.join(dist, file));
    }
    const redirects = path.join(root, "_redirects");
    requireSource(redirects);
    fs.writeFileSync(path.join(dist, "_redirects"), assembleFile(redirects, root));

    const source = path.join(root, "css", "style.css");
    requireSource(source);
    const config = require(path.join(root, "postcss.config.js"));
    const plugins = Object.entries(config.plugins).map(([name, options]) => {
      // Resolve content against the source root, independent of process cwd.
      if (name === "@fullhuman/postcss-purgecss") {
        options = { ...options, content: options.content.map((pattern) => path.resolve(root, pattern)) };
      }
      return require(name)(options);
    });
    const target = path.join(dist, "css", "style.css");
    const result = await postcss(plugins).process(fs.readFileSync(source, "utf8"), {
      from: source,
      to: target,
      map: false,
    });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, result.css);
    console.log(`Build complete: ${dist}`);
    return dist;
  } catch (error) {
    // Never leave a partially successful artifact available for deployment.
    fs.rmSync(dist, { recursive: true, force: true });
    throw error;
  }
}

module.exports = { buildSite };
if (require.main === module) {
  buildSite().catch((error) => {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
  });
}
