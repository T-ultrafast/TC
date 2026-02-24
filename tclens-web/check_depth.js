const fs = require('fs');
const content = fs.readFileSync('/Users/temitayoolowolafe/Documents/TC/tclens-web/src/app/api/analyze/route.ts', 'utf8');

let depth = 0;
let lines = content.split('\n');

lines.forEach((line, index) => {
    for (let char of line) {
        if (char === '{') depth++;
        if (char === '}') depth--;
        if (depth < 0) {
            console.log(`Negative depth at line ${index + 1}: ${line}`);
            depth = 0; // reset for further checks
        }
    }
});
console.log(`Final depth: ${depth}`);
