const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INCLUDES_DIR = path.join(ROOT, '_includes');
const INCLUDE_RE = /<!--#include\s+file="([^"]+)"\s*-->/g;

function resolveIncludePath(filePath) {
  if (filePath.startsWith('_includes/')) {
    return path.join(ROOT, filePath);
  }
  return path.join(ROOT, filePath);
}

function assemble(content, filePath, depth = 0) {
  if (depth > 5) {
    console.error(`  [assemble] Max include depth reached in ${filePath}`);
    return content;
  }
  return content.replace(INCLUDE_RE, (match, includeFile) => {
    const includePath = resolveIncludePath(includeFile);
    if (!fs.existsSync(includePath)) {
      console.warn(`  [assemble] Include not found: ${includeFile} (referenced in ${filePath})`);
      return `<!-- Include not found: ${includeFile} -->`;
    }
    const includeContent = fs.readFileSync(includePath, 'utf8');
    return assemble(includeContent, includePath, depth + 1);
  });
}

function assembleFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!INCLUDE_RE.test(content)) return content;
  INCLUDE_RE.lastIndex = 0;
  return assemble(content, filePath);
}

function assembleDir(srcDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    if (entry.endsWith('.backup') || entry.startsWith('.')) continue;
    const fullPath = path.join(srcDir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      assembleDir(fullPath);
    } else if (entry.endsWith('.html')) {
      const assembled = assembleFile(fullPath);
      if (assembled !== null) {
        fs.writeFileSync(fullPath, assembled, 'utf8');
      }
    }
  }
}

module.exports = { assemble, assembleFile, assembleDir };

if (require.main === module) {
  console.log('Assembling HTML includes...');
  const rootHtml = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  for (const file of rootHtml) {
    const fullPath = path.join(ROOT, file);
    const assembled = assembleFile(fullPath);
    if (assembled) {
      fs.writeFileSync(fullPath, assembled, 'utf8');
      console.log(`  ${file}`);
    }
  }
  const htmlDirs = ['collectivites', 'projets', 'merci', 'en', 'accessibilite'];
  for (const dir of htmlDirs) {
    const dirPath = path.join(ROOT, dir);
    if (fs.existsSync(dirPath)) {
      assembleDir(dirPath);
    }
  }
  console.log('Done.');
}
