import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { storage } from '@/lib/storage';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined in environment variables");
            return NextResponse.json({ error: "Configuration Error: Missing API Key" }, { status: 500 });
        }

        const body = await req.json().catch(() => ({}));
        const { messages, analysisId } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const client = new GoogleGenAI({ apiKey });
        const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

        // Fetch analysis context if analysisId is provided
        let contextBlock = "";
        if (analysisId) {
            try {
                const analysis = await storage.getAnalysisByIdOnly(analysisId);
                if (analysis) {
                    const result = analysis.analysisResult;
                    contextBlock = `
CURRENT DOCUMENT CONTEXT:
Summary: ${result.summary || 'No summary available'}
Risk Score: ${result.risk_score || 'N/A'}
Key Clauses: ${(result.clauses || []).map((c: any) => `${c.type}: ${c.summary}`).join('. ')}
                    `;
                }
            } catch (err) {
                console.error("Context fetch failed in chat:", err);
            }
        }

        const lastMessage = messages[messages.length - 1]?.content;
        if (!lastMessage) {
            return NextResponse.json({ error: "No message content found" }, { status: 400 });
        }

        const systemPrompt = `You are TCLens, a multilingual Terms & Conditions and policy analysis assistant.

${contextBlock ? `YOU ARE CHATTING ABOUT THIS SPECIFIC DOCUMENT:\n${contextBlock}\n` : ''}

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
            model: geminiModel,
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I am TCLens, the context-aware analysis assistant. I will follow the diagnostic structure and disclaimers using any provided document context." }] },
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
