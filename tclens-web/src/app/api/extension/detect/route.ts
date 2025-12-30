import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Define schema for Gemini Structured Output
const responseSchema = {
    type: "OBJECT",
    properties: {
        is_legal_page: { type: "BOOLEAN" },
        legally_binding: { type: "BOOLEAN" },
        confidence: { type: "NUMBER" },
        scope: { type: "STRING", enum: ["full_page", "section_only", "fragment", "none"] },
        trigger_recommendation: { type: "STRING", enum: ["none", "show_badge", "show_popup"] },
        classification: { type: "STRING" },
        reason: { type: "STRING" },
        document_type: { type: "STRING", nullable: true },
        risk_score: { type: "NUMBER", nullable: true },
        risk_reason: { type: "STRING", nullable: true },
        short_summary: { type: "STRING", nullable: true },
        key_takeaways: { type: "ARRAY", items: { type: "STRING" } },
        critical_warnings: {
            type: "OBJECT",
            properties: {
                automatic_renewal: { type: "OBJECT", properties: { value: { type: "BOOLEAN" }, reason: { type: "STRING" } } },
                broad_liability_waiver: { type: "OBJECT", properties: { value: { type: "BOOLEAN" }, reason: { type: "STRING" } } },
                data_may_be_sold_or_shared: { type: "OBJECT", properties: { value: { type: "BOOLEAN" }, reason: { type: "STRING" } } },
                mandatory_arbitration_or_waiver_of_court_rights: { type: "OBJECT", properties: { value: { type: "BOOLEAN" }, reason: { type: "STRING" } } }
            }
        },
        cta_text: { type: "STRING", nullable: true },
        disclaimer: { type: "STRING", nullable: true }
    },
    required: [
        "is_legal_page",
        "legally_binding",
        "confidence",
        "scope",
        "trigger_recommendation",
        "classification",
        "reason",
        "key_takeaways",
        "critical_warnings"
    ]
};

const SYSTEM_PROMPT = `
You are **TCLens Browser Agent v4**, an AI assistant powered by Google Gemini.

Your responsibilities:
1. Detect whether the current webpage contains ANY content that is, or could reasonably be interpreted as, **legally binding** on the user.
2. Identify and classify traditional legal documents and Rules pages.
3. Detect hidden or embedded legally binding content.
4. Determine whether to display: no UI, a subtle badge, or a full popup with summary.
5. Provide structured output matching the JSON schema.

INPUT:
- \`page_text\`: the visible text from the current webpage.
- Optionally: \`url\` or \`title\`.

------------------------------------------------------------
STEP 1 — DETECT LEGALLY BINDING CONTENT
------------------------------------------------------------
Treat content as **legally binding** if it includes obligations, restrictions, waivers, disclaimers, permissions, arbitration clauses, conduct rules, etc.

------------------------------------------------------------
STEP 2 — DETERMINE RECOMMENDED UI TRIGGER
------------------------------------------------------------
- "show_popup":
  - scope=full_page AND legally_binding=true AND confidence >= 60
  - OR scope=section_only AND legally_binding=true AND confidence >= 70
- "show_badge":
  - legally_binding=true AND confidence >= 40 AND scope=section_only
  - OR legally_binding=true AND scope=fragment AND confidence >= 60
- "none":
  - legally_binding=false OR confidence < 40 OR (scope=fragment AND confidence < 60)

------------------------------------------------------------
STEP 3 — POPUP SUMMARY (Only if show_popup)
------------------------------------------------------------
Provide risk_score, risk_reason, short_summary, key_takeaways (3-5 items), critical_warnings, and cta_text.

If trigger_recommendation != "show_popup":
- Set risk_score = null
- Set short_summary = null
- Set key_takeaways = []
- Set all critical_warnings values to false
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { page_text, url, title } = body;

        if (!page_text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return NextResponse.json(
                { error: 'Server configuration error: Missing API Key' },
                { status: 500 }
            );
        }

        const client = new GoogleGenAI({ apiKey });

        // Build user message
        let userMessage = `PAGE TEXT:\n${page_text.substring(0, 30000)}`;
        if (url) userMessage = `URL: ${url}\n${userMessage}`;
        if (title) userMessage = `TITLE: ${title}\n${userMessage}`;

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
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

        const parsedResult = JSON.parse(responseContent);

        // Normalize result just in case (though structured outputs should handle it)
        const normalizedResult = {
            ...parsedResult,
            key_takeaways: parsedResult.key_takeaways || [],
            critical_warnings: parsedResult.critical_warnings || {
                automatic_renewal: { value: false, reason: "" },
                broad_liability_waiver: { value: false, reason: "" },
                data_may_be_sold_or_shared: { value: false, reason: "" },
                mandatory_arbitration_or_waiver_of_court_rights: { value: false, reason: "" }
            }
        };

        return NextResponse.json(normalizedResult);

    } catch (error) {
        console.error('Detection error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze page', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
