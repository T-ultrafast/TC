import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined in environment variables");
            return NextResponse.json({ error: "Configuration Error: Missing API Key" }, { status: 500 });
        }

        const body = await req.json().catch(() => ({}));
        const { type, jurisdiction, state, keyDetails } = body;

        if (!type) {
            return NextResponse.json({ error: "Missing document type" }, { status: 400 });
        }

        if (!keyDetails || !keyDetails.trim()) {
            return NextResponse.json({ error: "Key details are required for accurate document generation" }, { status: 400 });
        }

        const client = new GoogleGenAI({ apiKey });

        // Convert HTML to plain text for AI processing
        const plainKeyDetails = keyDetails.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

        const prompt = `
        Generate a professional, legally structured ${type} using the following key details as the PRIMARY SOURCE:

        KEY DETAILS PROVIDED BY USER:
        ${plainKeyDetails}

        JURISDICTION: ${jurisdiction}${state ? ` (${state})` : ''}

        INSTRUCTIONS:
        1. Use the Key Details above as your primary source of truth - extract entities, terms, and requirements from this content
        2. If the Key Details mention specific parties, dates, amounts, or terms, use those EXACTLY as provided
        3. Only infer missing details when absolutely necessary, and clearly mark them as "assumed" or use brackets [EXAMPLE]
        4. Adapt the document structure and wording to comply with ${jurisdiction} laws and requirements${state ? `, specifically considering ${state} state/provincial requirements` : ''}
        5. Generate a complete, professional legal document that reads like a real agreement, not an AI response

        FORMATTING REQUIREMENTS:
        1. DO NOT use Markdown symbols like #, **, *, or - for headers or lists
        2. DO NOT wrap the output in code fences (e.g., \`\`\`text or \`\`\`)
        3. Use professional legal numbering for sections (e.g., "1. SCOPE OF SERVICES", "1.1 Deliverables")
        4. Use double line breaks between sections
        5. Include proper legal clauses and protective language appropriate for the document type
        6. Preserve any list structure from the user's Key Details

        QUALITY REQUIREMENTS:
        - Extract and use: parties, dates, payment terms, obligations, termination conditions, governing law
        - Generate structured clauses with proper headings
        - Include appropriate legal boilerplate for the jurisdiction
        - End with a "Notes / Assumptions" section if any assumptions were made

        The output should be a clean, plain-text legal document ready for professional use.
        `;

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const content = result.text;

        if (!content) {
            throw new Error("Gemini returned an empty response");
        }

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Doc gen error:", error);
        return NextResponse.json({
            error: "Failed to generate document",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
