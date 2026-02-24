import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateClauseRisk, calculateAggressiveness, calculateTransparency, calculateFinalScore, DetectedRisk } from '@/lib/risk-scoring';
import { enforceWordLimit } from '@/lib/string-utils';
import { storage } from '@/lib/storage';

// Initialize OpenAI lazily or with a check
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

const SYSTEM_PROMPT = `
You are **Terms Analyzer Browser Agent v4**, generating a detailed and EXPLAINABLE summary for a legally binding document.

This endpoint is called when a legal page has been detected and the user needs a full popup summary.

Input:
- URL
- Extracted Page Text
- **Calculated Base Risk Score** (0-70) based on detected keywords (provided by code).
- **Detected Risk Flags** (list of issues found by regex).

Your Goal:
Validate the base risks and provide a **"severity_rating_1_to_10"** (integer) based on the overall context and tone.
- 1 = Benign / Standard
- 10 = Extremely Predatory / Unfair

Generate a comprehensive legal summary with:

1. \`document_type\`: "Terms of Service", "Privacy Policy", etc.

2. \`ai_severity\`: Object with:
   - \`rating\`: number (1-10)
   - \`reason\`: string (Short explanation of why you gave this rating)

3. \`short_summary\`: Strictly maximum 80 words in plain English explaining what the user is agreeing to.

4. \`key_takeaways\`: Array of 3–5 short bullet-point strings.

5. \`critical_warnings\`: Object with boolean values and reasons for:
   - automatic_renewal
   - broad_liability_waiver
   - data_may_be_sold_or_shared
   - mandatory_arbitration_or_waiver_of_court_rights

6. \`cta_text\`: Short call-to-action text.

OUTPUT FORMAT (MUST BE VALID JSON):

{
  "document_type": "string",
  "ai_severity": { "rating": number, "reason": "string" },
  "short_summary": "string",
  "key_takeaways": ["string"],
  "critical_warnings": { ... },
  "cta_text": "string"
}
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page_text, url, report_id } = body;

    if (!page_text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // 1. Calculate Rules-Based Score
    const { score: baseScore, breakdown } = calculateClauseRisk(page_text);

    // 2. Call OpenAI for Context & Severity
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `URL: ${url || 'Unknown'}\n\nBASE SCORE: ${baseScore}\nDETECTED FLAGS: ${JSON.stringify(breakdown.map(b => b.label))}\n\nPAGE TEXT:\n${page_text.substring(0, 30000)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const aiResult = JSON.parse(content);

    // 3. Compute Final Score
    const aiRating = aiResult.ai_severity?.rating || 1;
    const aiReason = aiResult.ai_severity?.reason || "";

    const aggressiveness = calculateAggressiveness(aiRating);
    const transparency = calculateTransparency(page_text);

    const finalResult = calculateFinalScore(
      baseScore,
      aggressiveness,
      transparency,
      aiRating,
      [aiReason]
    );

    // Normalize the response to ensure all fields are present
    const normalizedResult = {
      document_type: aiResult.document_type ?? "General Contract",

      // New Scoring Fields
      risk_score: finalResult.risk_score,
      risk_level: finalResult.risk_level,
      risk_breakdown: breakdown, // Rules-based findings
      ai_severity: finalResult.ai_severity,

      short_summary: enforceWordLimit(aiResult.short_summary ?? "", 80),
      key_takeaways: aiResult.key_takeaways ?? [],
      critical_warnings: {
        automatic_renewal: aiResult.critical_warnings?.automatic_renewal ?? { value: false, reason: "" },
        broad_liability_waiver: aiResult.critical_warnings?.broad_liability_waiver ?? { value: false, reason: "" },
        data_may_be_sold_or_shared: aiResult.critical_warnings?.data_may_be_sold_or_shared ?? { value: false, reason: "" },
        mandatory_arbitration_or_waiver_of_court_rights: aiResult.critical_warnings?.mandatory_arbitration_or_waiver_of_court_rights ?? { value: false, reason: "" }
      },
      cta_text: aiResult.cta_text ?? "Open the full Terms Analyzer report to view clause-by-clause analysis.",
      full_report_url: `${req.nextUrl.origin}/app/document?report_id=${report_id || 'new'}`,
      disclaimer: "This summary is informational only and does not constitute legal advice."
    };

    // 4. Persist to Storage for "Full Report" access
    try {
      await storage.saveAnalysis({
        userId: 'anonymous', // Extension reports are publicly accessible by ID
        createdAt: new Date().toISOString(),
        inputType: 'link',
        sourceName: url ? new URL(url).hostname : "Browser Page",
        jurisdiction: "General",
        wordCount: page_text.split(/\s+/).length,
        summaryTitle: `${normalizedResult.document_type} - ${new Date().toLocaleDateString()}`,
        rawInputReference: url || "Extension Analysis",
        analysisResult: {
          ...normalizedResult,
          summary: normalizedResult.short_summary // Map for compatibility with web UI
        }
      });
    } catch (saveError) {
      console.error("Failed to persist extension analysis:", saveError);
    }

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json(normalizedResult, { headers });

  } catch (error) {
    console.error('Extension Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze page' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
