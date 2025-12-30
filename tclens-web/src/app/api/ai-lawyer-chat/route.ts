import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

        const { messages } = await req.json();

        const client = new GoogleGenAI({ apiKey });
        const model = client.models.get("gemini-1.5-flash");

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a helpful legal assistant for TCLens. Provide clear, accurate legal information but always include a disclaimer that you are an AI and not a substitute for legal advice. Be concise and professional." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to provide legal information as a TCLens assistant, with appropriate disclaimers." }],
                },
            ],
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const reply = result.response.text();

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to get AI reply" }, { status: 500 });
    }
}
