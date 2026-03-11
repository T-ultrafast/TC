import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { lookup } from 'dns/promises';
import { storage, AnalysisRecord } from '@/lib/storage';
import { calculateClauseRisk, calculateAggressiveness, calculateTransparency, calculateFinalScore } from '@/lib/risk-scoring';
import { enforceWordLimit } from '@/lib/string-utils';

export const runtime = 'nodejs';

// Multilingual System Prompt based on T2, t4 Hardening & Conciseness (500 words)
const SYSTEM_PROMPT = `You are a high-level legal architect generating concise summaries for a premium dashboard UI. 
MISSION: Provide deep legal value with clarity. 
Rules:
1) TOTAL WORD LIMIT: 500 words (Max). 
2) Section headings: **Overview**, **Key Clauses**, **User Obligations**, **Platform Powers**, **Risk Indicators**.
3) Apply real bold formatting (**text**) for UI scannability.
4) Do NOT use italics. Use "•" bullet points.
5) NO boilerplate text, legal disclaimers, or repetitive filler.
6) For "clauses": Each summary must be one clear line of text, and the "explanation" MUST be 2-3 sentences long, describing the legal implication for the user. Avoid "This is..." starting phrases.
7) For "redFlags": Provide a clear "implication" for each flag, explaining precisely why it is dangerous or unfavorable.
8) Focus on high-value terms only: Arbitration, Liability, Data, Termination.

REQUIRED SUMMARY STRUCTURE (The "summary" field in JSON must follow this exactly):
**Overview**
Briefly state what the document is and what it governs.

**Key Clauses**
• Bullet points of the most essential contractual terms.

**User Obligations**
• What users must do or avoid.

**Platform Powers**
• Rights regarding suspension, termination, or modification.

**Risk Indicators**
• Critical risks: termination, data use, jurisdiction, etc.

TAXONOMY: Arbitration, Governing law, Liability limits, Indemnification, Auto-renewal, Termination, Data sharing, Unilateral changes, IP rights, Fees, Dispute timelines, Consent clauses.

Return the response in strictly valid JSON format. {
  "languageDetection": { "primary": "string", "secondary": ["string"] },
  "summary": "string (Strictly 500-word max, 5-section structure)",
  "ai_severity": { "rating": number (1-10), "reason": "string" },
  "confidence": number,
  "clauses": [{ "type": "string", "summary": "string", "riskLevel": "Low" | "Medium" | "High" | "Critical", "explanation": "string", "originalExcerpt": "string", "translatedExcerpt": "string" }],
  "redFlags": [{ "title": "string", "description": "string", "implication": "string (Why this is a red flag & how it affects the user)" }],
  "nextSteps": ["string"],
  "disclaimer": "Informational only — not legal advice."
}`;

async function isPrivateIP(ip: string): Promise<boolean> {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return true; // Block IPv6 for simplicity or if invalid

    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && (parts[1] >= 16 && parts[1] <= 31)) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;

    return false;
}

/**
 * Sanitizes the AI's response by stripping markdown fences and whitespace.
 * Repairs common small formatting errors like trailing commas.
 */
function sanitizeJsonResponse(text: string): string {
    let sanitized = text.trim();

    // Remove markdown code fences if present (```json or```)
    if (sanitized.startsWith('```')) {
        const lines = sanitized.split('\n');
        if (lines[0].includes('```')) lines.shift();
        if (lines[lines.length - 1].includes('```')) lines.pop();
        sanitized = lines.join('\n').trim();
    }

    // Attempt to fix trailing commas before closing braces/brackets
    // e.g., "key": "value", } -> "key": "value" }
    sanitized = sanitized.replace(/,\s*([\}\]])/g, '$1');

    return sanitized;
}

