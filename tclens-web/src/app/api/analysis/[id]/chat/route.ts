import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { storage } from '@/lib/storage';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';

    try {
        const messages = await storage.getChatHistory(id, userId);
        return NextResponse.json({ ok: true, data: messages });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiKey = process.env.GEMINI_API_KEY;
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';

    if (!apiKey) {
        return NextResponse.json({ ok: false, error: 'API Key missing' }, { status: 500 });
    }

    try {
        const { question } = await req.json();
        const analysis = await storage.getAnalysisById(id, userId);

        if (!analysis) {
            return NextResponse.json({ ok: false, error: 'Analysis not found' }, { status: 404 });
        }

        // Save user message
        await storage.saveChatMessage({
            analysisId: id,
            userId: userId,
            role: 'user',
            content: question,
            createdAt: new Date().toISOString()
        });

        // Get chat history for context
        const history = await storage.getChatHistory(id, userId);

        const client = new GoogleGenAI({ apiKey });

        const systemPrompt = `You are an expert legal analysis AI. Answer the user's question with extreme brevity.
MISSION: Maximum 150 words total.

ABSOLUTE RULES (NON-NEGOTIABLE):
1) Use short paragraphs (1–2 sentences max).
2) Highlight **key terms and risks in bold**.
3) Do NOT use single asterisks (*text*) for italics.
4) Use "•" bullet points where appropriate.
5) No disclaimers or filler text.
6) NEVER claim to be a licensed attorney.

DOCUMENT CONTEXT:
Input Type: ${analysis.inputType}
Jurisdiction: ${analysis.jurisdiction}
Summary: ${analysis.analysisResult.summary}
Key Clauses: ${JSON.stringify(analysis.analysisResult.clauses)}

INSTRUCTIONS: Answer the question clearly and directly based on the provided context. If the question is off-topic, politely redirect.`;

        let responseText = "";
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                const result = await client.models.generateContent({
                    model: "gemini-1.5-flash",
                    contents: [
                        ...history.slice(0, -1).map(m => ({
                            role: m.role === 'user' ? 'user' : 'model',
                            parts: [{ text: m.content }]
                        })),
                        {
                            role: 'user',
                            parts: [{ text: `Context: ${systemPrompt}\n\nUser Question: ${question}` }]
                        }
                    ],
                    config: {
                        maxOutputTokens: 1000,
                    }
                });

                responseText = (result as any).text;
                if (!responseText) {
                    throw new Error("Gemini returned an empty response");
                }
                break; // Success
            } catch (err: any) {
                const isRateLimit = err.message?.includes("429") || err.status === 429 || err.message?.includes("RESOURCE_EXHAUSTED");
                const isRetryable = isRateLimit || (err.status && err.status >= 500);

                if (isRetryable && retryCount < maxRetries - 1) {
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
                    console.warn(\`[API_CHAT] Gemini \${isRateLimit ? "Rate Limit" : "Server Error"}. Retrying in \${Math.round(delay)}ms... (Attempt \${retryCount}/\${maxRetries})\`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }

        // Save assistant message
        const assistantMessage = await storage.saveChatMessage({
            analysisId: id,
            userId: userId,
            role: 'assistant',
            content: responseText || "I'm sorry, I couldn't generate a response.",
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ ok: true, data: assistantMessage });

    } catch (error: any) {
        console.error("[API_CHAT] Error:", error);
        let message = error.message || "Failed to generate response.";
        if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
            message = "AI service is currently busy. Please try again in 30 seconds.";
        }
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
