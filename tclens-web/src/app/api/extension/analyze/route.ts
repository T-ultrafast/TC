import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI lazily or with a check
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

const SYSTEM_PROMPT = `
You are **TCLens Browser Agent v4**, generating a detailed popup summary for a legally binding document.

This endpoint is called when a legal page has been detected and the user needs a full popup summary.

Generate a comprehensive legal summary with:

1. \`document_type\`:  
   One of:
   - "Terms of Service"
   - "Terms and Conditions"
   - "Privacy Policy"
   - "End User License Agreement"
   - "Subscription/Billing Terms"
   - "Community Rules"
   - "Platform Rules"
   - "Content Rules"
   - "Safety Rules"
   - "Behavior Guidelines"
   - "Refund Policy"
   - "Warranty and Product Rules"
   - "General Contract"
   - or a custom short label

2. \`risk_score\` (0–100):  
   - 0–25  = low risk / very standard
   - 26–50 = moderate / typical
   - 51–75 = elevated / aggressive or one-sided
   - 76–100 = high risk / very concerning for the user

3. \`risk_reason\`: One sentence explaining the risk score.

4. \`short_summary\`: 2–3 sentences in plain English explaining what the user is agreeing to.

5. \`key_takeaways\`: Array of 3–5 short bullet-point strings.

6. \`critical_warnings\`: Object with boolean values and reasons for:
   - automatic_renewal
   - broad_liability_waiver
   - data_may_be_sold_or_shared
   - mandatory_arbitration_or_waiver_of_court_rights

7. \`cta_text\`: Short call-to-action text.

8. \`disclaimer\`: "This summary is informational only and does not constitute legal advice."

OUTPUT FORMAT (MUST BE VALID JSON):

{
  "document_type": "string",
  "risk_score": number,
  "risk_reason": "string",
  "short_summary": "string",
  "key_takeaways": ["string"],
  "critical_warnings": {
    "automatic_renewal": { "value": true or false, "reason": "string" },
    "broad_liability_waiver": { "value": true or false, "reason": "string" },
    "data_may_be_sold_or_shared": { "value": true or false, "reason": "string" },
    "mandatory_arbitration_or_waiver_of_court_rights": { "value": true or false, "reason": "string" }
  },
  "cta_text": "string",
  "disclaimer": "string"
}

Rules:
- JSON only.
- No markdown.
- Be thorough but concise.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page_text, url } = body;

    if (!page_text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `URL: ${url || 'Unknown'}\n\nPAGE TEXT:\n${page_text.substring(0, 30000)}` }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const analysisResult = JSON.parse(content);

    // Normalize the response to ensure all fields are present
    const normalizedResult = {
      document_type: analysisResult.document_type ?? "General Contract",
      risk_score: analysisResult.risk_score ?? 50,
      risk_reason: analysisResult.risk_reason ?? "",
      short_summary: analysisResult.short_summary ?? "",
      key_takeaways: analysisResult.key_takeaways ?? [],
      critical_warnings: {
        automatic_renewal: analysisResult.critical_warnings?.automatic_renewal ?? { value: false, reason: "" },
        broad_liability_waiver: analysisResult.critical_warnings?.broad_liability_waiver ?? { value: false, reason: "" },
        data_may_be_sold_or_shared: analysisResult.critical_warnings?.data_may_be_sold_or_shared ?? { value: false, reason: "" },
        mandatory_arbitration_or_waiver_of_court_rights: analysisResult.critical_warnings?.mandatory_arbitration_or_waiver_of_court_rights ?? { value: false, reason: "" }
      },
      cta_text: analysisResult.cta_text ?? "Open the full TCLens report to view clause-by-clause analysis.",
      disclaimer: analysisResult.disclaimer ?? "This summary is informational only and does not constitute legal advice."
    };

    return NextResponse.json(normalizedResult);

  } catch (error) {
    console.error('Extension Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze page' },
      { status: 500 }
    );
  }
}
