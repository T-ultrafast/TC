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
        const { type } = body;

        if (!type) {
            return NextResponse.json({ error: "Missing document type" }, { status: 400 });
        }

        const client = new GoogleGenAI({ apiKey });

        const prompt = `
        Draft a professional, legally structured ${type}. 
        
        STRICT FORMATTING RULES:
        1. DO NOT use Markdown symbols like #, **, *, or - for headers or lists.
        2. DO NOT wrap the output in code fences (e.g., \`\`\`text or \`\`\`).
        3. Use professional legal numbering for sections (e.g., "1. SCOPE OF SERVICES", "1.1 Deliverables").
        4. Use double line breaks between sections.
        5. Include placeholders [IN BRACKETS] for specific names, dates, and terms.
        6. Ensure it includes standard protective clauses for an individual user/contractor.
        
        The output should be a clean, plain-text document ready for a professional legal agreement.
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
