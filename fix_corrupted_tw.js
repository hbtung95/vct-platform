const fs = require('fs');
const { execSync } = require('child_process');

const root = 'd:/VCT PLATFORM/vct-platform';
const files = [
    'Page_admin_reference_data.tsx'
];

const dir = 'packages/app/features/admin/';

const varRegex = /((?:[\w-]+:)*)([\w-]+)-\[var\((--[^\)]+)\)\](\/\d+)?/g;

files.forEach(f => {
    try {
        const committed = execSync(`git show HEAD:${dir}${f}`, {
            cwd: root, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024
        });
        
        const fixed = committed.replace(varRegex, (match, modifiers, util, varName, opacity) => {
            return `${modifiers || ''}${util}-(${varName})${opacity || ''}`;
        });
        
        const final = fixed.replace(/bg-gradient-to-r/g, 'bg-linear-to-r');
        
        const outPath = `${root}/${dir}${f}`;
        fs.writeFileSync(outPath, final, 'utf8');
        
        const origCount = (committed.match(varRegex) || []).length;
        console.log(`${f}: ${origCount} var() replaced`);
    } catch (e) {
        console.log(`${f}: ERROR - ${e.message.split('\n')[0]}`);
    }
});

console.log('Done fixing Page_admin_reference_data.tsx');
