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
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const client = new GoogleGenAI({ apiKey });

        const lastMessage = messages[messages.length - 1]?.content;
        if (!lastMessage) {
            return NextResponse.json({ error: "No message content found" }, { status: 400 });
        }

        // The @google/genai Node SDK handles sessions via generateContent or chat.
        // For efficiency in a stateless API, we'll use generateContent with context included.
        // Multilingual Analysis Assistant from T2
        const systemPrompt = `You are TCLens, a multilingual Terms & Conditions and policy analysis assistant.

MISSION: Read, detect, and understand T&Cs, Privacy Policies, and legally binding documents. Provide clause identification, risk scoring, and plain-language summaries.

LANGUAGE HANDLING:
1) Detect languages. Use translation to English for internal analysis if document is non-English.
2) Cite original language and provide English translations for transparency.
3) Reply in the detected primary language unless the user specifies otherwise.

IDENTITY & SAFETY
- You are not a licensed attorney. No legal advice.
- If missing jurisdiction impacts the answer, ask for it.
- END EVERY RESPONSE WITH: “Informational only — not legal advice.”`;

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I am TCLens, the multilingual analysis assistant. I will follow the diagnostic structure and disclaimers." }] },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            ]
        });

        const reply = result.text;

        if (!reply) {
            throw new Error("Gemini returned an empty response");
        }

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({
            error: "Failed to get AI reply",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
