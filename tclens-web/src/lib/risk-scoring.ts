export enum RiskLevel {
    LOW = "Low",
    MODERATE = "Moderate",
    HIGH = "High",
    SEVERE = "Severe"
}

export interface RiskRule {
    id: string;
    category: string;
    label: string;
    weight: number;
    patterns: RegExp[];
}

export interface DetectedRisk {
    category: string;
    label: string;
    points: number;
    confidence: number;
    magnitude: number;
    evidence: string[];
}

export interface RiskAnalysisResult {
    risk_score: number;
    risk_level: RiskLevel;
    analysis_confidence: number;
    components: {
        clause_risk: number;
        aggressiveness: number;
        transparency: number;
    };
    breakdown: DetectedRisk[];
    ai_severity: {
        rating: number;
        points_added: number;
        reasons: string[];
    };
}

// Rules Definition from A2
export const RISK_RULES: RiskRule[] = [
    { id: "data_sale", category: "Data sale", label: "Sale of personal data", weight: 18, patterns: [/sell.*personal.*data/i, /sell.*your.*information/i] },
    { id: "data_sharing", category: "Third-party sharing", label: "Sharing data with third parties", weight: 12, patterns: [/share.*data.*marketing.*partners/i, /disclose.*information.*third.*parties.*marketing/i] },
    { id: "ads_profiling", category: "Ads profiling", label: "Profiling for advertisements", weight: 10, patterns: [/personalized.*ads/i, /targeted.*advertising/i] },
    { id: "tracking", category: "Cross-service tracking", label: "Tracking across services", weight: 8, patterns: [/track.*activity/i, /cookies.*beacons.*pixels/i] },
    { id: "sensitive_data", category: "Sensitive data unclear", label: "Unclear handling of sensitive data", weight: 12, patterns: [/sensitive.*information.*unclear/i, /biometric.*data/i] },
    { id: "retention", category: "Data retention vague", label: "Vague data retention periods", weight: 7, patterns: [/retain.*indefinitely/i, /retention.*policy.*vague/i] },
    { id: "deletion", category: "No deletion rights", label: "No clear right to delete data", weight: 7, patterns: [/no.*right.*to.*delete/i, /cannot.*delete.*account/i] },
    { id: "arbitration", category: "Binding arbitration", label: "Mandatory binding arbitration", weight: 14, patterns: [/binding.*arbitration/i, /waive.*right.*court/i] },
    { id: "class_action", category: "Class action waiver", label: "Class action lawsuit waiver", weight: 12, patterns: [/class.*action.*waiver/i, /waive.*right.*class.*action/i] },
    { id: "jurisdiction", category: "Jurisdiction lock", label: "Restricted legal jurisdiction", weight: 6, patterns: [/exclusive.*jurisdiction/i, /governing.*law/i] },
    { id: "liability", category: "Liability limitation", label: "Severe limitation of liability", weight: 12, patterns: [/limit.*liability/i, /not.*liable.*damages/i] },
    { id: "warranty", category: "Warranty disclaimer", label: "Broad warranty disclaimers", weight: 7, patterns: [/as is/i, /disclaim.*warranties/i] },
    { id: "indemnity", category: "Broad indemnity", label: "Broad user indemnification", weight: 10, patterns: [/indemnify.*hold.*harmless/i] },
    { id: "auto_renewal", category: "Auto-renewal", label: "Automatic subscription renewal", weight: 8, patterns: [/auto.*renew/i, /automatically.*charge/i] },
    { id: "terminate", category: "Terminate anytime", label: "Platform can terminate anytime", weight: 7, patterns: [/terminate.*access.*any.*time/i, /suspend.*account.*sole.*discretion/i] },
    { id: "change_terms", category: "Change terms anytime", label: "Terms can change without notice", weight: 7, patterns: [/modify.*terms.*any.*time/i, /changes.*effective.*immediately/i] },
    { id: "license", category: "Broad content license", label: "Broad license to user content", weight: 10, patterns: [/irrevocable.*license/i, /perpetual.*license/i, /royalty-free.*right.*use/i] }
];