async function fetchExternalUrl(url: string): Promise<string> {
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.');
        }

        // SSRF Protection: Resolve and check IP
        const { address } = await lookup(urlObj.hostname);
        if (await isPrivateIP(address)) {
            throw new Error('Access to private network is restricted.');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'TermsAnalyzer/1.0 (Bot; +https://terms-analyzer.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
            throw new Error('Unsupported content type. Only HTML and text are allowed.');
        }

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 2 * 1024 * 1024) { // 2MB limit
            throw new Error('Content exceeds maximum size limit (2MB).');
        }

        const html = new TextDecoder().decode(buffer);

        // Simple HTML to Text extraction
        // Remove scripts, styles, and comments
        let cleanText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            // Extract body content if possible
            .match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)?.[1] || html;

        // Strip remaining tags and normalize whitespace
        cleanText = cleanText
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return cleanText;
    } catch (error) {
        const err = error as any;
        console.error(`[API_ANALYZE] URL fetch failed (${url}):`, err.message);
        throw error;
    }
}

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
            formData = await req.formData();
        } catch (e) {
            console.error("[API_ANALYZE] Error: Invalid form data", e);
            return NextResponse.json({ ok: false, error: "Invalid form data", code: "ERR_FORM_DATA" }, { status: 400 });
        }

        const file = formData.get('file') as File | null;
        const textInput = formData.get('text') as string | null;
        const urlInput = formData.get('url') as string | null;
        const mode = formData.get('mode') as string || 'upload';
        const jurisdiction = formData.get('jurisdiction') as string || 'General';
        const state = formData.get('state') as string || '';

        console.log(`[API_ANALYZE] Request - Mode: ${mode}, Jurisdiction: ${jurisdiction}, State: ${state}`);

        if (!file && !textInput) {
            return NextResponse.json({ ok: false, error: 'No file or text provided', code: "ERR_NO_INPUT" }, { status: 400 });
        }

        let textToAnalyze = '';

        if (file) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    try {
                        const pdfParser = await import('pdf-parse/lib/pdf-parse.js');
                        const data = await pdfParser(buffer);
                        textToAnalyze = data.text;
                    } catch (pdfErr) {
                        console.error("[API_ANALYZE] pdf-parse failed, will attempt multimodal fallback", pdfErr);
                        textToAnalyze = "";
                    }

                    if (!textToAnalyze || textToAnalyze.trim().length < 150) {
                        console.log("[API_ANALYZE] PDF content very low (" + (textToAnalyze?.length || 0) + " chars), falling back to multimodal analysis");
                        textToAnalyze = "[SCANNED_PDF]";
                    }
                } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
                    const mammoth = await import('mammoth');
                    const result = await mammoth.extractRawText({ buffer: buffer });
                    textToAnalyze = result.value;

                    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                        return NextResponse.json({
                            ok: false,
                            error: "Could not extract text from file",
                            details: "The Word document contains no readable text content.",
                            code: "ERR_EMPTY_DOCX"
                        }, { status: 400 });
                    }
                } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                    textToAnalyze = await file.text();
                } else if (file.type?.startsWith('image/')) {
                    // Image handled as part of multimodal prompt later
                    textToAnalyze = "[IMAGE_UPLOAD]";
                } else {
                    return NextResponse.json({
                        ok: false,
                        error: 'Unsupported file type',
                        details: `File type '${file.type}' is not recognized. Please use PDF, DOCX, TXT, or Image files.`,
                        code: "ERR_UNSUPPORTED_TYPE"
                    }, { status: 400 });
                }
            } catch (err) {
                console.error("[API_ANALYZE] Extraction error:", err);
                return NextResponse.json({
                    ok: false,
                    error: "Extraction Failed",
                    details: "We encountered an error while processing your file.",
                    code: "ERR_EXTRACTION_FAILED"
                }, { status: 400 });
            }
        } else if (mode === 'link' && urlInput) {
            try {
                textToAnalyze = await fetchExternalUrl(urlInput);
            } catch (err) {
                const error = err as any;
                return NextResponse.json({
                    ok: false,
                    error: "Link Fetch Failed",
                    details: error.message || "We could not access or extract text from the provided URL.",
                    code: "ERR_LINK_FETCH"
                }, { status: 400 });
            }
        } else {
            textToAnalyze = textInput || '';
        }

        const isImageUpload = file?.type?.startsWith('image/');
        const isPdfFallback = (file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf')) && (textToAnalyze === "[SCANNED_PDF]" || (textToAnalyze?.trim().length || 0) < 150);
        const isMultimodal = isImageUpload || isPdfFallback;

        // Bypassing length check for all file uploads (even if text is short, we still analyze it if it's a file)
        const isFileUpload = !!file;

        if (!isFileUpload && (!textToAnalyze || textToAnalyze.trim().length < 50)) {
            return NextResponse.json({
                ok: false,
                error: 'Content too short',
                details: 'Please provide at least 50 characters of legal text.',
                code: "ERR_CONTENT_SHORT"
            }, { status: 400 });
        }

        const wordCount = textToAnalyze === "[SCANNED_PDF]" ? 500 : textToAnalyze.trim().split(/\s+/).length;
        const currentUsage = parseInt(req.headers.get('x-usage') || '0', 10);
        const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';
        const plan = req.headers.get('x-plan') || 'free';
        const userId = req.headers.get('x-user-id') || 'anonymous';

        let limit = 5000;
        if (isLoggedIn) {
            if (plan === 'pro') limit = 100000;
            else if (plan === 'business') limit = 500000;
            else limit = 10000;
        }

        if (!(isLoggedIn && plan === 'unlimited') && (currentUsage + wordCount > limit)) {
            return NextResponse.json({
                ok: false,
                error: 'Word limit reached',
                details: `Your current plan (${plan}) limit is ${limit.toLocaleString()} words.`,
                code: "ERR_QUOTA_EXCEEDED"
            }, { status: 403 });
        }

        const charLimit = 60000;
        let finalInputText = textToAnalyze;

        if (textToAnalyze.length > charLimit && !isMultimodal) {
            finalInputText = textToAnalyze.substring(0, charLimit) + "\n\n[... DOCUMENT TRUNCATED ...]";
        }

        // 1. Initial Scoring (For text documents)
        let clauseRisk = 0;
        let breakdown: any[] = [];

        if (!isMultimodal) {
            const result = calculateClauseRisk(finalInputText, jurisdiction, state);
            clauseRisk = result.score;
            breakdown = result.breakdown;
        }

        const transparencyRisk = isMultimodal ? 0 : calculateTransparency(finalInputText);

        const client = new GoogleGenAI({ apiKey });
        let responseText = "";
        let retryCount = 0;
        const maxRetries = 3;

        // Construct location context for AI
        const locationContext = state ? `${jurisdiction} (State/Region: ${state})` : jurisdiction;

        while (retryCount < maxRetries) {
            try {
                const parts: any[] = [];

                if (isMultimodal && file) {
                    const arrayBuffer = await file.arrayBuffer();
                    const base64Data = Buffer.from(arrayBuffer).toString('base64');
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: file.type
                        }
                    });
                    parts.push({ text: `SYSTEM INSTRUCTION:\n${SYSTEM_PROMPT}\n\nTASK: ANALYZE THE ATTACHED ${isPdfFallback ? 'SCANNED PDF' : 'IMAGE'}. Perform OCR first, then generate the legal analysis in JSON as instructed. Use the prompt rules for rating. JURISDICTION: ${locationContext}` });
                } else {
                    parts.push({ text: `SYSTEM INSTRUCTION:\n${SYSTEM_PROMPT}\n\nJURISDICTION: ${locationContext}\n\nBASE CLAUSE RISK: ${clauseRisk}\nDETECTED RISKS: ${JSON.stringify(breakdown.map((b: any) => b.category))}\n\nDOCUMENT TEXT:\n${finalInputText}` });
                }

                const result = await client.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [{
                        role: 'user',
                        parts: parts
                    }],
                    config: {
                        responseMimeType: "application/json",
                        temperature: 0
                    }
                });

                responseText = (result as any).text;
                if (!responseText) throw new Error("Gemini returned an empty response");
                break;
            } catch (err) {
                const error = err as any;
                const isRateLimit = error.message?.includes("429") || error.status === 429 || error.message?.includes("RESOURCE_EXHAUSTED");
                const isRetryable = isRateLimit || (error.status && error.status >= 500);

                if (isRetryable && retryCount < maxRetries - 1) {
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
                    console.warn(`[API_ANALYZE] Gemini retry ${retryCount}: ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }

        const sanitizedText = sanitizeJsonResponse(responseText);
        let aiResult;
        try {
            aiResult = JSON.parse(sanitizedText);
        } catch (e) {
            return NextResponse.json({
                ok: false,
                error: "AI Formatting Error",
                details: "The AI service returned a response that could not be parsed.",
                code: "ERR_AI_JSON"
            }, { status: 500 });
        }

        // 2. Final Score Calculation (A2 Component-based)
        const aiRating = aiResult.ai_severity?.rating || 5;
        const aggressivenessRisk = calculateAggressiveness(aiRating);

        const finalAnalysis = calculateFinalScore(
            clauseRisk,
            aggressivenessRisk,
            transparencyRisk,
            aiRating,
            aiResult.ai_severity?.reasons || [aiResult.ai_severity?.reason].filter(Boolean),
            wordCount
        );

        // Map breakdown evidence and extend with A2 schema
        finalAnalysis.breakdown = breakdown;

        const responsePayload = {
            ...finalAnalysis,
            languageDetection: aiResult.languageDetection,
            summary: enforceWordLimit(aiResult.summary, 500),
            clauses: aiResult.clauses,
            redFlags: aiResult.redFlags,
            nextSteps: aiResult.nextSteps,
            disclaimer: aiResult.disclaimer,
            wordCount: wordCount
        };

        let savedRecord = null;
        if (isLoggedIn && userId !== 'anonymous') {
            try {
                savedRecord = await storage.saveAnalysis({
                    userId: userId,
                    createdAt: new Date().toISOString(),
                    inputType: mode as any,
                    sourceName: file ? file.name : mode === 'link' ? new URL(urlInput!).hostname : "Pasted text",
                    jurisdiction: locationContext,
                    wordCount: wordCount,
                    summaryTitle: `${responsePayload.languageDetection?.primary || 'Legal'} Analysis - ${new Date().toLocaleDateString()}`,
                    rawInputReference: mode === 'paste' ? { preview: textToAnalyze.substring(0, 1000), hash: 'N/A' } : (urlInput || file?.name || 'unknown'),
                    analysisResult: responsePayload as any
                });
            } catch (saveError) {
                console.error("[API_ANALYZE] Failed to save to history:", saveError);
            }
        }

        return NextResponse.json({
            ok: true,
            data: responsePayload,
            extractedTextPreview: textToAnalyze.substring(0, 500) + (textToAnalyze.length > 500 ? "..." : ""),
            wordCount: wordCount,
            analysisId: savedRecord?.id
        });

    } catch (err) {
        const error = err as any;
        console.error("[API_ANALYZE] Global Error:", error);

        let errorMessage = "AI Service is temporarily busy. Please wait a moment.";
        let errorCode = "ERR_AI_SERVICE";

        if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "AI Service is temporarily busy (Rate Limit). Please wait a few seconds and try again.";
            errorCode = "ERR_AI_RATE_LIMIT";
        } else if (error.message?.includes("JSON")) {
            errorMessage = "AI produced malformed data. Try a smaller document.";
            errorCode = "ERR_AI_JSON";
        } else if (error.message?.includes("API key not valid")) {
            errorMessage = "Server configuration error: Invalid API Key.";
            errorCode = "ERR_CONFIG";
        }

        return NextResponse.json({
            ok: false,
            error: "AI Service Error",
            details: errorMessage,
            raw: error.message || String(error),
            code: errorCode
        }, { status: 500 });
    }
}
