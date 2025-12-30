import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

        const { type } = await req.json();

        const client = new GoogleGenAI({ apiKey });
        const model = client.models.get("gemini-1.5-flash");

        const prompt = `
        Draft a professional, legally structured ${type}. 
        Use standard legal terminology, include placeholders [IN BRACKETS] for specific names, dates, and terms.
        Ensure it includes standard protective clauses for an individual user/contractor.
        Format it as a clean text document with headers.
        `;

        const result = await model.generateContent(prompt);
        const content = result.response.text();

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Doc gen error:", error);
        return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
    }
}
