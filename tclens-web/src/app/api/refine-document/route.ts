import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildRefinePrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        if (!apiKey) {
            return NextResponse.json({ error: "Configuration Error: Missing API Key" }, { status: 500 });
        }

        const { fullDocument, selectedText, instruction } = await req.json();

        if (!selectedText || !instruction) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = new GoogleGenAI({ apiKey });
        const prompt = buildRefinePrompt(fullDocument, selectedText, instruction);

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        let content = result.text;
        if (!content) {
            throw new Error("Gemini returned an empty response");
        }

        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replace(/^```[a-zA-Z]*\n/, "");
            content = content.replace(/\n```$/, "");
            content = content.trim();
        }

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Doc refine error:", error);
        return NextResponse.json({
            error: "Failed to refine document section",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
