const fs = require('fs');
const content = fs.readFileSync('/Users/temitayoolowolafe/Documents/TC/tclens-web/src/app/api/analyze/route.ts', 'utf8');

let stack = [];
let inString = false;
let stringChar = '';
let inComment = false;
let inBlockComment = false;
let inRegex = false;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = content[i - 1];
    const nextChar = content[i + 1];

    if (inString) {
        if (char === stringChar && prevChar !== '\\') inString = false;
        continue;
    }
    if (inBlockComment) {
        if (char === '*' && nextChar === '/') {
            inBlockComment = false;
            i++;
        }
        continue;
    }
    if (inComment) {
        if (char === '\n') inComment = false;
        continue;
    }
    if (inRegex) {
        if (char === '/' && prevChar !== '\\') inRegex = false;
        continue;
    }

    if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
        continue;
    }
    if (char === '/' && nextChar === '/') {
        inComment = true;
        i++;
        continue;
    }
    if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++;
        continue;
    }
    // Very basic regex detection (might be flawed but good enough for this file)
    if (char === '/' && prevChar === '(') {
        inRegex = true;
        continue;
    }

    if (char === '{') {
        stack.push({ line: content.substring(0, i).split('\n').length });
    } else if (char === '}') {
        if (stack.length === 0) {
            console.log(`Extra closing brace at line ${content.substring(0, i).split('\n').length}`);
        } else {
            stack.pop();
        }
    }
}

if (stack.length > 0) {
    stack.forEach(b => console.log(`Unclosed opening brace at line ${b.line}`));
} else {
    console.log('Braces are balanced (ignoring some edges)');
}
