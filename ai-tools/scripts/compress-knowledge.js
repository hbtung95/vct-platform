#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const architectureDir = path.resolve(__dirname, '../../docs/architecture');
const outDir = path.resolve(__dirname, '../knowledge');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

if (!fs.existsSync(architectureDir)) {
  console.log('Skipping compression: docs/architecture directory not found. Create it to use this tool.');
  process.exit(0);
}

const files = fs.readdirSync(architectureDir).filter(f => f.endsWith('.md'));

if (files.length === 0) {
  console.log('No Markdown files found to compress.');
  process.exit(0);
}

const compressedData = {
  vct_architecture_rules: true,
  last_compressed: new Date().toISOString(),
  documents: {}
};

for (const file of files) {
  const filePath = path.join(architectureDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const sections = {};
  
  let currentSection = 'root';
  sections[currentSection] = [];
  
  const lines = content.split('\n');
  for (const line of lines) {
    const tLine = line.trim();
    if (tLine.length === 0 || tLine.startsWith('>') || tLine.startsWith('---')) continue;
    
    if (tLine.startsWith('# ')) {
      currentSection = "Title: " + tLine.substring(2);
      sections[currentSection] = [];
      continue;
    }

    if (tLine.startsWith('## ')) {
      currentSection = tLine.substring(3).replace(/[^\w\s\u00C0-\u1EF9]/g, '').trim();
      sections[currentSection] = [];
      continue;
    }
    
    if (tLine.startsWith('- ') || tLine.startsWith('* ') || tLine.match(/^\d\.\s/)) {
      sections[currentSection].push(tLine.replace(/^[-*\d.]\s/, '').replace(/\*\*/g, ''));
    } else if (tLine.startsWith('| ') && !tLine.includes('---')) {
       sections[currentSection].push(tLine.replace(/\|\s/g, '').replace(/\s\|/g, ': ').trim());
    }
  }

  // Loại bỏ các section rỗng
  for (const key in sections) {
      if (sections[key].length === 0) delete sections[key];
  }

  compressedData.documents[file.replace('.md', '')] = sections;
}

const outFile = path.join(outDir, 'compressed_architecture.json');
fs.writeFileSync(outFile, JSON.stringify(compressedData, null, 2), 'utf8');

console.log(`✅ Nén toàn bộ docs/architecture thành công! File: ${outFile}`);
