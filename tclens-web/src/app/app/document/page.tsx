"use client";

import React, { useState, useEffect } from "react";
import {
    Upload, FileText, Zap, AlertTriangle, Check, ChevronRight,
    Loader2, Search, Link as LinkIcon, Type as TypeIcon,
    CheckCircle, Globe, Plus, Download, Scale, ArrowRight
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
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="min-h-[200px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
        <div className="text-sm text-slate-500 font-medium">Loading editor...</div>
    </div>
});
import { Input } from "@/components/ui/input";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

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
        const loggedIn = auth.isAuthenticated();
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
        const loggedInUser = auth.getUser();
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
        const loggedInUser = auth.getUser();
        if (!loggedInUser) return;

        try {
            const response = await fetch(`/api/analysis/${id}/chat`, {
                headers: {
                    'x-is-logged-in': 'true',
                    'x-user-id': loggedInUser.email
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

    const user = auth.getUser();
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
    const [genResult, setGenResult] = useState("");
    const [genLoading, setGenLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [genJurisdiction, setGenJurisdiction] = useState("");
    const [genState, setGenState] = useState("");
    const [keyDetails, setKeyDetails] = useState("");
    const [keyDetailsWordCount, setKeyDetailsWordCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        const user = auth.getUser();

        try {
            // Optimistic update
            const tempUserMsg = { id: Date.now().toString(), role: 'user', content: question, createdAt: new Date().toISOString() };
            setChatMessages(prev => [...prev, tempUserMsg]);
            input.value = '';

            const response = await fetch(`/api/analysis/${analysisId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-is-logged-in': 'true',
                    'x-user-id': user?.email || 'anonymous'
                },
                body: JSON.stringify({ question })
            });
            const data = await response.json();
            if (data.ok) {
                setChatMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, data.data]);
            }
        } catch (err) {
            console.error("Chat error:", err);
        } finally {
            setChatLoading(false);
        }
    };

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
                    keyDetails: keyDetails
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Generation failed");

            // Sanitizer: Remove code fences if present
            let cleanContent = data.content;
            if (cleanContent.startsWith("```")) {
                const lines = cleanContent.split("\n");
                if (lines[0].startsWith("```")) lines.shift();
                if (lines[lines.length - 1].startsWith("```")) lines.pop();
                cleanContent = lines.join("\n").trim();
            }
            setGenResult(cleanContent);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenLoading(false);
        }
    };

    const handleDownloadDocx = async () => {
        if (!genResult) return;

        try {
            const sections = genResult.split('\n\n');
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                text: genType,
                                heading: HeadingLevel.HEADING_1,
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 400 },
                            }),
                            ...sections.map(section => {
                                // Check if it looks like a heading (e.g., "1. SCOPE OF SERVICES")
                                const isHeading = /^\d+\.?\s+[A-Z\s,]+$/.test(section.trim());
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: section.trim(),
                                            bold: isHeading,
                                            size: 24, // 12pt
                                        }),
                                    ],
                                    spacing: { before: 200, after: 200 },
                                    heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
                                });
                            }),
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${genType.replace(/\s+/g, '_')}_Draft.docx`);
        } catch (err) {
            console.error("DOCX Export Error:", err);
            setError("Failed to generate DOCX file.");
        }
    };

    const copyToClipboard = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-legal-navy font-outfit mb-2">Legal Hub</h1>
                    <p className="text-slate-500">Analyze existing contracts or generate new ones in seconds.</p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Usage Progress */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-right-2">
                            <Zap className="w-4 h-4 fill-emerald-500" />
                            <span className="text-xs font-black uppercase tracking-wider">Unlimited Access</span>
                        </div>
                    ) : (
                        <div className="w-full md:w-64 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Usage: {usage.toLocaleString()} / {currentLimit.toLocaleString()} Words</span>
                                <span>{Math.round(usagePercentage)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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

                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                        {isLoggedIn && (
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                    showHistory ? "bg-legal-navy text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                tab === "analyze" && !showHistory ? "bg-white text-legal-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Analyze
                        </button>
                        <button
                            onClick={() => { setTab("generate"); setShowHistory(false); }}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                tab === "generate" ? "bg-white text-legal-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden relative">
                            {/* Jurisdiction Selector */}
                            {/* Jurisdiction Selector */}
                            <div className="mb-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Globe className="w-3 h-3" />
                                        Target Jurisdiction
                                    </label>
                                    <select
                                        value={jurisdiction}
                                        onChange={handleJurisdictionChange}
                                        className={cn(
                                            "w-full h-12 px-4 rounded-xl border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                            !jurisdiction ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-700 focus:border-legal-navy"
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

                                {/* State / Region Selector (Conditional) */}
                                {jurisdiction && jurisdiction !== "No jurisdiction" && JURISDICTION_DATA[jurisdiction] && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Globe className="w-3 h-3" />
                                            State / Region
                                        </label>
                                        <select
                                            value={geoState}
                                            onChange={handleGeoStateChange}
                                            className={cn(
                                                "w-full h-12 px-4 rounded-xl border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                                !geoState ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-700 focus:border-legal-navy"
                                            )}
                                        >
                                            <option value="">None / Not specified</option>
                                            {JURISDICTION_DATA[jurisdiction].map((region) => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <p className="text-[10px] text-slate-400 mt-1">
                                    Jurisdiction helps tailor clause interpretation to local laws.
                                </p>
                            </div>

                            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl">
                                <button
                                    onClick={() => setInputMode("upload")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2",
                                        inputMode === "upload" ? "bg-white text-legal-navy shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    File
                                </button>
                                <button
                                    onClick={() => setInputMode("paste")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2",
                                        inputMode === "paste" ? "bg-white text-legal-navy shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <TypeIcon className="w-3.5 h-3.5" />
                                    Text
                                </button>
                                <button
                                    onClick={() => setInputMode("link")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2",
                                        inputMode === "link" ? "bg-white text-legal-navy shadow-sm" : "text-slate-400 hover:text-slate-600"
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
                                            file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-legal-navy hover:bg-slate-50"
                                        )}
                                    >
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.txt,.docx"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer space-y-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                                {file ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-slate-400" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-legal-navy">{file ? file.name : "Choose a file"}</p>
                                                <p className="text-xs text-slate-500 mt-1">PDF, TXT, or DOCX (max 10MB)</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : inputMode === "paste" ? (
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Paste the legal text here..."
                                        className="w-full h-[300px] p-4 rounded-[1.5rem] border border-slate-200 focus:ring-2 focus:ring-legal-navy focus:border-transparent resize-none text-sm outline-none bg-slate-50/50"
                                    />
                                ) : (
                                    <div className="space-y-4 py-8">
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                <LinkIcon className="w-6 h-6 text-legal-navy" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-legal-navy uppercase tracking-wider">Web Agreement URL</label>
                                                <input
                                                    type="url"
                                                    value={linkUrl}
                                                    onChange={(e) => setLinkUrl(e.target.value)}
                                                    placeholder="https://example.com/terms"
                                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-legal-navy outline-none text-sm bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Examples:</p>
                                                <p className="text-[10px] text-slate-500">https://site.com/privacy • https://app.com/rules</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!jurisdiction && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <p className="text-[11px] font-bold text-amber-800">Please select a jurisdiction to continue.</p>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-3">
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
                                        isOverLimit ? "text-red-500" : "text-slate-400"
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
                                className="w-full h-14 rounded-2xl bg-legal-navy hover:bg-slate-800 text-lg font-bold mt-6 shadow-xl shadow-legal-navy/10 transition-all border-none disabled:bg-slate-100 disabled:text-slate-400"
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
                                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                        <div className="relative shrink-0">
                                            <div className="w-32 h-32 rounded-full border-[6px] border-slate-100 flex items-center justify-center relative overflow-hidden">
                                                <div
                                                    className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out"
                                                    style={{
                                                        height: `${result.risk_score}%`,
                                                        backgroundColor: result.risk_score > 75 ? '#ef4444' : result.risk_score > 50 ? '#f59e0b' : '#10b981',
                                                        opacity: 0.1
                                                    }}
                                                />
                                                <div className="text-center z-10">
                                                    <div
                                                        className="text-4xl font-black font-outfit"
                                                        style={{ color: result.risk_score > 75 ? '#ef4444' : result.risk_score > 50 ? '#f59e0b' : '#10b981' }}
                                                    >
                                                        {result.risk_score}
                                                    </div>
                                                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Risk Score</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-legal-navy font-outfit">Analysis Summary</h3>
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
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-tight">
                                                        {result.languageDetection?.primary || 'Legal'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        Confidence: {result.analysis_confidence}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                                                <ReactMarkdown>
                                                    {result.summary}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Components (A2 Components) */}
                                    <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-3 gap-4">
                                        <div className="text-center space-y-1">
                                            <div className="text-xl font-black text-legal-navy">{result.components?.clause_risk || 0}</div>
                                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Clause Risk</div>
                                        </div>
                                        <div className="text-center border-x border-slate-100 space-y-1">
                                            <div className="text-xl font-black text-legal-navy">{result.components?.aggressiveness >= 0 ? `+${result.components.aggressiveness}` : result.components.aggressiveness}</div>
                                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Aggressiveness</div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <div className="text-xl font-black text-legal-navy">{result.components?.transparency >= 0 ? `+${result.components.transparency}` : result.components.transparency}</div>
                                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Transparency</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Risk Breakdown (A2 Breakdown) */}
                                {result.breakdown && result.breakdown.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-legal-navy px-2 flex items-center gap-2">
                                            <Search className="w-5 h-5 text-emerald-500" />
                                            Risk Factor Analysis
                                        </h3>
                                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100">
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Impact</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {result.breakdown.map((item: any, i: number) => (
                                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-sm text-legal-navy">{item.category}</div>
                                                                <div className="text-[10px] text-slate-400">{item.label}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black">
                                                                    +{item.points}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <ul className="space-y-1">
                                                                    {item.evidence.map((snippet: string, j: number) => (
                                                                        <li key={j} className="text-[11px] text-slate-500 italic line-clamp-1">"{snippet}"</li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
                                                <div key={i} className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                                                    <h4 className="font-bold text-red-900 text-sm mb-1">{flag.title}</h4>
                                                    <p className="text-sm text-red-800/80">{flag.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clauses List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-legal-navy px-2">Identified Clauses</h3>
                                    {(result.clauses ?? []).map((clause: any, i: number) => (
                                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 group hover:border-legal-navy/20 transition-all shadow-sm">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-2 w-full">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-legal-navy font-outfit">{clause.type}</span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight uppercase",
                                                            clause.riskLevel === "Critical" ? "bg-red-100 text-red-700" :
                                                                clause.riskLevel === "High" ? "bg-orange-100 text-orange-700" :
                                                                    clause.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                                        )}>
                                                            {clause.riskLevel}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{clause.summary}</p>
                                                    <p className="text-xs text-slate-400">{clause.explanation}</p>

                                                    {clause.originalExcerpt && (
                                                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Original</span>
                                                                <p className="text-xs text-slate-500 italic line-clamp-3">"{clause.originalExcerpt}"</p>
                                                            </div>
                                                            {clause.translatedExcerpt && (
                                                                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                                                                    <span className="text-[10px] font-black uppercase text-emerald-500 block mb-1">English Translation</span>
                                                                    <p className="text-xs text-slate-500 italic line-clamp-3">"{clause.translatedExcerpt}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Next Steps */}
                                {result.nextSteps && result.nextSteps.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-legal-navy px-2">Recommended Next Steps</h3>
                                        <div className="bg-legal-navy rounded-[2rem] p-8 text-white shadow-xl shadow-legal-navy/10 relative overflow-hidden">
                                            <Zap className="absolute top-0 right-0 w-32 h-32 text-emerald-500/10 -mr-8 -mt-8" />
                                            <ul className="space-y-4 relative z-10">
                                                {(result.nextSteps ?? []).map((step: any, i: number) => (
                                                    <li key={i} className="flex gap-3 items-start">
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                                            <Check className="w-3.5 h-3.5 text-legal-navy" />
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-200">{step}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up Q&A Section */}
                                <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-legal-navy font-outfit flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                                Ask AI a follow-up question
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Answers are general legal information, not legal advice.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 custom-scrollbar">
                                            {chatMessages.length === 0 ? (
                                                <div className="text-center py-10 space-y-3">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                                        <TypeIcon className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium">Ask anything about this document...</p>
                                                </div>
                                            ) : (
                                                chatMessages.map((msg, i) => (
                                                    <div key={i} className={cn(
                                                        "flex gap-3 max-w-[85%]",
                                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                                    )}>
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                            msg.role === 'user' ? "bg-legal-navy text-white" : "bg-emerald-500 text-legal-navy"
                                                        )}>
                                                            {msg.role === 'user' ? <TypeIcon className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                        </div>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                                                            msg.role === 'user' ? "bg-legal-navy text-white rounded-tr-none" : "bg-white text-slate-600 border border-slate-100 rounded-tl-none"
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
                                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                        AI is thinking...
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={sendChatMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                                            <input
                                                name="question"
                                                type="text"
                                                autoComplete="off"
                                                placeholder="e.g. Can I terminate this with 30 days notice?"
                                                className="flex-1 h-12 px-6 rounded-xl border border-slate-100 focus:ring-2 focus:ring-legal-navy outline-none text-sm bg-slate-50/50"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={chatLoading}
                                                className="h-12 w-12 rounded-xl bg-legal-navy hover:bg-slate-800 p-0 shadow-lg shadow-legal-navy/10"
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
                                    <h3 className="text-xl font-black text-legal-navy font-outfit uppercase tracking-wider">Analysis History</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.length} Records found</span>
                                </div>

                                {history.length === 0 ? (
                                    <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200 space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                                            <FileText className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-medium">No saved analyses found yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {history.map((record) => (
                                            <div
                                                key={record.id}
                                                onClick={() => loadHistoryRecord(record)}
                                                className="group bg-white rounded-3xl border border-slate-200 p-5 hover:border-legal-navy hover:shadow-xl hover:shadow-legal-navy/5 transition-all cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-legal-navy/5 transition-colors">
                                                        {record.inputType === 'link' ? <LinkIcon className="w-6 h-6 text-legal-navy" /> : record.inputType === 'upload' ? <Upload className="w-6 h-6 text-legal-navy" /> : <TypeIcon className="w-6 h-6 text-legal-navy" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-legal-navy group-hover:text-legal-navy transition-colors">{record.sourceName}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {record.jurisdiction}</span>
                                                            <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> {record.wordCount.toLocaleString()} Words</span>
                                                            <span className="text-slate-300">|</span>
                                                            <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-legal-navy transition-all group-hover:translate-x-1" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-legal-navy font-outfit">Ready for Intelligence</h3>
                                <p className="text-slate-400 mt-2 max-w-sm">
                                    {EXTENSION_ONLY
                                        ? "This analysis interface is restricted to the TCLens browser extension. Please trigger an analysis from the extension to see results."
                                        : "Upload a document or paste terms to see a deep dive analysis into the legal risks."}
                                </p>
                                {EXTENSION_ONLY && (
                                    <Button
                                        variant="outline"
                                        className="mt-6 rounded-xl font-bold"
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
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-sm font-black text-legal-navy uppercase tracking-wider">Document Type</label>
                                <select
                                    value={genType}
                                    onChange={(e) => setGenType(e.target.value)}
                                    className={cn(
                                        "w-full h-12 px-4 rounded-xl border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                        !genType ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-700 focus:border-legal-navy"
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
                                <label className="text-sm font-black text-legal-navy uppercase tracking-wider">Jurisdiction</label>
                                <select
                                    value={genJurisdiction}
                                    onChange={(e) => {
                                        setGenJurisdiction(e.target.value);
                                        setGenState(""); // Reset state when jurisdiction changes
                                    }}
                                    className={cn(
                                        "w-full h-12 px-4 rounded-xl border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                        !genJurisdiction ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-700 focus:border-legal-navy"
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
                        </div>

                        {/* State / Region Selector (Conditional) */}
                        {genJurisdiction && genJurisdiction !== "No jurisdiction" && JURISDICTION_DATA[genJurisdiction] && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-black text-legal-navy uppercase tracking-wider">State / Region</label>
                                <select
                                    value={genState}
                                    onChange={(e) => setGenState(e.target.value)}
                                    className={cn(
                                        "w-full h-12 px-4 rounded-xl border appearance-none outline-none font-bold text-sm transition-all cursor-pointer",
                                        !genState ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-700 focus:border-legal-navy"
                                    )}
                                >
                                    <option value="">None / Not specified</option>
                                    {JURISDICTION_DATA[genJurisdiction].map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Key Details Rich Text Editor */}
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-black text-legal-navy uppercase tracking-wider">Key Details</label>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {keyDetailsWordCount} words
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Add important details, clauses, or instructions. The AI will use this as the source of truth.
                            </p>
                            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
                                {mounted ? (
                                    <ReactQuill
                                        value={keyDetails}
                                        onChange={(content) => {
                                            setKeyDetails(content);
                                            setKeyDetailsWordCount(countWordsFromHtml(content));
                                        }}
                                        placeholder="Type key terms here… (e.g., parties, dates, payment terms, termination, governing law, special clauses)"
                                        theme="snow"
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'header': [1, 2, false] }],
                                                ['link'],
                                                ['clean']
                                            ]
                                        }}
                                        className="min-h-[200px]"
                                    />
                                ) : (
                                    <div className="min-h-[200px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                                        <div className="text-sm text-slate-500 font-medium">Loading editor...</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview Inputs Summary */}
                        {(genType || genJurisdiction || keyDetailsWordCount > 0) && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Preview Inputs</div>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-bold text-slate-400">Document Type:</span>
                                        <span className="ml-2 text-slate-700">{genType || "Not selected"}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-400">Jurisdiction:</span>
                                        <span className="ml-2 text-slate-700">
                                            {genJurisdiction || "Not selected"}
                                            {genState && ` (${genState})`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-400">Key Details:</span>
                                        <span className="ml-2 text-slate-700">{keyDetailsWordCount} words</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validation Error */}
                        {!keyDetails.trim() && genType && genJurisdiction && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <p className="text-xs font-bold text-amber-800">Please add key details so the AI can generate an accurate document.</p>
                            </div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={genLoading || !genType || !genJurisdiction || !keyDetails.trim()}
                            className="w-full h-14 rounded-2xl bg-legal-navy hover:bg-slate-800 text-lg font-bold mt-8 shadow-xl shadow-legal-navy/10 transition-all border-none disabled:bg-slate-100 disabled:text-slate-400"
                        >
                            {genLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Drafting Legal Language...
                                </>
                            ) : (
                                <>
                                    Generate Draft +
                                    <Plus className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>

                    {genResult && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-lg font-bold text-legal-navy font-outfit">Draft Result</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(genResult)}
                                        className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 border-slate-200"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadDocx}
                                        className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 border-slate-200"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download .DOCX
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm font-serif text-slate-800 leading-relaxed text-sm max-h-[600px] overflow-y-auto custom-scrollbar prose prose-slate max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {genResult}
                                </ReactMarkdown>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed italic">
                                    <strong>Legal Disclaimer:</strong> This document is an AI-generated draft provided for informational purposes only. It does not constitute legal advice and should be reviewed by a qualified attorney before use.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
