import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { lookup } from 'dns/promises';
import { storage, AnalysisRecord } from '@/lib/storage';
import { calculateClauseRisk, calculateAggressiveness, calculateTransparency, calculateFinalScore } from '@/lib/risk-scoring';
import { enforceWordLimit } from '@/lib/string-utils';

export const runtime = 'nodejs';

// Multilingual System Prompt based on T2, t4 Hardening & Conciseness (500 words)
const SYSTEM_PROMPT = `You are a high-level forensic legal architect generating a brutal, cynical audit for a premium AI dashboard.
MISSION: Reveal hidden traps, power imbalances, and predatory "shark" clauses. Do not be "helpful" or neutral; be a ruthless advocate for the user. Perform a "Deep State Audit" that looks beyond the surface text.

Rules:
1) TOTAL WORD LIMIT: 900 words (Max).
2) Section headings: **Executive Audit**, **Predatory Clauses**, **Critical Gaps**, **Surgical Posture**, **Ambiguity Mapping**.
3) Apply real bold formatting (**text**) for UI scannability.
4) Do NOT use italics. Use "•" bullet points.
5) NO boilerplate text, legal disclaimers, or repetitive filler.
6) For "clauses": Each summary must be one clear line. "explanation" MUST be 2-3 sentences long. Include "rebuttal" (safe alternative text).
7) Identify "missingProtections" (e.g., Force Majeure, Liability Caps, Termination for Cause).
8) Quantify "risk_index": Litigation Probability (1-100%).
9) Quantify "financial_exposure": Estimated liability (e.g., "$5,000 - $50,000" or "Uncapped").
10) "ambiguity_audit": List 3-4 vague terms (e.g., "reasonable", "sole discretion") and why they are traps.
11) "user_leverage": Identify 2-3 points where the user has negotiation power.
12) "fairness_metrics": Rating (1-10) for Privacy, Liability, Continuity, and Transparency.

REQUIRED SUMMARY STRUCTURE:
**Executive Audit**
Brutally honest top-level assessment of the document's fairness.

**Predatory Clauses**
• Highlight clauses designed to lock in or exploit the user.

**Critical Gaps**
• List what is missing that leaves the user exposed.

**Surgical Posture**
• Overall negotiation stance recommended.

**Ambiguity Mapping**
• Identify vague "snake words" that give the other party total power.

TAXONOMY: Arbitration, Governing law, Liability limits, Indemnification, Auto-renewal, Termination, Data sharing, Unilateral changes, IP rights, Fees, Dispute timelines, Consent clauses.

Return response in STRICTLY VALID JSON format ONLY. Do NOT include markdown code blocks or JSON fences, conversational text, or any characters outside of the JSON structure. Failure to comply with strict JSON formatting will break the intelligence pipeline.
{
    "languageDetection": { "primary": "string", "secondary": ["string"] },
    "summary": "string (Strictly 800-word max, 5-section structure)",
        "ai_severity": { "rating": "number (1-10)", "reason": "string" },
    "confidence": "number",
        "litigation_risk_index": "number (1-100)",
            "financial_exposure": "string (e.g., Uncapped Liability, $20k Loss Potential)",
                "fairness_metrics": {
        "privacy": "number",
            "liability": "number",
                "transparency": "number",
                    "continuity": "number"
    },
    "ambiguity_audit": [{ "term": "string", "context": "string", "risk": "string" }],
        "user_leverage": [{ "point": "string", "strategy": "string" }],
            "clauses": [{
                "type": "string",
                "summary": "string",
                "riskLevel": "Low | Medium | High | Critical",
                "explanation": "string",
                "rebuttal": "string (the exact legal text to request as a fix)",
                "originalExcerpt": "string"
            }],
                "missingProtections": [{ "type": "string", "description": "string", "fix": "string" }],
                    "redFlags": [{ "title": "string", "description": "string", "implication": "string" }],
                        "nextSteps": ["string"],
                            "disclaimer": "Forensic AI analysis. Not legal advice."
} `;

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
 * Sanitizes the AI's response with a high-resilience parser.
 * This handles markdown blocks, conversational filler, and structural truncation.
 */
