export function buildDocumentPrompt(
    type: string,
    jurisdiction: string,
    state: string,
    keyDetails: string,
    customParamsList: string,
    currentDate: string
): string {
    return `You are a Senior Legal Counsel AI generating a professional, legally binding document.

Today's Date: **${currentDate}** (Use this as the effective date/current date unless the user explicitly provides a different one).

You are tasked to generate a: **${type}**

// === CRITICAL INSTRUCTIONS === //
1. OUTPUT FORMAT MUST BE VALID HTML. Use <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, etc.
2. DO NOT use markdown format (no \`\`\`, no *, no #). ONLY valid HTML.
3. DO NOT wrap the output in a markdown \`\`\`html codeblock. Just return raw HTML text.
4. FACTUAL ACCURACY PRESERVATION: Incorporate all provided specific details (party names, amounts, dates, specific clauses). This is the factual core of the document.
5. INTELLIGENT POLISHING & CORRECTION: You MUST proactively fix all typos, grammatical errors, and casing issues in the user's input. For example, "zEBRA cOATE" must be corrected to "Zebra Coate", "continie" to "continue", and " nigeria" to "Nigeria". Professional legal formatting is mandatory.
6. If a Specific Detail is provided but left blank, infer standard legal placeholder (e.g., [Party Name]) or omit appropriately.
7. The document must be extremely comprehensive, detailed, and professional. It must use standard legal numbering (e.g., "1. Term", "1.1"), include standard boilerplate clauses for the contract type, and be ready-to-sign.
8. Adapt boilerplate to: ${jurisdiction}${state ? ` (${state})` : ''} governing law.
9. HIGH GRANULARITY & DEPTH: Do not produce a generic or short summary. Expand each section with legally robust language. For any user-provided detail or clause, build it out into a full, detailed, and nuanced section that provides maximum protection and clarity. If the user mentions a "Purpose", expand it into a detailed description of the engagement.
10. STRICT SIGNATURE BLOCK FORMAT: At the end of the document, provide a clean and professional signature section. DO NOT use complex tables. Use a horizontal layout or stacked layout with underscored lines for "By:", "Name:", "Title:", and "Date:". Example:
    [PARTY NAME]
    By: __________________________
    Name: [NAME]
    Title: [TITLE]
    Date: __________________________

// === SPECIFIC DETAILS TO INTEGRATE === //
The user has provided these explicit parameters. Sanitise, correct typos, and integrate them into the document:
${customParamsList || "None provided by user."}

// === FINAL CHECK === //
Make sure the tone is extremely formal and standard for a ${type} in ${jurisdiction}. Ensure the HTML is perfectly formed (no missing tags). Make it look clean. Start with an <h1> centering the title of the agreement.
`;
}

export function buildRefinePrompt(
    fullDocument: string,
    selectedText: string,
    instruction: string
): string {
    return `You are a Senior Legal Counsel AI performing a surgical refinement on a specific section of a document.

// === CONTEXT: FULL CURRENT DOCUMENT === //
${fullDocument}

// === TARGET: SECTION TO REFINE === //
"${selectedText}"

// === USER INSTRUCTION === //
${instruction}

// === CRITICAL INSTRUCTIONS === //
1. You MUST only return the refined version of the "TARGET SECTION". DO NOT return the entire document.
2. Maintain the tone, style, and formatting of the original document.
3. Use valid HTML for the output (e.g., <p>, <strong>, <ul>, <li>). 
4. DO NOT use markdown format or codeblocks. Just return the raw HTML of the updated section.
5. Ensure the refined section fits seamlessly back into the original document at the same location.
6. Fix any typos or grammatical issues in the selected section while applying the user's specific request.
7. Be precise. If the user asks to change a date, change only the date. If they ask to make a clause more aggressive, expand that specific clause.
`;
}
