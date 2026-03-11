import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildDocumentPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined in environment variables");
            return NextResponse.json({ error: "Configuration Error: Missing API Key" }, { status: 500 });
        }

        const body = await req.json().catch(() => ({}));
        const { type, jurisdiction, state, keyDetails, customParams } = body;

        if (!type) {
            return NextResponse.json({ error: "Missing document type" }, { status: 400 });
        }

        if (!keyDetails || !keyDetails.trim()) {
            return NextResponse.json({ error: "Key details are required for accurate document generation" }, { status: 400 });
        }

        const client = new GoogleGenAI({ apiKey });

        // Convert HTML to plain text for AI processing
        const plainKeyDetails = keyDetails.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

        // Format customParams ignoring N/A or empty
        let formattedParams = '';
        if (customParams && typeof customParams === 'object') {
            formattedParams = Object.entries(customParams)
                .filter(([_, value]) => value && String(value).trim().toLowerCase() !== 'na' && String(value).trim().toLowerCase() !== 'n/a')
                .map(([key, value]) => `• ${key}: ${value}`)
                .join('\n');
        }

        const prompt = buildDocumentPrompt(type, jurisdiction, state || "", plainKeyDetails, formattedParams);

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const content = result.text;

        if (!content) {
            throw new Error("Gemini returned an empty response");
        }

        let finalContent = content.trim();
        if (finalContent.startsWith("```")) {
            finalContent = finalContent.replace(/^```[a-zA-Z]*\n/, ""); // remove opening ```html
            finalContent = finalContent.replace(/\n```$/, ""); // remove closing ```
            finalContent = finalContent.trim();
        }

        return NextResponse.json({ content: finalContent });
    } catch (error: any) {
        console.error("Doc gen error:", error);
        return NextResponse.json({
            error: "Failed to generate document",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
