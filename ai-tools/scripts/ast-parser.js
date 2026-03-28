#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node ast-parser.js <path/to/file.js|.ts>');
  process.exit(1);
}

const targetFile = path.resolve(process.argv[2]);

if (!fs.existsSync(targetFile)) {
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

const content = fs.readFileSync(targetFile, 'utf8');

// The Goal is a lightweight AST-like structure. Using Regex for simplicity (no npm install required).
const result = {
  file: path.basename(targetFile),
  type: path.extname(targetFile),
  imports: [],
  exports: [],
  classes: [],
  functions: [],
};

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // 1. Imports
  if (line.startsWith('import ') || line.includes('require(')) {
    result.imports.push(line);
  }

  // 2. Exports
  if (line.startsWith('export ') || line.startsWith('module.exports')) {
    result.exports.push(line.substring(0, 50) + (line.length > 50 ? '...' : ''));
  }

  // 3. Classes
  const classMatch = line.match(/^class\s+([A-Za-z0-9_]+)/);
  if (classMatch) {
    result.classes.push({
      name: classMatch[1],
      lineStart: i + 1,
    });
  }

  // 4. Functions (Classic & Arrow)
  const funcMatch = line.match(/^(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/);
  const arrowMatch = line.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s+)?(?:\([^\)]*\)|[A-Za-z0-9_]+)\s*=>/);
  const methodMatch = line.match(/^(?:async\s+)?([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/);

  if (funcMatch) {
    result.functions.push({ name: funcMatch[1], type: 'Declaration', lineStart: i + 1 });
  } else if (arrowMatch) {
    result.functions.push({ name: arrowMatch[1], type: 'Arrow', lineStart: i + 1 });
  } else if (methodMatch && !line.includes('if') && !line.includes('for') && !line.includes('while') && !line.includes('switch') && !line.includes('catch') && !line.includes('return')) {
    result.functions.push({ name: methodMatch[1], type: 'Method/Other', lineStart: i + 1 });
  }
}

// Print compact JSON output
console.log(JSON.stringify(result, null, 2));
