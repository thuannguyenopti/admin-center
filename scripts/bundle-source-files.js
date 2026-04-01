const fs = require('fs');
const path = require('path');

/**
 * Build script that bundles all source files into a JSON file
 * for the code viewer to access in production.
 */

const appDir = path.join(process.cwd(), 'app');
const outputFile = path.join(process.cwd(), 'public', 'source-bundle.json');

const sourceBundle = {};

function scanDirectory(dir, baseDir = appDir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(process.cwd(), fullPath);

    // Skip node_modules, .next, and other build artifacts
    if (
      relativePath.includes('node_modules') ||
      relativePath.includes('.next') ||
      relativePath.includes('.git') ||
      item.name.startsWith('.')
    ) {
      continue;
    }

    if (item.isDirectory()) {
      scanDirectory(fullPath, baseDir);
    } else if (
      item.name.endsWith('.tsx') ||
      item.name.endsWith('.ts') ||
      item.name.endsWith('.js') ||
      item.name.endsWith('.jsx')
    ) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        sourceBundle[relativePath] = {
          content,
          language: getLanguage(item.name),
        };
        console.log(`✓ Bundled: ${relativePath}`);
      } catch (err) {
        console.warn(`⚠ Skipped: ${relativePath} (${err.message})`);
      }
    }
  }
}

function getLanguage(filename) {
  if (filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.js')) return 'javascript';
  return 'typescript';
}

console.log('🔍 Scanning source files...');
scanDirectory(appDir);

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write bundle
fs.writeFileSync(outputFile, JSON.stringify(sourceBundle, null, 2));

console.log(`\n✅ Source bundle created: ${outputFile}`);
console.log(`📦 Total files: ${Object.keys(sourceBundle).length}`);
console.log(`📊 Bundle size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB\n`);
