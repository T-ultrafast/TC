"use client";

import React, { useState, useEffect } from "react";
import {
    Upload, FileText, Zap, AlertTriangle, Check, ChevronRight,
    Loader2, Search, Link as LinkIcon, Type as TypeIcon,
    CheckCircle, Globe, Plus, Download, Scale, ArrowRight,
    Sparkles, Save, Info, BrainCircuit, MessageCircle
} from "lucide-react";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill with SSR disabled to prevent findDOMNode error
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
}, {
    ssr: false,
    loading: () => <div className="min-h-[200px] bg-muted/30 rounded-none border border-border flex items-center justify-center">
        <div className="text-sm text-muted-foreground font-medium">Loading editor...</div>
    </div>
});
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";
import { DOCUMENT_PARAMS_MAP, DEFAULT_PARAMS } from "@/lib/document-params";

const LIMITS = {
    ANONYMOUS: 200,
    FREE_USER: 1000,
    PREMIUM: 5000,
    UNLIMITED: Infinity
};

const countWords = (str: string) => {
    return str.trim().split(/\s+/).length;
};

const countWordsFromHtml = (html: string) => {
    // Strip HTML tags and count words
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
};

const getUsage = (loggedIn: boolean) => {
    if (typeof window === 'undefined') return 0;
    const key = loggedIn ? 'tclens_usage_user' : 'tclens_usage_anon';
    return parseInt(localStorage.getItem(key) || '0');
};

const trackUsage = (count: number, loggedIn: boolean) => {
    const key = loggedIn ? 'tclens_usage_user' : 'tclens_usage_anon';
    const current = getUsage(loggedIn);
    localStorage.setItem(key, (current + count).toString());
};

const JURISDICTION_DATA: Record<string, string[]> = {
    "United States (Federal)": [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Washington D.C."
    ],
    "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
    "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"],
    "Australia": ["New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia", "Australian Capital Territory", "Northern Territory"],
    "India": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"],
    "Nigeria": ["Lagos", "Abuja (FCT)", "Kano", "Rivers", "Oyo", "Delta", "Kaduna", "Ogun", "Enugu", "Edo"],
    "South Africa": ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
};