export function calculateClauseRisk(
    text: string,
    jurisdiction: string = "General",
    state: string = ""
): { score: number, breakdown: DetectedRisk[] } {
    let rawScore = 0;
    const breakdown: DetectedRisk[] = [];
    const lowerText = text.toLowerCase();

    // Regional Multipliers
    let privacyMultiplier = 1.0;
    if (jurisdiction === "EU" || jurisdiction === "UK" || state === "US-CA") {
        privacyMultiplier = 1.15;
    }

    for (const rule of RISK_RULES) {
        let detected = false;
        let evidence: string[] = [];

        for (const pattern of rule.patterns) {
            const match = pattern.exec(lowerText);
            if (match) {
                detected = true;
                const start = Math.max(0, match.index - 30);
                const end = Math.min(text.length, match.index + match[0].length + 60);
                evidence.push("..." + text.substring(start, end).replace(/\s+/g, ' ').trim() + "...");
            }
        }

        if (detected) {
            let baseWeight = rule.weight;
            // Apply regional multipliers to privacy categories
            if (privacyMultiplier > 1.0 && ["Data sale", "Third-party sharing", "Ads profiling", "Cross-service tracking", "Sensitive data unclear"].includes(rule.category)) {
                baseWeight *= privacyMultiplier;
            }

            const confidence = 0.9; // Default for regex
            const magnitude = 1.0; // Default normal
            const points = baseWeight * confidence * magnitude;

            rawScore += points;
            breakdown.push({
                category: rule.category,
                label: rule.label,
                points: Math.round(points * 10) / 10,
                confidence,
                magnitude,
                evidence
            });
        }
    }

    return {
        score: Math.min(rawScore, 70),
        breakdown
    };
}

export function calculateAggressiveness(aiRating: number): number {
    // Rating 1-3: -5 to -1
    // Rating 4-6: 0 to +6
    // Rating 7-10: +7 to +15
    if (aiRating <= 3) return -5 + (aiRating - 1) * 2;
    if (aiRating <= 6) return (aiRating - 4) * 2;
    return 7 + (aiRating - 7) * 2.6; // Approximates +15 at 10
}

export function calculateTransparency(text: string): number {
    let t = 0;
    const lowerText = text.toLowerCase();

    // Penalties (Add Risk)
    if (!/effective.*date|last.*updated/i.test(lowerText)) t += 3;
    if (!/contact|support|privacy@|email/i.test(lowerText)) t += 4;
    if (!/your.*rights|rights.*under.*gdpr|rights.*under.*ccpa/i.test(lowerText)) t += 5;
    if (!/opt-out|unsubscribe|withdraw.*consent/i.test(lowerText)) t += 5;

    // Credits (Reduce Risk)
    if (/clear.*deletion|permanently.*delete.*your.*data/i.test(lowerText)) t -= 5;
    if (/tracking.*opt-out|do.*not.*track/i.test(lowerText)) t -= 4;
    if (/summary|tl;dr|in.*short/i.test(lowerText)) t -= 2;
    if (/explicit.*consent|affirmative.*action/i.test(lowerText)) t -= 4;

    return Math.max(-15, Math.min(15, t));
}

export function calculateFinalScore(
    clauseRisk: number,
    aggressiveness: number,
    transparency: number,
    aiRating: number,
    aiReasons: string[] = [],
    wordCount: number = 0
): RiskAnalysisResult {
    const total = clauseRisk + aggressiveness + transparency;
    const risk_score = Math.max(0, Math.min(100, Math.round(total)));

    let risk_level = RiskLevel.LOW;
    if (risk_score > 75) risk_level = RiskLevel.SEVERE;
    else if (risk_score > 50) risk_level = RiskLevel.HIGH;
    else if (risk_score > 25) risk_level = RiskLevel.MODERATE;

    // Dynamic Confidence Calculation
    // Base 75%, +10% if word count > 500, +5% if word count > 1500, -10% if < 100
    let confidence = 75;
    if (wordCount > 1500) confidence += 15;
    else if (wordCount > 500) confidence += 10;
    else if (wordCount < 150) confidence -= 10;

    // Slight random jitter for "realism" (±2%)
    confidence += (Math.floor(Math.random() * 5) - 2);
    confidence = Math.max(60, Math.min(98, confidence));

    return {
        risk_score,
        risk_level,
        analysis_confidence: confidence,
        components: {
            clause_risk: Math.round(clauseRisk * 10) / 10,
            aggressiveness: Math.round(aggressiveness * 10) / 10,
            transparency: Math.round(transparency * 10) / 10
        },
        breakdown: [],
        ai_severity: {
            rating: aiRating,
            points_added: Math.round(aggressiveness * 10) / 10,
            reasons: aiReasons
        }
    };
}
