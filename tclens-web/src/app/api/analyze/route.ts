import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

// Multilingual System Prompt based on T2
const SYSTEM_PROMPT = `You are TCLens, a multilingual Terms & Conditions and policy analysis assistant.

MISSION: Read, detect, and understand T&Cs, Privacy Policies, and other legally binding documents in multiple languages. Provide clause identification, risk scoring, and plain-language summaries.

LANGUAGE HANDLING:
1) Detect primary and secondary languages.
2) If not English:
   a) Translate relevant content to English (legal-meaning-preserving).
   b) Keep key terms in both original and English.
3) Perform analysis on translated version, but cite original-language excerpts for accuracy.
4) Output in user's UI language if specified, otherwise the detected primary language, otherwise English.

TAXONOMY: Arbitration, Governing law, Liability limits, Indemnification, Auto-renewal, Termination, Data sharing, Unilateral changes, IP rights, Fees, Dispute timelines, Consent clauses.

Return the response in strictly valid JSON format. Do not include any text before or after the JSON.
{
  "languageDetection": {
    "primary": "string",
    "secondary": ["string"]
  },
  "summary": "string (Executive Summary 3-6 bullets)",
  "riskScore": number (0-100),
  "confidence": number (0-100),
  "clauses": [
    {
      "type": "string",
      "summary": "string",
      "riskLevel": "Low" | "Medium" | "High" | "Critical",
      "explanation": "string (Why it matters)",
      "originalExcerpt": "string (Short excerpt in original language)",
      "translatedExcerpt": "string (Short excerpt in English)"
    }
  ],
  "redFlags": [
    {
      "title": "string (Potentially unfair/unusual provision)",
      "description": "string (Practical action/opt-out steps)"
    }
  ],
  "nextSteps": ["string (Practical actions)"],
  "disclaimer": "Informational only — not legal advice."
}

Rules: Be conservative. Cite original excerpts. If jurisdiction is missing and it matters, ask."`;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        if (!apiKey) {
            console.error("[API_ANALYZE] Error: GEMINI_API_KEY is missing");
            return NextResponse.json(
                { ok: false, error: 'Server configuration error: Missing API Key', code: "ERR_CONFIG" },
                { status: 500 }
            );
        }

        let formData;
        try {
            // Requirement 2: Ensure the API route parses multipart upload correctly
            formData = await req.formData();
        } catch (e) {
            console.error("[API_ANALYZE] Error: Invalid form data", e);
            return NextResponse.json({ ok: false, error: "Invalid form data", code: "ERR_FORM_DATA" }, { status: 400 });
        }

        const file = formData.get('file') as File | null;
        const textInput = formData.get('text') as string | null;

        console.log(`[API_ANALYZE] Received request. File: ${file?.name || 'None'}, TextInput length: ${textInput?.length || 0}`);

        if (!file && !textInput) {
            return NextResponse.json({ ok: false, error: 'No file or text provided', code: "ERR_NO_INPUT" }, { status: 400 });
        }

        let textToAnalyze = '';

        if (file) {
            console.log(`[API_ANALYZE] Processing file: ${file.name}, Type: ${file.type}`);
            try {
                // Requirement 3: Convert file to Buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    // Requirement 4: PDF extraction based on buffer
                    // Using pdf-parse but bypassing the problematic index.js that triggers ENOENT on import
                    const pdfParser = await import('pdf-parse/lib/pdf-parse.js');

                    console.log("[API_ANALYZE] Starting PDF extraction from buffer...");
                    const data = await pdfParser(buffer);
                    textToAnalyze = data.text;
                    console.log(`[API_ANALYZE] PDF extraction complete. Extracted length: ${textToAnalyze?.length || 0}`);

                    // Requirement 5: Check if extracted text is empty
                    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                        return NextResponse.json({
                            ok: false,
                            error: "Could not extract text from file",
                            details: "The PDF appears to be empty or contains only images/scanned text. If this is a scanned PDF, paste text or upload a text-based PDF.",
                            code: "ERR_EMPTY_PDF"
                        }, { status: 400 });
                    }
                } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
                    // Requirement 4: DOCX extraction from buffer
                    const mammoth = await import('mammoth');

                    console.log("[API_ANALYZE] Starting DOCX extraction from buffer...");
                    const result = await mammoth.extractRawText({ buffer: buffer });
                    textToAnalyze = result.value;
                    console.log(`[API_ANALYZE] DOCX extraction complete. Extracted length: ${textToAnalyze?.length || 0}`);

                    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                        return NextResponse.json({
                            ok: false,
                            error: "Could not extract text from file",
                            details: "The Word document contains no readable text content.",
                            code: "ERR_EMPTY_DOCX"
                        }, { status: 400 });
                    }
                } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                    // Requirement 4: TXT extraction
                    textToAnalyze = await file.text();
                    console.log(`[API_ANALYZE] TXT extraction complete. Length: ${textToAnalyze?.length || 0}`);
                } else {
                    console.warn(`[API_ANALYZE] Unsupported file type: ${file.type}`);
                    return NextResponse.json({
                        ok: false,
                        error: 'Unsupported file type',
                        details: `File type '${file.type}' is not recognized. Please use PDF, DOCX, or TXT.`,
                        code: "ERR_UNSUPPORTED_TYPE"
                    }, { status: 400 });
                }
            } catch (err: any) {
                // Requirement 7: Wrap in try/catch and log server errors
                console.error("[API_ANALYZE] Extraction error:", err);
                return NextResponse.json({
                    ok: false,
                    error: "Extraction Failed",
                    details: "We encountered an error while processing your file: " + (err.message || String(err)),
                    code: "ERR_EXTRACTION_FAILED"
                }, { status: 400 });
            }
        } else {
            textToAnalyze = textInput || '';
        }

        if (!textToAnalyze || textToAnalyze.trim().length < 50) {
            return NextResponse.json({
                ok: false,
                error: 'Content too short',
                details: 'Please provide at least 50 characters of legal text for meaningful analysis.',
                code: "ERR_CONTENT_SHORT"
            }, { status: 400 });
        }

        const wordCount = textToAnalyze.trim().split(/\s+/).length;

        // Quota check logic
        const currentUsage = parseInt(req.headers.get('x-usage') || '0', 10);
        const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';
        const limit = isLoggedIn ? 10000 : 5000;

        if (currentUsage + wordCount > limit) {
            console.warn(`[API_ANALYZE] Quota exceeded. Usage: ${currentUsage}, Content: ${wordCount}, Limit: ${limit}`);
            return NextResponse.json({
                ok: false,
                error: 'Word limit reached',
                details: `Your current limit is ${limit.toLocaleString()} words. This analysis would exceed that by ${(currentUsage + wordCount - limit).toLocaleString()} words.`,
                code: "ERR_QUOTA_EXCEEDED"
            }, { status: 403 });
        }

        // Call Gemini
        console.log("[API_ANALYZE] Initiating Gemini request...");
        const client = new GoogleGenAI({ apiKey });

        try {
            const result = await client.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION:\n${SYSTEM_PROMPT}\n\nDOCUMENT TEXT:\n${textToAnalyze.substring(0, 100000)}` }] }],
                config: {
                    responseMimeType: "application/json",
                }
            });

            const responseText = result.text;
            if (!responseText) {
                console.error("[API_ANALYZE] Gemini returned empty response");
                throw new Error("Gemini returned an empty response");
            }

            let analysisResult;
            try {
                analysisResult = JSON.parse(responseText);
                analysisResult.wordCount = wordCount;
                console.log("[API_ANALYZE] Successfully parsed Gemini response.");
            } catch (e) {
                console.error("[API_ANALYZE] JSON parse error from Gemini:", responseText);
                return NextResponse.json({
                    ok: false,
                    error: "AI Formatting Error",
                    details: "The AI service returned a response that could not be parsed. Please try again or simplify the document.",
                    code: "ERR_AI_JSON"
                }, { status: 500 });
            }

            // Requirement 6: Success: { ok:true, data:{...}, extractedTextPreview, wordCount }
            return NextResponse.json({
                ok: true,
                data: analysisResult,
                extractedTextPreview: textToAnalyze.substring(0, 500) + (textToAnalyze.length > 500 ? "..." : ""),
                wordCount: wordCount
            });

        } catch (apiError: any) {
            console.error("[API_ANALYZE] Gemini API Error:", apiError);
            return NextResponse.json({
                ok: false,
                error: "AI Service Error",
                details: apiError.message || "Failed to communicate with AI provider.",
                code: "ERR_AI_SERVICE"
            }, { status: 502 });
        }

    } catch (globalError: any) {
        console.error('[API_ANALYZE] Global analysis route error:', globalError);
        return NextResponse.json({
            ok: false,
            error: 'Internal Server Error',
            details: globalError.message || String(globalError),
            code: "ERR_INTERNAL"
        }, { status: 500 });
    }
}
