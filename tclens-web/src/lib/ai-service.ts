import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Define the schema for the analysis result
export const AnalysisSchema = z.object({
    summary: z.string().describe("A plain-english summary of the document."),
    riskScore: z.number().min(0).max(100).describe("A risk score from 0 (safe) to 100 (extremely dangerous)."),
    clauses: z.array(
        z.object({
            type: z.enum([
                "Limitation of Liability",
                "Indemnification",
                "Governing Law",
                "Arbitration",
                "Termination",
                "Warranty Disclaimer",
                "Data Usage",
                "Auto-Renewal",
                "Payment Terms",
                "Other"
            ]),
            text: z.string().describe("The exact text of the clause from the document."),
            riskLevel: z.enum(["low", "medium", "high", "critical"]),
            explanation: z.string().describe("A simple explanation of why this clause is important or risky."),
            recommendation: z.string().optional().describe("Advice on how to negotiate or handle this clause.")
        })
    ).describe("List of key legal clauses identified in the document.")
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
    const prompt = `
    You are TCLens, a senior legal AI expert. 
    Analyze the following legal document text. 
    Identify key clauses, assess risks, and provide a plain-language summary.
    
    Focus on:
    1. Unfair terms (e.g., mandatory arbitration, waiving class action rights).
    2. Data privacy risks (e.g., selling data).
    3. Financial traps (e.g., auto-renewal, hidden fees).
    
    Be strict with the risk score. 
    0-20: Very Safe
    21-50: Standard/Fair
    51-75: Risky
    76-100: Dangerous/Predatory
    
    Document Text:
    "${text.slice(0, 50000)}" // Truncate to avoid token limits if necessary, though 4o handles large context.
  `;

    const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: AnalysisSchema,
        prompt: prompt,
    });

    return object;
}
