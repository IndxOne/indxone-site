import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('**/*.html', {
  ignore: ['node_modules/**', 'dist/**', 'astro/**', '.git/**'],
});

let totalFixes = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  const original = content;

  // Replace raw & not part of valid HTML entities
  // A valid entity: &word; &#digits; &#xHEX;
  content = content.replace(
    /&(?!([a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g,
    '&amp;'
  );

  if (content !== original) {
    const fixes = (content.match(/&amp;/g) || []).length - (original.match(/&amp;/g) || []).length;
    // But the number above counts all &amp; not just replacements. Better to count diffs.
    // Let me just count changes per file from the diff length
    writeFileSync(file, content, 'utf8');
    totalFixes++;
    console.log(`  ${file}: fixed`);
  }
}

console.log(`\nFixed ${totalFixes} file(s)`);
