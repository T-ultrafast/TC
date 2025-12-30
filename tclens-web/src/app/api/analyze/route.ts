import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

// System prompt for the AI
const SYSTEM_PROMPT = `
Act as a senior legal practitioner with 25+ years of experience in Contract Law. 
Analyze the provided Terms & Conditions or Legal Document.

Identify and classify legal clauses including:
- Limitation of Liability
- Indemnification
- Governing Law & Arbitration
- Termination Rights
- Warranty Disclaimers
- Data Collection & Usage
- Third-Party Data Sharing
- Automatic Renewal
- Intellectual Property & License Grants
- Payment Terms & Penalties
- User Obligations
- Consent Requirements

For each identified clause, provide:
1. The type of clause.
2. A plain-English summary.
3. A risk level (Low, Medium, High, Critical).
4. A brief explanation of why it is a risk.

Also provide:
- An overall Risk Score (0-100), where 100 is extremely risky/dangerous and 0 is perfectly safe.
- A list of "Critical Alerts" for unfair or dangerous clauses.
- A brief overall summary of the document.

Return the response in strictly valid JSON format matching this schema:
{
  "summary": "string",
  "riskScore": number,
  "clauses": [
    {
      "type": "string",
      "summary": "string",
      "riskLevel": "Low" | "Medium" | "High" | "Critical",
      "explanation": "string",
      "textSnippet": "string"
    }
  ],
  "criticalAlerts": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}
`;

const responseSchema = {
    type: "OBJECT",
    properties: {
        summary: { type: "STRING" },
        riskScore: { type: "NUMBER" },
        clauses: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    type: { type: "STRING" },
                    summary: { type: "STRING" },
                    riskLevel: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
                    explanation: { type: "STRING" },
                    textSnippet: { type: "STRING" }
                }
            }
        },
        criticalAlerts: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" }
                }
            }
        }
    },
    required: ["summary", "riskScore", "clauses", "criticalAlerts"]
};

export async function POST(req: NextRequest) {
    try {
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return NextResponse.json(
                { error: 'Server configuration error: Missing API Key' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const textInput = formData.get('text') as string | null;

        if (!file && !textInput) {
            return NextResponse.json(
                { error: 'No file or text provided' },
                { status: 400 }
            );
        }

        let textToAnalyze = '';

        if (file) {
            // Handle file upload
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // @ts-ignore
                const pdfModule = await import('pdf-parse');
                const pdf = pdfModule.default || pdfModule;

                const data = await pdf(buffer);
                textToAnalyze = data.text;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // DOCX
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // @ts-ignore
                const mammothModule = await import('mammoth');
                const mammoth = mammothModule.default || mammothModule;

                const result = await mammoth.extractRawText({ buffer: buffer });
                textToAnalyze = result.value;
            } else if (file.type === 'text/plain') {
                textToAnalyze = await file.text();
            } else {
                return NextResponse.json(
                    { error: 'Unsupported file type. Please upload PDF or Text.' },
                    { status: 400 }
                );
            }
        } else if (textInput) {
            textToAnalyze = textInput;
        }

        if (!textToAnalyze || !textToAnalyze.trim()) {
            return NextResponse.json(
                { error: 'Could not extract text from document.' },
                { status: 400 }
            );
        }

        // --- PRICING & QUOTA CHECK ---
        const wordCount = textToAnalyze.trim().split(/\s+/).length;
        const currentUsage = parseInt(req.headers.get('x-usage') || '0', 10);
        const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';
        const limit = isLoggedIn ? 10000 : 5000;

        if (currentUsage + wordCount > limit) {
            return NextResponse.json(
                { error: 'Word limit reached. Please upgrade your plan.' },
                { status: 403 }
            );
        }

        // Call Gemini
        const client = new GoogleGenAI({ apiKey });

        try {
            const result = await client.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ role: 'user', parts: [{ text: `DOCUMENT TEXT:\n${textToAnalyze.substring(0, 100000)}` }] }],
                config: {
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    responseMimeType: "application/json",
                    // @ts-ignore
                    responseSchema: responseSchema,
                }
            });

            const responseContent = result.text;


            if (!responseContent) {
                throw new Error('No content in Gemini response');
            }

            let analysisResult;
            try {
                analysisResult = JSON.parse(responseContent);
                // Add word count to response for tracking
                analysisResult.wordCount = wordCount;
            } catch (e) {
                console.error("JSON parse error", e);
                return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
            }

            return NextResponse.json(analysisResult);

        } catch (apiError: any) {
            console.error("Gemini API Error:", apiError);
            if (apiError.status === 429 || (apiError.message && apiError.message.includes('429'))) {
                return NextResponse.json(
                    { error: 'AI Service is busy (Rate Limit). Please try again in a minute.' },
                    { status: 429 }
                );
            }
            throw apiError;
        }

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze document', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
