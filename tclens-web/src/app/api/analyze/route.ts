import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Initialize OpenAI lazily or with a check
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

// Helper to extract text from PDF buffer
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        // Convert Buffer to Uint8Array for pdfjs
        const data = new Uint8Array(buffer);

        // Load the document
        const loadingTask = getDocument({ data });
        const pdfDocument = await loadingTask.promise;

        let fullText = '';

        // Iterate through pages
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

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

Return the response in strictly valid JSON format with the following structure:
{
  "summary": "string",
  "riskScore": number,
  "clauses": [
    {
      "type": "string",
      "summary": "string",
      "riskLevel": "Low" | "Medium" | "High" | "Critical",
      "explanation": "string",
      "textSnippet": "string" // The approximate original text
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

export async function POST(req: NextRequest) {
    try {
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
                textToAnalyze = await extractTextFromPDF(buffer);
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

        if (!textToAnalyze.trim()) {
            return NextResponse.json(
                { error: 'Could not extract text from document.' },
                { status: 400 }
            );
        }

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Here is the legal document text:\n\n${textToAnalyze.substring(0, 50000)}` } // Truncate if too long, though gpt-4o has large context
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No response from AI');
        }

        const analysisResult = JSON.parse(content);

        return NextResponse.json(analysisResult);

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze document' },
            { status: 500 }
        );
    }
}
