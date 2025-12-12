/**
 * TypeScript types for TCLens Browser Agent v4 (T3) output format
 */

export type LegalScope = "full_page" | "section_only" | "fragment" | "none";
export type TriggerRecommendation = "none" | "show_badge" | "show_popup";

export type DocumentType =
  | "Terms of Service"
  | "Terms and Conditions"
  | "Privacy Policy"
  | "End User License Agreement"
  | "Subscription/Billing Terms"
  | "Community Rules"
  | "Platform Rules"
  | "Content Rules"
  | "Safety Rules"
  | "Behavior Guidelines"
  | "Refund Policy"
  | "Warranty and Product Rules"
  | "General Contract"
  | string; // Allow custom labels

export interface CriticalWarning {
  value: boolean;
  reason: string;
}

export interface CriticalWarnings {
  automatic_renewal: CriticalWarning;
  broad_liability_waiver: CriticalWarning;
  data_may_be_sold_or_shared: CriticalWarning;
  mandatory_arbitration_or_waiver_of_court_rights: CriticalWarning;
}

/**
 * Detection result from the /api/extension/detect endpoint
 * Matches the T3 specification
 */
export interface DetectionResult {
  is_legal_page: boolean;
  legally_binding: boolean;
  confidence: number;
  scope: LegalScope;
  trigger_recommendation: TriggerRecommendation;
  classification: string;
  reason: string;
  document_type: DocumentType | null;
  risk_score: number | null;
  risk_reason: string | null;
  short_summary: string | null;
  key_takeaways: string[];
  critical_warnings: CriticalWarnings;
  cta_text: string | null;
  disclaimer: string | null;
}

/**
 * Analysis result from the /api/extension/analyze endpoint
 * Used when generating popup summaries
 */
export interface AnalysisResult {
  document_type: DocumentType;
  risk_score: number;
  risk_reason: string;
  short_summary: string;
  key_takeaways: string[];
  critical_warnings: CriticalWarnings;
  cta_text: string;
  disclaimer: string;
}