function sanitizeJsonResponse(text: string): string {
    if (!text) return "{}";

    try {
        // 1. Precise Markdown Block Extraction (Fixing the previous fragile regex)
        const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        let extracted = jsonBlockMatch ? jsonBlockMatch[1] : text;

        // 2. Structural Recovery (Find the outermost braces)
        const startIdx = extracted.indexOf('{');
        const endIdx = extracted.lastIndexOf('}');

        if (startIdx !== -1) {
            // Truncate to the actual JSON boundaries
            extracted = extracted.substring(startIdx, (endIdx !== -1 && endIdx > startIdx) ? endIdx + 1 : extracted.length);
        }

        // 3. Structural Repair (Fix common AI formatting hiccups)
        extracted = extracted
            .trim()
            .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
            .replace(/}\s*{/g, '},{')      // Fix missing object separators
            .replace(/]\s*\[/g, '],[')     // Fix missing array separators
            .replace(/"\s*"/g, '","');   // Fix missing property separators

        // 4. Truncation Healing (If the JSON is cut off, attempt to close it)
        let openBraces = (extracted.match(/{/g) || []).length;
        let closeBraces = (extracted.match(/}/g) || []).length;
        let openBrackets = (extracted.match(/\[/g) || []).length;
        let closeBrackets = (extracted.match(/]/g) || []).length;

        // Append missing closing symbols
        while (openBraces > closeBraces) {
            extracted += '}';
            closeBraces++;
        }
        while (openBrackets > closeBrackets) {
            extracted += ']';
            closeBrackets++;
        }

        return extracted;
    } catch (e) {
        console.error("[API_ANALYZE] Sanitization internal failure:", e);
        return text;
    }
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
            throw new Error(`Failed to fetch URL: ${response.statusText} `);
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
        console.error(`[API_ANALYZE] URL fetch failed(${url}): `, err.message);
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

        console.log(`[API_ANALYZE] Request - Mode: ${mode}, Jurisdiction: ${jurisdiction}, State: ${state} `);

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
                        details: `File type '${file.type}' is not recognized.Please use PDF, DOCX, TXT, or Image files.`,
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

        let limit = 25000; // Increased base limit for forensic audits
        if (isLoggedIn) {
            if (plan === 'pro') limit = 250000;
            else if (plan === 'business') limit = 1000000;
            else limit = 50000;
        }

        if (!(isLoggedIn && plan === 'unlimited') && (currentUsage + wordCount > limit)) {
            return NextResponse.json({
                ok: false,
                error: 'Analysis Limit Reached',
                details: `Your current tier(${plan}) limit is ${limit.toLocaleString()} words for forensic auditing.Please upgrade for industrial - scale documents.`,
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
        const locationContext = state ? `${jurisdiction} (State / Region: ${state})` : jurisdiction;

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
                    parts.push({ text: `SYSTEM INSTRUCTION: \n${SYSTEM_PROMPT} \n\nTASK: ANALYZE THE ATTACHED ${isPdfFallback ? 'SCANNED PDF' : 'IMAGE'}. Perform OCR first, then generate the legal analysis in JSON as instructed.Use the prompt rules for rating.JURISDICTION: ${locationContext} ` });
                } else {
                    parts.push({ text: `SYSTEM INSTRUCTION: \n${SYSTEM_PROMPT} \n\nJURISDICTION: ${locationContext} \n\nBASE CLAUSE RISK: ${clauseRisk} \nDETECTED RISKS: ${JSON.stringify(breakdown.map((b: any) => b.category))} \n\nDOCUMENT TEXT: \n${finalInputText} ` });
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
                    console.warn(`[API_ANALYZE] Gemini retry ${retryCount}: ${error.message} `);
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
        } catch (e: any) {
            console.error("[API_ANALYZE] JSON Parse Error:", e, "Raw Text:", responseText.substring(0, 500));
            return NextResponse.json({
                ok: false,
                error: "Forensic Formatting Error",
                details: "The Document Analysis Engine encountered a structural limit due to high legal complexity. This usually happens when a document has non-standard nesting or exceeded the intelligence buffer. PROVISION: Please try analyzing a specific section or re-extracting with a smaller snippet for high-precision results.",
                raw: e.message,
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
            summary: enforceWordLimit(aiResult.summary, 800),
            clauses: aiResult.clauses,
            redFlags: aiResult.redFlags,
            missingProtections: aiResult.missingProtections,
            litigation_risk_index: aiResult.litigation_risk_index,
            financial_exposure: aiResult.financial_exposure,
            fairness_metrics: aiResult.fairness_metrics,
            ambiguity_audit: aiResult.ambiguity_audit,
            user_leverage: aiResult.user_leverage,
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
                    summaryTitle: `${responsePayload.languageDetection?.primary || 'Legal'} Analysis - ${new Date().toLocaleDateString()} `,
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