export default function DocumentPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usage, setUsage] = useState(0);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [tab, setTab] = useState("analyze"); // analyze | generate
    const [isVerifiedHandshake, setIsVerifiedHandshake] = useState(false);
    const EXTENSION_ONLY = process.env.NEXT_PUBLIC_EXTENSION_ONLY === "true";

    // Analysis State
    const [inputMode, setInputMode] = useState("paste"); // paste | upload | link
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetchingStage, setFetchingStage] = useState("idle"); // idle | fetching | extracting | analyzing | completed
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [currentWordCount, setCurrentWordCount] = useState(0);

    const [jurisdiction, setJurisdiction] = useState("");
    const [geoState, setGeoState] = useState(""); // State/Region

    useEffect(() => {
        // Bypassing auth for design
        const loggedIn = true;
        setIsLoggedIn(loggedIn);
        setUsage(getUsage(loggedIn));

        // Load saved jurisdiction & state
        const savedJurisdiction = localStorage.getItem("tclens-jurisdiction");
        const savedState = localStorage.getItem("tclens-geo-state");

        if (savedJurisdiction) {
            setJurisdiction(savedJurisdiction);
            if (savedState) {
                const validStates = JURISDICTION_DATA[savedJurisdiction] || [];
                if (validStates.includes(savedState) || savedState === "None / Not specified") {
                    setGeoState(savedState);
                }
            }
        }

        // Listen for extension handshake
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === "TCLENS_HANDSHAKE") {
                console.log("TCLens: Verified Extension Handshake received");
                setIsVerifiedHandshake(true);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const searchParams = useSearchParams();
    const reportId = searchParams.get('report_id');

    useEffect(() => {
        if (reportId && reportId !== 'new') {
            const loadReport = async () => {
                setLoading(true);
                setFetchingStage("fetching");
                try {
                    const response = await fetch(`/api/analysis/${reportId}`);
                    if (!response.ok) throw new Error("Failed to load report");
                    const data = await response.json();

                    // Map data to state
                    setResult(data.analysisResult);
                    setAnalysisId(data.id);
                    setFetchingStage("completed");
                } catch (err) {
                    console.error("Error loading report from URL:", err);
                    setError("Could not load the report. It may have expired or the link is invalid.");
                    setFetchingStage("idle");
                } finally {
                    setLoading(false);
                }
            };
            loadReport();
        }
    }, [reportId]);

    const handleJurisdictionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setJurisdiction(value);
        localStorage.setItem("tclens-jurisdiction", value);

        // Reset state when jurisdiction changes
        setGeoState("");
        localStorage.removeItem("tclens-geo-state");
    };

    const handleGeoStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setGeoState(value);
        if (value) localStorage.setItem("tclens-geo-state", value);
        else localStorage.removeItem("tclens-geo-state");
    };

    const fetchHistory = async () => {
        const loggedInUser = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
        if (!loggedInUser) return;

        try {
            const response = await fetch('/api/analysis', {
                headers: {
                    'x-is-logged-in': 'true',
                    'x-user-id': loggedInUser.email
                }
            });
            const data = await response.json();
            if (data.ok) setHistory(data.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const fetchChatMessages = async (id: string) => {
        const loggedInUser = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
        const userId = loggedInUser?.email || 'anonymous';
        const isLoggedInVal = !!loggedInUser;

        try {
            const response = await fetch(`/api/analysis/${id}/chat`, {
                headers: {
                    'x-is-logged-in': isLoggedInVal.toString(),
                    'x-user-id': userId
                }
            });
            const data = await response.json();
            if (data.ok) setChatMessages(data.data);
        } catch (err) {
            console.error("Failed to fetch chat:", err);
        }
    };

    // Effect for real-time word count in paste/link mode
    useEffect(() => {
        if (inputMode === "paste") {
            setCurrentWordCount(countWords(text));
        } else if (inputMode === "link" && result) {
            setCurrentWordCount((result as any).wordCount || 0);
        } else {
            setCurrentWordCount(0);
        }
    }, [text, inputMode, result]);

    const user = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
    const plan = user?.plan || "free";

    let currentLimit = LIMITS.ANONYMOUS;
    if (isLoggedIn) {
        // Force unlimited for any logged in user during dev
        currentLimit = LIMITS.UNLIMITED;
    }

    const usagePercentage = currentLimit === Infinity ? 0 : Math.min(100, (usage / currentLimit) * 100);
    const isOverLimit = currentLimit === Infinity ? false : (usage + currentWordCount) > currentLimit;

    // Generation State
    const [genType, setGenType] = useState("");
    const [genResult, setGenResult] = useState<string | null>(null);
    const [genLoading, setGenLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mobileGenView, setMobileGenView] = useState<'builder' | 'preview'>('builder');
    const [genJurisdiction, setGenJurisdiction] = useState("");
    const [genState, setGenState] = useState("");
    const [keyDetails, setKeyDetails] = useState("");
    const [keyDetailsWordCount, setKeyDetailsWordCount] = useState(0);
    const [customParams, setCustomParams] = useState<Record<string, string>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [useWatermark, setUseWatermark] = useState(false);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [mounted, setMounted] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [hasSavedDraft, setHasSavedDraft] = useState(false);
    const [savedDraftTime, setSavedDraftTime] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const savedRaw = localStorage.getItem("tclens-doc-draft");
        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                if (parsed && parsed.timestamp) {
                    setHasSavedDraft(true);
                    setSavedDraftTime(new Date(parsed.timestamp).toLocaleString());
                }
            } catch (e) { }
        }
    }, []);

    const handleSaveDraft = () => {
        const draftData = {
            timestamp: new Date().toISOString(),
            wizardStep,
            genType,
            genJurisdiction,
            genState,
            keyDetails,
            customParams
        };
        localStorage.setItem("tclens-doc-draft", JSON.stringify(draftData));
        setHasSavedDraft(true);
        setSavedDraftTime(new Date().toLocaleString());
    };

    const handleResumeDraft = () => {
        const savedRaw = localStorage.getItem("tclens-doc-draft");
        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                setWizardStep(parsed.wizardStep || 1);
                setGenType(parsed.genType || "");
                setGenJurisdiction(parsed.genJurisdiction || "");
                setGenState(parsed.genState || "");
                setKeyDetails(parsed.keyDetails || "");
                setCustomParams(parsed.customParams || {});
            } catch (e) { }
        }
    };
    // Document type options organized by categories
    const documentOptions = {
        "Business / Corporate": [
            "NDA (Mutual)",
            "NDA (One-way)",
            "Service Agreement",
            "Master Services Agreement (MSA)",
            "Statement of Work (SOW)",
            "Consulting Agreement",
            "Independent Contractor Agreement",
            "Partnership Agreement",
            "Joint Venture Agreement",
            "Shareholders Agreement",
            "Operating Agreement (LLC)",
            "Subscription / SaaS Agreement",
            "Vendor / Supplier Agreement"
        ],
        "Employment / HR": [
            "Employment Offer Letter",
            "Employment Agreement",
            "Non-Compete Agreement",
            "Non-Solicitation Agreement",
            "Employee Handbook Policy",
            "Termination Letter",
            "Intern Agreement"
        ],
        "Web / Product / Compliance": [
            "Terms of Service",
            "Privacy Policy",
            "Cookie Policy",
            "EULA (Software License)",
            "Acceptable Use Policy",
            "Data Processing Agreement (DPA)",
            "Refund Policy"
        ],
        "Real Estate": [
            "Lease Agreement (Residential)",
            "Lease Agreement (Commercial)",
            "Rental Addendum",
            "Property Management Agreement"
        ],
        "Finance / Payments": [
            "Loan Agreement",
            "Promissory Note",
            "Payment Terms Addendum"
        ]
    };

    const handleAnalyze = async () => {
        if (inputMode === "upload" && !file) return;
        if (inputMode === "paste" && !text.trim()) return;
        if (inputMode === "link" && !linkUrl.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setFetchingStage("idle");

        try {
            let textToAnalyze = text;
            let finalSourceName = "";

            if (inputMode === "link") {
                setFetchingStage("fetching");
                const extractResponse = await fetch("/api/extract-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: linkUrl, jurisdiction })
                });

                const extractData = await extractResponse.json();
                if (!extractResponse.ok) throw new Error(extractData.error || "Failed to extract content from URL");

                textToAnalyze = extractData.data.extractedText;
                finalSourceName = extractData.data.title || new URL(linkUrl).hostname;
                setFetchingStage("extracting");
            }

            setFetchingStage("analyzing");
            const formData = new FormData();
            formData.append("mode", inputMode === "link" ? "paste" : inputMode);
            formData.append("jurisdiction", jurisdiction);
            if (geoState) formData.append("state", geoState);

            if (inputMode === "upload" && file) {
                formData.append("file", file);
            } else if (inputMode === "paste" || inputMode === "link") {
                formData.append("text", textToAnalyze);
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
                headers: {
                    'x-usage': usage.toString(),
                    'x-is-logged-in': isLoggedIn.toString(),
                    'x-plan': plan,
                    'x-user-id': user?.email || 'anonymous'
                }
            });

            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const rawText = await response.text();
                throw new Error(rawText.substring(0, 100) || "Server error occurred");
            }

            if (!response.ok || data.ok === false) {
                const errorMessage = data.error || "Analysis failed";
                const errorDetails = data.details ? `: ${data.details}` : "";
                throw new Error(`${errorMessage}${errorDetails}`);
            }

            const analysisData = data.data;
            if (inputMode === "link" && finalSourceName) {
                analysisData.sourceUrl = linkUrl;
                analysisData.sourceName = finalSourceName;
            }

            if (analysisData.wordCount) {
                trackUsage(analysisData.wordCount, isLoggedIn);
                setUsage(getUsage(isLoggedIn));
            }

            // Update analysis results condition to correctly handle EXTENSION_ONLY and isVerifiedHandshake
            if (EXTENSION_ONLY && !isVerifiedHandshake) {
                // If in extension-only mode and not verified, don't set full result
                setError("Analysis results are only available via the browser extension.");
                setFetchingStage("idle");
                return;
            }

            setResult(analysisData);
            setAnalysisId(data.analysisId);
            setIsVerifiedHandshake(true); // Manual analyze counts as verified
            setChatMessages([]);
            if (isLoggedIn) fetchHistory();
            setFetchingStage("completed");
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "Failed to analyze document");
            setFetchingStage("idle");
        } finally {
            setLoading(false);
        }
    };

    const loadHistoryRecord = async (record: any) => {
        setResult(record.analysisResult);
        setAnalysisId(record.id);
        setJurisdiction(record.jurisdiction);
        setInputMode(record.inputType);
        setTab("analyze");
        setError(null);
        fetchChatMessages(record.id);
    };

    const sendChatMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('question') as HTMLInputElement;
        const question = input.value;
        if (!question.trim() || !analysisId) return;

        setChatLoading(true);
        const loggedInUser = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
        const userId = loggedInUser?.email || 'anonymous';
        const isLoggedInVal = !!loggedInUser;

        try {
            // Optimistic update
            const tempUserMsg = { id: Date.now().toString(), role: 'user', content: question, createdAt: new Date().toISOString() };
            setChatMessages(prev => [...prev, tempUserMsg]);
            input.value = '';

            const response = await fetch(`/api/analysis/${analysisId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-is-logged-in': isLoggedInVal.toString(),
                    'x-user-id': userId
                },
                body: JSON.stringify({ question })
            });
            const data = await response.json();
            if (data.ok) {
                setChatMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, data.data]);

                // Auto-scroll logic happens via useEffect on chatMessages
            } else {
                setError(data.error || "Failed to get AI response");
            }
        } catch (err) {
            console.error("Chat error:", err);
            setError("The check service is currently unavailable.");
        } finally {
            setChatLoading(false);
        }
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        const chatContainer = document.getElementById('chat-messages-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatMessages, chatLoading]);

    const handleGenerate = async () => {
        setGenLoading(true);
        setGenResult("");
        setError(null);
        try {
            const response = await fetch("/api/generate-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: genType,
                    jurisdiction: genJurisdiction,
                    state: genState,
                    keyDetails: keyDetails,
                    customParams: customParams
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Generation failed");

            // Directly update the keyDetails editor with the generated content
            setKeyDetails(data.content);
            setGenResult(data.content);
            setKeyDetailsWordCount(countWordsFromHtml(data.content));

            // On mobile, automatically switch to preview view once generated
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setMobileGenView('preview');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenLoading(false);
        }
    };

    const handleClearAll = () => {
        setGenResult("");
        setKeyDetails("");
        setKeyDetailsWordCount(0);
        setGenType("");
        setGenJurisdiction("");
        setGenState("");
        setCustomParams({});
        setLogoFile(null);
        setSignatureFile(null);
        setError(null);
        setWizardStep(1);
    };

    const handleDownloadDocx = async () => {
        if (!genResult) return;

        try {
            // Include logos and signature right into the HTML that is sent to our backend converter
            let logoHtml = '';
            let signatureHtml = '';

            if (logoFile) {
                const logoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoFile);
                });

                if (useWatermark) {
                    logoHtml = `<div style="text-align:center; margin-bottom: 30px;"><img src="${logoBase64}" style="width: 120px; max-height: 80px; object-fit: contain; opacity:0.3;" alt="logo watermark" /></div>`;
                } else {
                    logoHtml = `<div style="text-align:center; margin-bottom: 30px;"><img src="${logoBase64}" style="width: 100px; max-height: 60px; object-fit: contain;" alt="logo" /></div>`;
                }
            }

            if (signatureFile) {
                const sigBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(signatureFile);
                });

                let signedBy = "Signatory";
                if (customParams["employeeName"] || customParams["partyA"]) {
                    signedBy = customParams["employeeName"] || customParams["partyA"] || "Signatory";
                }

                signatureHtml = `
                    <br/><br/>
                    <p style="font-weight: bold; margin-bottom: 20px;">IN WITNESS WHEREOF:</p>
                    <img src="${sigBase64}" width="150" alt="Signature" style="margin-bottom: 5px;" />
                    <p style="margin: 0;">____________________________</p>
                    <p style="margin-top: 5px;">${signedBy}</p>
                `;
            }

            // Also capture the current edited state of the document (ReactQuill outputs clean HTML)
            const fullHtml = `
                ${logoHtml}
                ${genResult}
                ${signatureHtml}
            `;

            const res = await fetch('/api/download-docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: fullHtml, title: genType })
            });

            if (!res.ok) throw new Error("Failed to export Word file. Server error.");

            const blob = await res.blob();
            saveAs(blob, `${genType.replace(/\s+/g, '_')}_Draft.docx`);
        } catch (err) {
            console.error("DOCX Export Error:", err);
            setError("Failed to generate DOCX file.");
        }
    };

    const handleDownloadPdf = async () => {
        if (!keyDetails) return;
        try {
            const html2pdf = (await import('html2pdf.js')).default;

            let logoHtml = '';
            let signatureHtml = '';

            if (logoFile) {
                const logoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoFile);
                });
                logoHtml = `<div style="text-align:center; margin-bottom: 30px;"><img src="${logoBase64}" style="width: 100px; max-height: 60px; object-fit: contain;" alt="logo" /></div>`;
            }

            if (signatureFile) {
                const sigBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(signatureFile);
                });
                let signedBy = customParams["employeeName"] || customParams["partyA"] || "Signatory";
                signatureHtml = `
                    <div style="margin-top: 50px; page-break-inside: avoid;">
                        <p style="font-weight: bold; margin-bottom: 10px;">IN WITNESS WHEREOF:</p>
                        <img src="${sigBase64}" style="width: 120px; height: auto; margin-bottom: 5px;" alt="Signature" />
                        <p style="margin: 0;">____________________________</p>
                        <p style="margin-top: 5px;">${signedBy}</p>
                    </div>
                `;
            }
            const contentHtml = `
                <div style="padding: 1in; font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.5; font-size: 11pt; text-align: justify; background: white;">
                    ${logoHtml}
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 16pt; margin: 0; font-weight: bold; text-transform: uppercase;">
                            ${genType || 'LEGAL AGREEMENT'}
                        </h1>
                    </div>

                    <div style="margin-bottom: 40px; min-height: 500px;">
                        ${keyDetails}
                    </div>

                    <div style="margin-top: 50px; page-break-inside: avoid;">
                        ${signatureHtml}
                    </div>

                    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; font-size: 8pt; color: #888; text-align: center;">
                        Draft Generated via TCLens Legal Hub - Official Copy
                    </div>
                </div>
            `;

            const element = document.createElement('div');
            element.style.width = '210mm';
            element.innerHTML = contentHtml;
            document.body.appendChild(element);

            const opt = {
                margin: [0, 0, 0, 0] as [number, number, number, number],
                filename: `${genType?.replace(/\s+/g, '_') || 'Legal_Document'}_Draft.pdf`,
                image: { type: 'jpeg' as const, quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false, letterRendering: true, windowWidth: 794 },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);
        } catch (err) {
            console.error("PDF Export Error:", err);
            setError("Failed to generate PDF. Make sure you are using a compatible browser.");
        }
    };

    const handleDownloadAnalysisPdf = async () => {
        if (!result) return;
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const analysisTitle = result.languageDetection?.primary || 'Legal';
            const riskLabel = result.risk_score > 75 ? "CRITICAL" : result.risk_score > 40 ? "MODERATE" : "MINIMAL";

            let redFlagsHtml = "";
            if (result.redFlags && result.redFlags.length > 0) {
                redFlagsHtml = `
                    <h2 style="color: #dc2626; font-size: 18px; margin-top: 30px; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">RED FLAGS IDENTIFIED</h2>
                    ${result.redFlags.map((f: any) => `
                        <div style="margin-bottom: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; page-break-inside: avoid;">
                            <h3 style="margin: 0 0 5px 0; font-size: 14px; color: #991b1b;">${f.title}</h3>
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #b91c1c;">${f.description}</p>
                            ${f.implication ? `<p style="margin: 0; font-size: 11px; color: #7f1d1d; font-style: italic;"><strong>Why this is a Red Flag:</strong> ${f.implication}</p>` : ''}
                        </div>
                    `).join('')}
                `;
            }

            let clausesHtml = "";
            if (result.clauses && result.clauses.length > 0) {
                clausesHtml = `
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">KEY CLAUSE ANALYSIS</h2>
                    ${result.clauses.map((c: any) => `
                        <div style="margin-bottom: 25px; border: 1px solid #e2e8f0; padding: 15px; page-break-inside: avoid;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center;">
                                <strong style="font-size: 14px; color: #1e293b;">${c.type}</strong>
                                <span style="font-size: 10px; padding: 2px 8px; border-radius: 4px; background: ${c.riskLevel === 'Critical' ? '#fee2e2' : '#f1f5f9'}; color: ${c.riskLevel === 'Critical' ? '#991b1b' : '#475569'}; font-weight: bold;">${c.riskLevel.toUpperCase()} RISK</span>
                            </div>
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #334155;">${c.summary}</p>
                            <p style="margin: 0; font-size: 11px; color: #64748b;">${c.explanation}</p>
                        </div>
                    `).join('')}
                `;
            }

            const reportHtml = `
                <div style="padding: 40px; font-family: 'Helvetica', sans-serif; color: #1e293b; line-height: 1.5;">
                    <div style="text-align: right; margin-bottom: 40px; border-bottom: 4px solid #059669; padding-bottom: 20px;">
                        <h1 style="margin: 0; color: #059669; font-size: 32px; font-weight: bold;">TCLens Analysis</h1>
                        <p style="margin: 5px 0; color: #64748b; font-size: 12px; font-weight: bold; letter-spacing: 1px;">OFFICIAL COMPLIANCE REPORT</p>
                        <p style="margin: 5px 0; color: #94a3b8; font-size: 10px;">Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>

                    <div style="background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; margin-bottom: 30px; border-radius: 8px;">
                        <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 48px; font-weight: 900; color: #0f172a;">${result.risk_score}</span>
                            <span style="font-size: 14px; color: #94a3b8; font-weight: bold;">/ 100 RISK COEFFICIENT</span>
                        </div>
                        <p style="margin: 0; font-size: 12px; font-weight: bold; color: ${result.risk_score > 75 ? '#dc2626' : result.risk_score > 40 ? '#f59e0b' : '#059669'}">${riskLabel} REVIEW ADVISED</p>
                    </div>

                    <h2 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px;">EXECUTIVE SUMMARY</h2>
                    <div style="font-size: 13px; color: #334155; line-height: 1.7; margin-bottom: 30px; white-space: pre-wrap;">
                        ${result.summary.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; margin-top: 10px; display: inline-block;">$1</strong>')}
                    </div>

                    ${redFlagsHtml}
                    ${clausesHtml}
                    
                    <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center;">
                        This document is an AI-generated analysis of legal terms. It does not constitute legal advice.
                        <br/>&copy; ${new Date().getFullYear()} TCLens Legal Technologies. All rights reserved.
                    </div>
                </div>
            `;

            const element = document.createElement('div');
            element.style.width = '210mm';
            element.innerHTML = reportHtml;
            document.body.appendChild(element);

            const opt = {
                margin: [5, 5, 5, 5] as [number, number, number, number],
                filename: `${analysisTitle}_Analysis_Report.pdf`,
                image: { type: 'jpeg' as const, quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false, letterRendering: true, windowWidth: 794 },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);
        } catch (err) {
            console.error("Analysis PDF Export Error:", err);
            setError("Failed to generate PDF analysis report.");
        }
    };

    const copyToClipboard = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground font-playfair mb-2">Legal Hub</h1>
                    <p className="text-muted-foreground">Analyze existing contracts or generate new ones in seconds.</p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Usage Progress */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-none border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-right-2">
                            <Zap className="w-4 h-4 fill-emerald-500" />
                            <span className="text-xs font-black uppercase tracking-wider">Unlimited Access</span>
                        </div>
                    ) : (
                        <div className="w-full md:w-64 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>Usage: {usage.toLocaleString()} / {currentLimit.toLocaleString()} Words</span>
                                <span>{Math.round(usagePercentage)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500 rounded-full",
                                        usagePercentage > 90 ? "bg-red-500" : usagePercentage > 70 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${usagePercentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex bg-muted/50 p-1 rounded-none w-full sm:w-fit overflow-x-auto no-scrollbar">
                        {isLoggedIn && (
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={cn(
                                    "px-4 py-2 rounded-none text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                                    showHistory ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Search className="w-3.5 h-3.5" />
                                History
                                {history.length > 0 && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{history.length}</span>}
                            </button>
                        )}
                        <div className="w-px h-4 bg-slate-200 self-center mx-1" />
                        <button
                            onClick={() => { setTab("analyze"); setShowHistory(false); }}
                            className={cn(
                                "px-6 py-2 rounded-none text-sm font-bold transition-all",
                                tab === "analyze" && !showHistory ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Analyze
                        </button>
                        <button
                            onClick={() => { setTab("generate"); setShowHistory(false); }}
                            className={cn(
                                "px-6 py-2 rounded-none text-sm font-bold transition-all",
                                tab === "generate" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Generate
                        </button>
                    </div>
                </div>
            </div>

            {tab === "analyze" ? (
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-background rounded-none border border-border p-6 shadow-sm overflow-hidden relative">
                            {/* Jurisdiction Selector */}
                            {/* Jurisdiction Selector */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Globe className="w-3 h-3" />
                                        Target Jurisdiction
                                    </label>
                                    <select
                                        value={jurisdiction}
                                        onChange={handleJurisdictionChange}
                                        className={cn(
                                            "w-full h-12 px-4 rounded-none border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                            !jurisdiction ? "border-border bg-muted/30 text-muted-foreground" : "border-border bg-muted/30 text-foreground focus:border-legal-navy"
                                        )}
                                    >
                                        <option value="">Select country</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="Nigeria">Nigeria</option>
                                        <option value="India">India</option>
                                        <option value="South Africa">South Africa</option>
                                        <option value="Other / Not sure">Other / Not sure</option>
                                    </select>
                                </div>

                                {/* State / Region Selector (Conditional) */}
                                {jurisdiction && jurisdiction !== "No jurisdiction" && JURISDICTION_DATA[jurisdiction] ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Globe className="w-3 h-3" />
                                            State / Region
                                        </label>
                                        <select
                                            value={geoState}
                                            onChange={handleGeoStateChange}
                                            className={cn(
                                                "w-full h-12 px-4 rounded-none border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                                !geoState ? "border-border bg-muted/30 text-muted-foreground" : "border-border bg-muted/30 text-foreground focus:border-legal-navy"
                                            )}
                                        >
                                            <option value="">All Regions</option>
                                            {JURISDICTION_DATA[jurisdiction].map((region) => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2 opacity-50 pointer-events-none">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Globe className="w-3 h-3" />
                                            State / Region
                                        </label>
                                        <div className="w-full h-12 px-4 rounded-none border border-border bg-muted/10 font-bold text-sm flex items-center text-muted-foreground italic">
                                            Select country first
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Jurisdiction helps tailor clause interpretation to local laws.
                            </p>

                            <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-none">
                                <button
                                    onClick={() => setInputMode("upload")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-none transition-all font-bold text-xs flex items-center justify-center gap-2",
                                        inputMode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
                                    )}
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    File
                                </button>
                                <button
                                    onClick={() => setInputMode("paste")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-none transition-all font-bold text-xs flex items-center justify-center gap-2",
                                        inputMode === "paste" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
                                    )}
                                >
                                    <TypeIcon className="w-3.5 h-3.5" />
                                    Text
                                </button>
                                <button
                                    onClick={() => setInputMode("link")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-none transition-all font-bold text-xs flex items-center justify-center gap-2",
                                        inputMode === "link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
                                    )}
                                >
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    Link
                                </button>
                            </div>

                            <div>
                                {inputMode === "upload" ? (
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-[1.5rem] p-12 text-center transition-all cursor-pointer group",
                                            file ? "border-emerald-200 bg-emerald-50/30" : "border-border hover:border-legal-navy hover:bg-muted/30"
                                        )}
                                    >
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.txt,.docx,.jpg,.jpeg,.png"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer space-y-4">
                                            <div className="w-16 h-16 bg-muted/50 rounded-none flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                                {file ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{file ? file.name : "Choose a file"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX, or Images (max 10MB)</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : inputMode === "paste" ? (
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Paste the legal text here..."
                                        className="w-full h-[300px] p-4 rounded-[1.5rem] border border-border focus:ring-2 focus:ring-legal-navy focus:border-transparent resize-none text-sm outline-none bg-muted/30/50"
                                    />
                                ) : (
                                    <div className="space-y-4 py-8">
                                        <div className="bg-muted/30 rounded-none p-6 border border-border space-y-4">
                                            <div className="w-12 h-12 bg-background rounded-none shadow-sm flex items-center justify-center">
                                                <LinkIcon className="w-6 h-6 text-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Web Agreement URL</label>
                                                <input
                                                    type="url"
                                                    value={linkUrl}
                                                    onChange={(e) => setLinkUrl(e.target.value)}
                                                    placeholder="https://example.com/terms"
                                                    className="w-full h-12 px-4 rounded-none border border-border focus:ring-2 focus:ring-legal-navy outline-none text-sm bg-background"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Examples:</p>
                                                <p className="text-[10px] text-muted-foreground">https://site.com/privacy • https://app.com/rules</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!jurisdiction && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-none flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <p className="text-[11px] font-bold text-amber-800">Please select a jurisdiction to continue.</p>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-none flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-red-800">
                                                {error.includes("Access denied") || error.includes("403") ? "Website Blocked Access" :
                                                    error.includes("too little context") || error.includes("Extraction failed") ? "Content Extraction Failed" :
                                                        error.includes("Formatting Error") ? "AI Processing Interrupted" : "Analysis Error"}
                                            </p>
                                            <p className="text-xs text-red-600 mt-1">{error}</p>
                                        </div>
                                    </div>
                                    {inputMode === "link" && (
                                        <div className="pt-2 border-t border-red-100 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-8 font-bold border-red-200 text-red-700 hover:bg-red-100"
                                                onClick={() => {
                                                    setInputMode("paste");
                                                    setError(null);
                                                }}
                                            >
                                                Paste Text Instead
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-8 font-bold border-red-200 text-red-700 hover:bg-red-100"
                                                onClick={() => {
                                                    setInputMode("upload");
                                                    setError(null);
                                                }}
                                            >
                                                Upload PDF Instead
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex justify-between items-center px-2">
                                <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isOverLimit ? "bg-red-500 animate-pulse" : currentWordCount > 0 ? "bg-emerald-500" : "bg-slate-300"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        isOverLimit ? "text-red-500" : "text-muted-foreground"
                                    )}>
                                        Word count: {currentWordCount.toLocaleString()}
                                    </span>
                                </div>
                                {isOverLimit && (
                                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                                        Limit Exceeded
                                    </span>
                                )}
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={
                                    loading ||
                                    isOverLimit ||
                                    (inputMode === "upload" && !file) ||
                                    (inputMode === "paste" && !text.trim()) ||
                                    (inputMode === "link" && !linkUrl.trim())
                                }
                                className="w-full h-14 rounded-none bg-emerald-600 hover:bg-slate-800 text-lg font-bold mt-6 shadow-xl shadow-legal-navy/10 transition-all border-none disabled:bg-muted/50 disabled:text-muted-foreground"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                        <div className="flex flex-col items-start leading-tight">
                                            <span className="text-[10px] opacity-70 uppercase tracking-widest font-black">
                                                {fetchingStage === "fetching" ? "Step 1/3" :
                                                    fetchingStage === "extracting" ? "Step 2/3" : "Step 3/3"}
                                            </span>
                                            <span className="text-sm">
                                                {fetchingStage === "fetching" ? "Fetching document..." :
                                                    fetchingStage === "extracting" ? "Extracting terms..." :
                                                        fetchingStage === "analyzing" ? "AI Analysis..." : "Processing..."}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {isOverLimit ? 'Limit Exceeded' : `Analyze ${inputMode === 'link' ? 'Agreement' : 'Document'}`}
                                        {isOverLimit ? <AlertTriangle className="ml-2 w-5 h-5" /> : <Zap className="ml-2 w-5 h-5 fill-emerald-400 text-emerald-400" />}
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>

                    {/* Right: Results Display */}
                    <div className="lg:col-span-7">
                        {(result && (!EXTENSION_ONLY || isVerifiedHandshake)) ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
                                {/* Score & Summary Card */}
                                <div className="bg-background rounded-none border border-border p-8 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                        <div className="relative shrink-0 flex flex-col items-center py-2">
                                            <div className="flex items-baseline gap-1">
                                                <span
                                                    className="text-6xl font-black font-playfair tracking-tighter"
                                                    style={{ color: result.risk_score > 75 ? '#ef4444' : result.risk_score > 40 ? '#f59e0b' : '#10b981' }}
                                                >
                                                    {result.risk_score}
                                                </span>
                                                <span className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest">/ 100</span>
                                            </div>

                                            <div className="mt-2 text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Risk Coefficient</div>

                                            <div className={cn(
                                                "mt-3 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] border",
                                                result.risk_score > 75 ? "bg-red-50/50 text-red-600 border-red-100" :
                                                    result.risk_score > 40 ? "bg-amber-50/50 text-amber-600 border-amber-100" :
                                                        "bg-emerald-50/50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {result.risk_score > 75 ? "Critical Review Required" :
                                                    result.risk_score > 40 ? "Standard Cautions" :
                                                        "Minimal Risk Profile"}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-foreground font-playfair">Analysis Summary</h3>
                                                {(result as any).sourceUrl && (
                                                    <a
                                                        href={(result as any).sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-100/50 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <LinkIcon className="w-3 h-3" />
                                                        {(result as any).sourceName || "Source"}
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-muted/50 rounded-md text-[10px] font-black text-muted-foreground uppercase tracking-tight">
                                                        {result.languageDetection?.primary || 'Legal'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                        Confidence: {result.analysis_confidence}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Download Buttons Area */}
                                            <div className="flex flex-wrap gap-2 mt-4 md:mt-1 pt-4 border-t md:border-t-0 md:pt-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleDownloadAnalysisPdf}
                                                    className="h-8 text-[10px] font-black uppercase tracking-wider rounded-none gap-2 border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download PDF
                                                </Button>
                                            </div>

                                            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed analysis-summary-content">
                                                <ReactMarkdown>
                                                    {result.summary}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Components (A2 Components) */}
                                    <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4">
                                        <div className="text-center space-y-1">
                                            <div className="text-xl font-black text-foreground">{result.components?.clause_risk || 0}</div>
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Clause Risk</div>
                                        </div>
                                        <div className="text-center border-x border-border space-y-1">
                                            <div className="text-xl font-black text-foreground">{result.components?.aggressiveness >= 0 ? `+${result.components.aggressiveness}` : result.components.aggressiveness}</div>
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Aggressiveness</div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <div className="text-xl font-black text-foreground">{result.components?.transparency >= 0 ? `+${result.components.transparency}` : result.components.transparency}</div>
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Transparency</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Risk Breakdown (A2 Breakdown) */}
                                {result.breakdown && result.breakdown.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-foreground px-2 flex items-center gap-2">
                                            <Search className="w-5 h-5 text-emerald-500" />
                                            Risk Factor Analysis
                                        </h3>
                                        <div className="bg-background rounded-none border border-border overflow-hidden">
                                            <div className="overflow-x-auto no-scrollbar">
                                                <table className="w-full text-left border-collapse min-w-[500px]">
                                                    <thead>
                                                        <tr className="bg-muted/30 border-b border-border">
                                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Impact Level</th>
                                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {result.breakdown.map((item: any, i: number) => (
                                                            <tr key={i} className="hover:bg-muted/30/50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="font-bold text-sm text-foreground">{item.category}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{item.label}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={cn(
                                                                                "text-[10px] font-black uppercase tracking-wider",
                                                                                item.points > 15 ? "text-red-600" : item.points > 10 ? "text-orange-600" : "text-emerald-600"
                                                                            )}>
                                                                                {item.points > 15 ? "Critical Impact" : item.points > 10 ? "Significant Impact" : "Moderate Impact"}
                                                                            </span>
                                                                            <span className="text-[10px] text-muted-foreground">(+{item.points})</span>
                                                                        </div>
                                                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                            <div
                                                                                className={cn(
                                                                                    "h-full transition-all duration-1000",
                                                                                    item.points > 15 ? "bg-red-500" : item.points > 10 ? "bg-orange-500" : "bg-emerald-500"
                                                                                )}
                                                                                style={{ width: `${Math.min(100, (item.points / 20) * 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <ul className="space-y-1">
                                                                        {item.evidence.map((snippet: string, j: number) => (
                                                                            <li key={j} className="text-[11px] text-muted-foreground italic line-clamp-1">"{snippet}"</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Red Flags */}
                                {result.redFlags && result.redFlags.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-red-600 px-2 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Red Flags
                                        </h3>
                                        <div className="grid gap-4">
                                            {(result.redFlags ?? []).map((flag: any, i: number) => (
                                                <div key={i} className="bg-red-50/50 border border-red-100 rounded-none p-5">
                                                    <h4 className="font-bold text-red-900 text-sm mb-1">{flag.title}</h4>
                                                    <p className="text-sm text-red-800/80 mb-3">{flag.description}</p>
                                                    {flag.implication && (
                                                        <div className="bg-white/50 border border-red-200 p-4 rounded-none">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Info className="w-3.5 h-3.5 text-red-600" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Why this is a Red Flag</span>
                                                            </div>
                                                            <p className="text-xs text-red-900/80 leading-relaxed italic">{flag.implication}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clauses List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-foreground px-2">Identified Clauses</h3>
                                    {(result.clauses ?? []).map((clause: any, i: number) => (
                                        <div key={i} className="bg-background rounded-none border border-border p-5 group hover:border-legal-navy/20 transition-all shadow-sm">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-2 w-full">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-foreground font-playfair">{clause.type}</span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight uppercase",
                                                            clause.riskLevel === "Critical" ? "bg-red-100 text-red-700" :
                                                                clause.riskLevel === "High" ? "bg-orange-100 text-orange-700" :
                                                                    clause.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                                        )}>
                                                            {clause.riskLevel}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{clause.summary}</p>
                                                    <p className="text-xs text-muted-foreground">{clause.explanation}</p>

                                                    {clause.originalExcerpt && (
                                                        <div className={cn(
                                                            "mt-4 grid gap-4",
                                                            (clause.translatedExcerpt && clause.translatedExcerpt !== clause.originalExcerpt) ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                                                        )}>
                                                            <div className="p-3 bg-muted/30 rounded-none border border-border">
                                                                <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Original Excerpt</span>
                                                                <p className="text-xs text-muted-foreground italic line-clamp-3">"{clause.originalExcerpt}"</p>
                                                            </div>
                                                            {clause.translatedExcerpt && clause.translatedExcerpt !== clause.originalExcerpt && (
                                                                <div className="p-3 bg-emerald-50/30 rounded-none border border-emerald-100/50">
                                                                    <span className="text-[10px] font-black uppercase text-emerald-500 block mb-1">English Translation</span>
                                                                    <p className="text-xs text-muted-foreground italic line-clamp-3">"{clause.translatedExcerpt}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {result.nextSteps && result.nextSteps.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg font-bold text-foreground font-playfair flex items-center gap-2">
                                                <BrainCircuit className="w-5 h-5 text-emerald-500" />
                                                Neural Guidance
                                            </h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-2 py-1 border border-border">AI-Engineered Actions</span>
                                        </div>

                                        <div className="bg-background border border-border p-0 divide-y divide-border relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20 pointer-events-none" />

                                            {(result.nextSteps ?? []).map((step: any, i: number) => (
                                                <div key={i} className="flex gap-4 items-center p-6 bg-background group hover:bg-muted/10 transition-colors">
                                                    <div className="w-8 h-8 rounded-none border border-emerald-100 bg-emerald-50/50 flex items-center justify-center shrink-0">
                                                        <Check className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground/80 flex-1">{step}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.querySelector('input[name="question"]') as HTMLInputElement;
                                                            if (input) {
                                                                input.value = `Can you help me with: ${step}?`;
                                                                input.focus();
                                                            }
                                                        }}
                                                        className="rounded-none text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 group"
                                                    >
                                                        Initialize AI
                                                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div>
                                                    <h4 className="font-bold text-lg font-playfair mb-1">Deep Dive Clarification</h4>
                                                    <p className="text-xs text-slate-400">Our Neural Assistant can execute these steps for you immediately.</p>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        const chatSection = document.getElementById('ai-follow-up');
                                                        chatSection?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold gap-2 px-8"
                                                >
                                                    Speak to Assistant
                                                    <MessageCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up Q&A Section */}
                                <div id="ai-follow-up" className="mt-8 pt-8 border-t border-border space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-foreground font-playfair flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                                Ask AI a follow-up question
                                            </h3>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Answers are general legal information, not legal advice.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 rounded-none border border-border overflow-hidden">
                                        <div id="chat-messages-container" className="p-6 max-h-[400px] overflow-y-auto space-y-4 custom-scrollbar scroll-smooth">
                                            {chatMessages.length === 0 ? (
                                                <div className="text-center py-10 space-y-3">
                                                    <div className="w-12 h-12 bg-background rounded-none flex items-center justify-center mx-auto shadow-sm">
                                                        <TypeIcon className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium">Ask anything about this document...</p>
                                                </div>
                                            ) : (
                                                chatMessages.map((msg, i) => (
                                                    <div key={i} className={cn(
                                                        "flex gap-3 max-w-[85%]",
                                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                                    )}>
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                            msg.role === 'user' ? "bg-emerald-600 text-white" : "bg-emerald-500 text-foreground"
                                                        )}>
                                                            {msg.role === 'user' ? <TypeIcon className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                        </div>
                                                        <div className={cn(
                                                            "p-4 rounded-none text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                                                            msg.role === 'user' ? "bg-emerald-600 text-white rounded-tr-none" : "bg-background text-muted-foreground border border-border rounded-tl-none"
                                                        )}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            {chatLoading && (
                                                <div className="flex gap-3 mr-auto items-center animate-pulse">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                                    </div>
                                                    <div className="p-4 bg-background rounded-none border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                                        AI is thinking...
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={sendChatMessage} className="p-4 bg-background border-t border-border flex gap-2">
                                            <input
                                                name="question"
                                                type="text"
                                                autoComplete="off"
                                                placeholder="e.g. Can I terminate this with 30 days notice?"
                                                className="flex-1 h-12 px-6 rounded-none border border-border focus:ring-2 focus:ring-legal-navy outline-none text-sm bg-muted/30/50"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={chatLoading}
                                                className="h-12 w-12 rounded-none bg-emerald-600 hover:bg-slate-800 p-0 shadow-lg shadow-legal-navy/10"
                                            >
                                                <ArrowRight className="w-5 h-5 text-emerald-400" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : showHistory ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 lg:col-span-12">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-black text-foreground font-playfair uppercase tracking-wider">Analysis History</h3>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{history.length} Records found</span>
                                </div>

                                {history.length === 0 ? (
                                    <div className="bg-background rounded-[2.5rem] p-20 text-center border border-dashed border-border space-y-4">
                                        <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center mx-auto">
                                            <FileText className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No saved analyses found yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {history.map((record) => (
                                            <div
                                                key={record.id}
                                                onClick={() => loadHistoryRecord(record)}
                                                className="group bg-background rounded-3xl border border-border p-5 hover:border-legal-navy hover:shadow-xl hover:shadow-legal-navy/5 transition-all cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-muted/30 rounded-none flex items-center justify-center group-hover:bg-emerald-600/5 transition-colors">
                                                        {record.inputType === 'link' ? <LinkIcon className="w-6 h-6 text-foreground" /> : record.inputType === 'upload' ? <Upload className="w-6 h-6 text-foreground" /> : <TypeIcon className="w-6 h-6 text-foreground" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-foreground group-hover:text-foreground transition-colors">{record.sourceName}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {record.jurisdiction}</span>
                                                            <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> {record.wordCount.toLocaleString()} Words</span>
                                                            <span className="text-slate-300">|</span>
                                                            <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-foreground transition-all group-hover:translate-x-1" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-background rounded-none border border-dashed border-border">
                                <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground font-playfair">Ready for Intelligence</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm">
                                    {EXTENSION_ONLY
                                        ? "This analysis interface is restricted to the TCLens browser extension. Please trigger an analysis from the extension to see results."
                                        : "Upload a document or paste terms to see a deep dive analysis into the legal risks."}
                                </p>
                                {EXTENSION_ONLY && (
                                    <Button
                                        variant="outline"
                                        className="mt-6 rounded-none font-bold"
                                        onClick={() => window.open('/#install-extension', '_blank')}
                                    >
                                        Get Extension
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full h-auto lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 lg:pb-0">

                    {/* MOBILE TOGGLE BAR - ONLY ON SMALL SCREENS */}
                    <div className="flex lg:hidden bg-muted/30 border border-border rounded-none p-1 shrink-0">
                        <button
                            onClick={() => setMobileGenView('builder')}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                mobileGenView === 'builder' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            1. Builder
                        </button>
                        <button
                            onClick={() => setMobileGenView('preview')}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                mobileGenView === 'preview' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            2. Preview {genResult && "✨"}
                        </button>
                    </div>

                    {/* LEFT PANEL: Dynamic Multi-Step Wizard */}
                    <div className={cn(
                        "w-full lg:w-[45%] flex flex-col bg-background rounded-none border border-border shadow-sm overflow-hidden flex-shrink-0",
                        mobileGenView === 'builder' ? "flex" : "hidden lg:flex"
                    )}>
                        {/* Wizard Header / Progress Tracker */}
                        <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-muted/30/50">
                            <div>
                                <h2 className="text-xl font-black text-foreground font-playfair uppercase">Document Builder</h2>
                                <p className="text-xs text-muted-foreground font-medium">Follow the steps to configure your legal draft</p>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(step => (
                                    <div key={step} onClick={() => (step < wizardStep || (wizardStep === 1 && genType && genJurisdiction)) && setWizardStep(step)} className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                        wizardStep === step ? "bg-emerald-600 text-white ring-4 ring-legal-navy/10" :
                                            wizardStep > step ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600" : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {wizardStep > step ? <Check className="w-4 h-4" /> : step}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wizard Body Container */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">

                            {/* STEP 1: Basic Information */}
                            {wizardStep === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <div className="bg-blue-50/50 p-4 rounded-none border border-blue-100/50 text-xs text-blue-800 flex items-start gap-3">
                                        <Zap className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                                        <span>Select the <strong>Document Type</strong> and its governing <strong>Jurisdiction</strong>. This will automatically load the required fields for the next step.</span>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center justify-between">
                                            <span>Document Type <span className="text-red-500">*</span></span>
                                            {genType && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                        </label>
                                        <select
                                            value={genType}
                                            onChange={(e) => setGenType(e.target.value)}
                                            className={cn(
                                                "w-full h-14 px-4 rounded-none border appearance-none outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-legal-navy/10 cursor-pointer",
                                                !genType ? "border-border bg-muted/30 text-muted-foreground" : "border-legal-navy/30 bg-background text-foreground shadow-sm"
                                            )}
                                        >
                                            <option value="" disabled>Select document type...</option>
                                            {Object.entries(documentOptions).map(([category, documents]) => (
                                                <optgroup key={category} label={category}>
                                                    {documents.map((doc) => (
                                                        <option key={doc} value={doc}>{doc}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center justify-between">
                                            <span>Jurisdiction <span className="text-red-500">*</span></span>
                                            {genJurisdiction && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                        </label>
                                        <select
                                            value={genJurisdiction}
                                            onChange={(e) => {
                                                setGenJurisdiction(e.target.value);
                                                setGenState("");
                                            }}
                                            className={cn(
                                                "w-full h-14 px-4 rounded-none border appearance-none outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-legal-navy/10 cursor-pointer",
                                                !genJurisdiction ? "border-border bg-muted/30 text-muted-foreground" : "border-legal-navy/30 bg-background text-foreground shadow-sm"
                                            )}
                                        >
                                            <option value="" disabled>Select jurisdiction...</option>
                                            <option value="No jurisdiction">No jurisdiction (General/Global)</option>
                                            <option value="United States (Federal)">United States (Federal)</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="European Union">European Union</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="India">India</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Other / Not sure">Other / Not sure</option>
                                        </select>
                                    </div>

                                    {genJurisdiction && genJurisdiction !== "No jurisdiction" && JURISDICTION_DATA[genJurisdiction] && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-black text-foreground uppercase tracking-wider">State / Region (Optional)</label>
                                            <select
                                                value={genState}
                                                onChange={(e) => setGenState(e.target.value)}
                                                className={cn(
                                                    "w-full h-14 px-4 rounded-none border appearance-none outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-legal-navy/10 cursor-pointer",
                                                    !genState ? "border-border bg-muted/30 text-muted-foreground" : "border-legal-navy/30 bg-background text-foreground shadow-sm"
                                                )}
                                            >
                                                <option value="">None / Not specified</option>
                                                {JURISDICTION_DATA[genJurisdiction].map((region) => (
                                                    <option key={region} value={region}>{region}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => setWizardStep(2)}
                                        disabled={!genType || !genJurisdiction}
                                        className="w-full h-14 mt-4 rounded-none bg-emerald-600 hover:bg-slate-800 text-lg font-bold disabled:opacity-50 transition-all font-playfair uppercase tracking-widest shadow-xl shadow-legal-navy/10"
                                    >
                                        Next Step <ChevronRight className="ml-1 w-5 h-5" />
                                    </Button>
                                    {(!genType || !genJurisdiction) && (
                                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest mt-2">Required fields missing</p>
                                    )}

                                    {hasSavedDraft && (
                                        <div className="mt-6 pt-4 border-t border-border flex flex-col items-center">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">Load your previous progress</p>
                                            <Button variant="outline" className="w-full bg-muted/30 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50" onClick={handleResumeDraft}>
                                                <Save className="w-4 h-4 mr-2" /> Resume Saved Draft ({savedDraftTime})
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: Parameters & Configuration */}
                            {wizardStep === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                                            Parameters for {genType}
                                            <button onClick={handleSaveDraft} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors flex items-center gap-1 text-muted-foreground" title="Save Progress">
                                                <Save className="w-3 h-3" /> Save Draft
                                            </button>
                                        </h3>
                                        <button onClick={() => setWizardStep(1)} className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase">Edit Base Info</button>
                                    </div>

                                    <div className="space-y-5">
                                        {(DOCUMENT_PARAMS_MAP[genType] || DEFAULT_PARAMS).map(field => {
                                            const isCurrency = field.label.toLowerCase().includes('salary') || field.label.toLowerCase().includes('amount') || field.label.toLowerCase().includes('fee') || field.label.toLowerCase().includes('cost') || field.label.toLowerCase().includes('rent');
                                            const isPercentage = field.label.toLowerCase().includes('percentage') || field.label.toLowerCase().includes('ratio') || field.label.toLowerCase().includes('share') || field.label.toLowerCase().includes('equity');
                                            const isDate = field.type === 'date';
                                            const needsAITip = isCurrency || isPercentage || field.label.toLowerCase().includes('clause') || field.label.toLowerCase().includes('liability') || field.label.toLowerCase().includes('confidentiality');

                                            // Select appropriate AI tip based on field type
                                            let aiTip = "AI Analysis: Fill this detail accurately as it forms a critical component of the legal binding.";
                                            if (isCurrency) aiTip = "AI Suggestion: Consider standard market rates for your jurisdiction to avoid disputes. Currency is based on your locale.";
                                            if (isPercentage) aiTip = "AI Suggestion: Ensure cumulative percentages across all stakeholders do not exceed 100%.";
                                            if (field.label.toLowerCase().includes('liability')) aiTip = "AI Suggestion: Liability caps are standard protection in commercial contracts. Typical ranges from 1x-3x fees.";
                                            if (field.label.toLowerCase().includes('confidentiality')) aiTip = "AI Suggestion: Standard confidentiality terms survive 2-5 years post-termination, though trade secrets are indefinite.";

                                            return (
                                                <div key={field.id} className="space-y-2 group">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5">
                                                            {field.label}
                                                            {needsAITip && (
                                                                <div className="relative group/tip flex items-center">
                                                                    <Sparkles className="w-3.5 h-3.5 text-foreground/40 cursor-help hover:text-emerald-500 transition-colors" />
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-emerald-600 text-[11px] font-normal leading-relaxed text-slate-200 rounded-none shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-20 normal-case tracking-normal">
                                                                        {aiTip}
                                                                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-2.5 bg-emerald-600 rotate-45 rounded-sm"></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </span>
                                                        {customParams[field.id] && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                                    </label>
                                                    <div className="relative flex items-center focus-within:ring-4 focus-within:ring-legal-navy/10 rounded-none transition-all">
                                                        {isCurrency && <div className="absolute left-4 text-muted-foreground font-bold">$</div>}
                                                        <input
                                                            type={field.type}
                                                            className={cn(
                                                                "w-full h-12 rounded-none border appearance-none outline-none font-medium text-sm transition-all focus:border-legal-navy shadow-sm bg-muted/30 group-hover:bg-background text-slate-800",
                                                                isCurrency ? "pl-8 pr-4" : isPercentage ? "pl-4 pr-8" : "px-4",
                                                                customParams[field.id] ? "border-legal-navy/30 bg-background" : "border-border",
                                                                isDate ? "text-muted-foreground [&::-webkit-calendar-picker-indicator]:opacity-50" : ""
                                                            )}
                                                            placeholder={field.placeholder || ""}
                                                            value={customParams[field.id] || ""}
                                                            onChange={e => setCustomParams(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                        />
                                                        {isPercentage && <div className="absolute right-4 text-muted-foreground font-bold">%</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Branding & Signature section */}
                                    <div className="mt-8 pt-8 border-t border-border space-y-5">
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Closing Details (Optional)</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Company Logo</label>
                                                {logoFile ? (
                                                    <div className="flex items-center justify-between p-3 bg-background border border-legal-navy/30 shadow-sm rounded-none text-xs">
                                                        <span className="truncate text-foreground font-medium px-1">{logoFile.name}</span>
                                                        <button onClick={() => setLogoFile(null)} className="text-red-500 font-bold bg-red-50 w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-100">✕</button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer h-12 border-2 border-dashed border-border hover:border-legal-navy/50 hover:bg-muted/30 flex items-center justify-center gap-2 text-foreground text-xs font-bold rounded-none transition-colors w-full">
                                                        <Upload className="w-4 h-4" /> Add Logo
                                                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && e.target.files[0] && setLogoFile(e.target.files[0])} />
                                                    </label>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Signature</label>
                                                {signatureFile ? (
                                                    <div className="flex items-center justify-between p-3 bg-background border border-legal-navy/30 shadow-sm rounded-none text-xs">
                                                        <span className="truncate text-foreground font-medium px-1">{signatureFile.name}</span>
                                                        <button onClick={() => setSignatureFile(null)} className="text-red-500 font-bold bg-red-50 w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-100">✕</button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer h-12 border-2 border-dashed border-border hover:border-legal-navy/50 hover:bg-muted/30 flex items-center justify-center gap-2 text-foreground text-xs font-bold rounded-none transition-colors w-full">
                                                        <Upload className="w-4 h-4" /> Add Signature
                                                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && e.target.files[0] && setSignatureFile(e.target.files[0])} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" onClick={() => setWizardStep(1)} className="h-14 w-14 rounded-none border-border p-0 text-muted-foreground">
                                            <ChevronRight className="rotate-180 w-5 h-5" />
                                        </Button>
                                        <Button
                                            onClick={() => setWizardStep(3)}
                                            className="flex-1 h-14 rounded-none bg-emerald-600 hover:bg-slate-800 text-lg font-bold transition-all font-playfair uppercase tracking-widest shadow-xl shadow-legal-navy/10"
                                        >
                                            Review & Generate
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Generate / Action */}
                            {wizardStep === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">

                                    <div className="p-5 bg-emerald-600 text-white rounded-none shadow-xl flex items-start gap-4 animate-in fade-in zoom-in duration-500 relative">
                                        <button onClick={handleSaveDraft} className="absolute top-4 right-4 text-[10px] bg-background/10 px-2 py-1 rounded-none hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors flex items-center gap-1 font-bold uppercase tracking-wider" title="Save Progress">
                                            <Save className="w-3 h-3" /> Save
                                        </button>
                                        <div className="w-12 h-12 rounded-none bg-background/10 flex items-center justify-center shrink-0">
                                            <Zap className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-playfair font-black text-lg tracking-wide uppercase pr-16">AI Legal Generation</h3>
                                            <p className="text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                                                Review your fields. Click <strong className="text-white bg-background/10 px-1 py-0.5 rounded">Generate</strong> to draft the full document instantly. You'll be able to edit the result in the live preview.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center justify-between">
                                            <span>Additional Instructions (Optional)</span>
                                        </label>
                                        <textarea
                                            value={keyDetails}
                                            onChange={(e) => setKeyDetails(e.target.value)}
                                            placeholder="e.g., Make sure it strongly favors the employer, include a strict arbitration clause..."
                                            className="w-full h-32 p-4 rounded-none border border-border focus:border-legal-navy focus:ring-4 focus:ring-legal-navy/10 outline-none text-sm transition-all resize-none shadow-sm bg-muted/30"
                                        />
                                    </div>

                                    <div className="flex gap-4 mt-auto pt-4">
                                        <Button variant="outline" onClick={() => setWizardStep(2)} className="h-14 w-14 rounded-none border-border p-0 text-muted-foreground">
                                            <ChevronRight className="rotate-180 w-5 h-5" />
                                        </Button>
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={genLoading}
                                            className="flex-1 h-14 rounded-none bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold shadow-xl shadow-emerald-500/20 transition-all border-none"
                                        >
                                            {genLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span className="font-playfair tracking-wider uppercase">AI Drafting...</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <span className="font-playfair tracking-wider uppercase">{genResult ? "Regenerate Draft" : "Generate Document"}</span>
                                                    <CheckCircle className="w-5 h-5 opacity-50" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    {genResult && (
                                        <div className="pt-2 text-center">
                                            <button onClick={handleClearAll} className="text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest border-b border-transparent hover:border-red-500">
                                                Start Over (Clear All)
                                            </button>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Live Editor / Preview */}
                    <div className="w-full lg:w-[55%] flex flex-col bg-muted/30 rounded-none border border-border shadow-inner overflow-hidden">

                        <div className="p-4 bg-background border-b border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-foreground" />
                                <span className="font-black text-foreground uppercase tracking-wider text-sm">Live Context & Edit Preview</span>
                            </div>

                            <div className="flex gap-2">
                                {genResult && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(keyDetails)} className="h-8 px-3 rounded-none font-bold text-xs bg-muted/30 hover:bg-muted/50 border-border">
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : "Copy"}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="h-8 px-3 rounded-none font-bold text-xs bg-muted/30 hover:bg-muted/50 border-border">
                                            <Download className="w-3.5 h-3.5 mr-1.5 opacity-50" /> PDF
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleDownloadDocx} className="h-8 px-3 rounded-none font-bold text-xs bg-muted/30 hover:bg-muted/50 border-border">
                                            <Download className="w-3.5 h-3.5 mr-1.5 opacity-50" /> Word
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {genLoading && (
                                <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                        <div className="w-20 h-20 bg-background border border-border shadow-2xl rounded-none flex items-center justify-center relative z-10">
                                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                        </div>
                                    </div>
                                    <p className="mt-6 text-sm font-black uppercase tracking-widest gap-text-foreground text-muted-foreground">AI is constructing draft...</p>
                                    <div className="w-48 h-1.5 bg-muted/50 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full animate-progress-indeterminate"></div>
                                    </div>
                                </div>
                            )}

                            {!genResult && !genLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                                    <div className="w-24 h-24 bg-background shadow-sm rounded-3xl flex items-center justify-center mb-6">
                                        <FileText className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-muted-foreground font-playfair uppercase">Preview Pending</h3>
                                    <p className="text-sm mt-2 max-w-xs">Complete the wizard on the left and generate a draft to see the interactive legal document here.</p>
                                </div>
                            ) : (
                                <div id="document-preview-content" className="h-full bg-background flex flex-col">
                                    {mounted ? (
                                        <ReactQuill
                                            value={genResult}
                                            onChange={(content: string) => {
                                                setGenResult(content);
                                                setKeyDetails(content); // keep in sync
                                                setKeyDetailsWordCount(countWordsFromHtml(content));
                                            }}
                                            placeholder="Generated content will appear here..."
                                            theme="snow"
                                            modules={{
                                                toolbar: [
                                                    [{ 'font': ['', 'serif', 'monospace', 'roboto', 'montserrat', 'playfair', 'lora', 'arial'] }],
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    [{ 'header': [1, 2, false] }],
                                                    [{ 'color': [] }, { 'background': [] }],
                                                    ['link'],
                                                    ['clean']
                                                ]
                                            }}
                                            className="flex-1 overflow-y-auto custom-scrollbar quill-custom-height"
                                        />
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-sm text-muted-foreground font-medium">Loading editor...</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <style jsx global>{`
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&display=swap');

                            /* Quill Editor Fixes for Flexbox layout */
                            .quill-custom-height { display: flex; flex-direction: column; height: 100%; }
                            .quill-custom-height .ql-container { flex: 1; overflow-y: auto; font-family: 'Times New Roman', Times, serif !important; font-size: 16px; min-height: 0; }
                            
                            .ql-editor { 
                                font-size: 16px !important; 
                                line-height: 1.6 !important;
                                padding: 35px 50px !important;
                            }

                            /* Custom Font Styles */
                            .ql-font-serif { font-family: 'Times New Roman', Times, serif !important; }
                            .ql-font-monospace { font-family: 'Courier New', Courier, monospace !important; }
                            .ql-font-roboto { font-family: 'Roboto', sans-serif !important; }
                            .ql-font-montserrat { font-family: 'Montserrat', sans-serif !important; }
                            .ql-font-playfair { font-family: 'Playfair Display', serif !important; }
                            .ql-font-lora { font-family: 'Lora', serif !important; }
                            .ql-font-arial { font-family: Arial, Helvetica, sans-serif !important; }

                            .ql-container.ql-snow { border: none !important; }
                            .ql-toolbar.ql-snow { 
                                border: none !important; 
                                border-bottom: 1px solid var(--color-slate-100) !important; 
                                padding: 12px 20px !important; 
                                background: var(--color-white) !important;
                                position: sticky;
                                top: 0;
                                z-index: 10;
                            }

                            /* Toolbar Picker Labels */
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before { content: "Times New Roman"; font-family: serif; }
                            
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before { content: "Monospace"; font-family: monospace; }
                            
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before { content: "Roboto"; font-family: 'Roboto'; }

                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="montserrat"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="montserrat"]::before { content: "Montserrat"; font-family: 'Montserrat'; }

                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="playfair"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="playfair"]::before { content: "Playfair Display"; font-family: 'Playfair Display'; }

                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="lora"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="lora"]::before { content: "Lora"; font-family: 'Lora'; }

                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before { content: "Arial"; font-family: Arial, sans-serif; }

                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-label::before,
                            .ql-toolbar.ql-snow .ql-picker.ql-font .ql-picker-item::before { content: "Inter (Default)"; font-family: 'Inter'; }

                            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-slate-200); border-radius: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-slate-300); }

                            @keyframes progress-in {
                                0% { width: 0%; transform: translateX(-100%); }
                                50% { width: 50%; transform: translateX(0); }
                                100% { width: 100%; transform: translateX(100%); }
                            }
                            .animate-progress-indeterminate {
                                animation: progress-in 1.5s infinite linear;
                                transform-origin: left;
                            }

                            .analysis-summary-content strong {
                                display: block;
                                margin-top: 20px;
                                margin-bottom: 8px;
                                color: #0f172a;
                                font-family: 'Playfair Display', serif;
                                font-size: 1.1em;
                            }

                            .analysis-summary-content strong:first-child {
                                margin-top: 0;
                            }
                        `}</style>
                    </div>
                </div>
            )}
        </div>
    );
}
