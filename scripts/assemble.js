const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INCLUDE_RE = /<!--#include\s+file="([^"]+)"\s*-->/g;

function resolveIncludePath(filePath, root) {
  const resolved = path.resolve(root, filePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`Include outside site root: ${filePath}`);
  }
  return resolved;
}

function assemble(content, filePath, depth = 0, root = ROOT) {
  if (depth > 5) {
    throw new Error(`Max include depth reached in ${filePath}`);
  }
  return content.replace(INCLUDE_RE, (match, includeFile) => {
    const includePath = resolveIncludePath(includeFile, root);
    if (!fs.existsSync(includePath)) {
      throw new Error(`Include not found: ${includeFile} (referenced in ${filePath})`);
    }
    const includeContent = fs.readFileSync(includePath, "utf8");
    return assemble(includeContent, includePath, depth + 1, root);
  });
}

function assembleFile(filePath, root = ROOT) {
  if (!fs.existsSync(filePath)) throw new Error(`Source not found: ${filePath}`);
  const content = fs.readFileSync(filePath, "utf8");
  return assemble(content, filePath, 0, root);
}

function assembleDir(srcDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    if (entry.endsWith(".backup") || entry.startsWith(".")) continue;
    const fullPath = path.join(srcDir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      assembleDir(fullPath);
    } else if (entry.endsWith(".html")) {
      const assembled = assembleFile(fullPath);
      if (assembled !== null) {
        fs.writeFileSync(fullPath, assembled, "utf8");
      }
    }
  }
}

module.exports = { assemble, assembleFile, assembleDir };

if (require.main === module) {
  console.log("Assembling HTML includes...");
  const rootHtml = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  for (const file of rootHtml) {
    const fullPath = path.join(ROOT, file);
    const assembled = assembleFile(fullPath);
    if (assembled) {
      fs.writeFileSync(fullPath, assembled, "utf8");
      console.log(`  ${file}`);
    }
  }
  const htmlDirs = ["collectivites", "projets", "merci", "en", "accessibilite"];
  for (const dir of htmlDirs) {
    const dirPath = path.join(ROOT, dir);
    if (fs.existsSync(dirPath)) {
      assembleDir(dirPath);
    }
  }
  console.log("Done.");
}
