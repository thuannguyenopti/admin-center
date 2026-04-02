#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = '/Users/david.steinberg/Documents/axiom-play';
const inputDir = path.join(projectRoot, 'app/cmp/coda/Image-Gen-Editing');
const outputFile = path.join(inputDir, 'README.md');

// Read all content pages
const contentFiles = [1, 2, 3, 4].map(n =>
  path.join(inputDir, `q2-epics-content-page-${n}.json`)
);

let allItems = [];

contentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.items) {
      allItems = allItems.concat(data.items);
    }
  }
});

// Convert to markdown
let markdown = '# Q2 Epics & Features\n\n';
markdown += '*Fetched from Coda: Opal Platform → Q2 Epics & Features*\n\n';
markdown += '---\n\n';

let currentHeading = '';
let inImageSection = false;

allItems.forEach((item, index) => {
  const content = item.itemContent?.content || '';
  const style = item.itemContent?.style || 'paragraph';
  const level = item.itemContent?.lineLevel || 0;

  if (!content.trim()) {
    markdown += '\n';
    return;
  }

  // Track if we're in the Image/Video section
  if (content.match(/Image.*Video|Image Gen|Video Gen/i)) {
    inImageSection = true;
  }

  switch (style) {
    case 'heading1':
      markdown += `# ${content}\n\n`;
      currentHeading = content;
      break;
    case 'heading2':
      markdown += `## ${content}\n\n`;
      break;
    case 'heading3':
      markdown += `### ${content}\n\n`;
      break;
    case 'bulletedList':
      const indent = '  '.repeat(level);
      markdown += `${indent}- ${content}\n`;
      break;
    case 'numberedList':
      const numIndent = '  '.repeat(level);
      markdown += `${numIndent}1. ${content}\n`;
      break;
    case 'code':
      markdown += `\`\`\`\n${content}\n\`\`\`\n\n`;
      break;
    default:
      if (content.trim()) {
        markdown += `${content}\n\n`;
      }
  }
});

// Write markdown file
fs.writeFileSync(outputFile, markdown);
console.log(`✓ Converted content to ${outputFile}`);
console.log(`  Total items processed: ${allItems.length}`);

// Also create a focused Image Gen/Editing file
const imageGenContent = [];
let capturing = false;
let captureDepth = 0;

allItems.forEach((item, index) => {
  const content = item.itemContent?.content || '';

  // Start capturing at "Image / Video" section
  if (content.match(/^Image.*\/ Video$/i)) {
    capturing = true;
    captureDepth = 0;
  }

  // Stop capturing at next major section at same level
  if (capturing && content && item.itemContent?.style?.startsWith('heading') && index > 0) {
    const prevLevel = item.itemContent?.lineLevel || 0;
    if (prevLevel === 0 && !content.match(/image|video|gen|edit/i)) {
      capturing = false;
    }
  }

  if (capturing) {
    imageGenContent.push(item);
  }
});

if (imageGenContent.length > 0) {
  let imageMarkdown = '# Image Gen/Editing\n\n';
  imageMarkdown += '*Extracted from: Opal Platform → Q2 Epics & Features → Image / Video section*\n\n';
  imageMarkdown += '---\n\n';

  imageGenContent.forEach(item => {
    const content = item.itemContent?.content || '';
    const style = item.itemContent?.style || 'paragraph';
    const level = item.itemContent?.lineLevel || 0;

    if (!content.trim()) {
      imageMarkdown += '\n';
      return;
    }

    switch (style) {
      case 'heading1':
        imageMarkdown += `# ${content}\n\n`;
        break;
      case 'heading2':
        imageMarkdown += `## ${content}\n\n`;
        break;
      case 'heading3':
        imageMarkdown += `### ${content}\n\n`;
        break;
      case 'bulletedList':
        const indent = '  '.repeat(level);
        imageMarkdown += `${indent}- ${content}\n`;
        break;
      case 'numberedList':
        const numIndent = '  '.repeat(level);
        imageMarkdown += `${numIndent}1. ${content}\n`;
        break;
      default:
        if (content.trim()) {
          imageMarkdown += `${content}\n\n`;
        }
    }
  });

  const imageFile = path.join(inputDir, 'image-gen-editing.md');
  fs.writeFileSync(imageFile, imageMarkdown);
  console.log(`✓ Created focused file: ${imageFile}`);
  console.log(`  Image Gen/Editing items: ${imageGenContent.length}`);
}
