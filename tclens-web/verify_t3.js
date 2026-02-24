const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/api/analyze/route.ts');
const content = fs.readFileSync(filePath, 'utf8');

function stripCommentsAndStrings(code) {
    let result = '';
    let i = 0;
    while (i < code.length) {
        // Line comment
        if (code.slice(i, i + 2) === '//') {
            const nl = code.indexOf('\n', i);
            i = nl === -1 ? code.length : nl;
            continue;
        }
        // Block comment
        if (code.slice(i, i + 2) === '/*') {
            const end = code.indexOf('*/', i + 2);
            i = end === -1 ? code.length : end + 2;
            continue;
        }
        // String literal (double)
        if (code[i] === '"') {
            i++;
            while (i < code.length && code[i] !== '"') {
                if (code[i] === '\\') i += 2; else i++;
            }
            i++;
            continue;
        }
        // String literal (single)
        if (code[i] === "'") {
            i++;
            while (i < code.length && code[i] !== "'") {
                if (code[i] === '\\') i += 2; else i++;
            }
            i++;
            continue;
        }
        // Template literal
        if (code[i] === '`') {
            i++;
            while (i < code.length && code[i] !== '`') {
                if (code[i] === '\\') i += 2; else i++;
            }
            i++;
            continue;
        }
        // Regex literal (heuristic: starts with / and not followed by * or /)
        // This is tricky. We'll skip for simplicity but warn if unbalanced.
        // Actually, simple regex skip:
        // if (code[i] === '/' && !['*', '/'].includes(code[i+1])) ... too risky for division.

        result += code[i];
        i++;
    }
    return result;
}

const cleanContent = stripCommentsAndStrings(content);

const violations = [];

// 1. Check for Typed Catches (in clean content is minimal risk, but strict regex is safer on original)
if (/catch\s*\(\s*\w+\s*:\s*any\s*\)/.test(content)) {
    violations.push("Found typed catch block (e.g. catch(e: any))");
}

// 2. Check Brace Balance on CLEAN content
const openBraces = (cleanContent.match(/\{/g) || []).length;
const closeBraces = (cleanContent.match(/\}/g) || []).length;

if (openBraces !== closeBraces) {
    violations.push(`Brace imbalance detected: {=${openBraces}, }=${closeBraces} (Diff: ${openBraces - closeBraces})`);
}

// 3. Top level return
// If we strip everything, we can just split by function and check rest?
// Simpler: Check if 'return' exists when brace depth is 0.
let depth = 0;
let lines = cleanContent.split('\n');
let topLevelReturn = false;

// Tokenize roughly
for (let char of cleanContent) {
    if (char === '{') depth++;
    if (char === '}') depth--;
    // This is too granular.
}

// Re-scan clean content for return keywords at depth 0
let currentDepth = 0;
for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    if (char === '{') currentDepth++;
    else if (char === '}') currentDepth--;
    else if (cleanContent.substr(i, 6) === 'return' && currentDepth === 0) {
        // Ensure it's a whole word
        const nextChar = cleanContent[i + 6];
        const prevChar = i > 0 ? cleanContent[i - 1] : ' ';
        if (!/\w/.test(prevChar) && !/\w/.test(nextChar || ' ')) {
            violations.push("Potential top-level return detected");
        }
    }
}

if (violations.length > 0) {
    console.error("T3 Violations Found:");
    violations.forEach(v => console.error(`- ${v}`));
    process.exit(1);
} else {
    console.log("T3 Compliance: VERIFIED. Code clean.");
}
