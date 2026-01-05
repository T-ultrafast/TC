"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Upload,
    Plus,
    Zap,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Loader2,
    Copy,
    Check,
    Download,
    Scale,
    Search,
    Type as TypeIcon
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getUsage, trackUsage, LIMITS } from "@/lib/usage";

type AnalysisResult = {
    languageDetection: {
        primary: string;
        secondary?: string[];
    };
    summary: string;
    riskScore: number;
    confidence: number;
    clauses: Array<{
        type: string;
        summary: string;
        riskLevel: "Low" | "Medium" | "High" | "Critical";
        explanation: string;
        originalExcerpt?: string;
        translatedExcerpt?: string;
    }>;
    redFlags: Array<{
        title: string;
        description: string;
    }>;
    nextSteps: string[];
    wordCount: number;
};

export default function DocumentPage() {
    const [tab, setTab] = useState<"analyze" | "generate">("analyze");
    const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Usage state
    const [usage, setUsage] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedIn = auth.isAuthenticated();
        setIsLoggedIn(loggedIn);
        setUsage(getUsage(loggedIn));
    }, []);

    const currentLimit = isLoggedIn ? LIMITS.FREE_ACCOUNT : LIMITS.ANONYMOUS;
    const usagePercentage = Math.min(100, (usage / currentLimit) * 100);

    // Generation State
    const [genType, setGenType] = useState("NDA (Mutual)");
    const [genResult, setGenResult] = useState("");
    const [genLoading, setGenLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleAnalyze = async () => {
        if (inputMode === "upload" && !file) return;
        if (inputMode === "paste" && !text.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            if (inputMode === "upload" && file) {
                formData.append("file", file);
            } else {
                formData.append("text", text);
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
                headers: {
                    'x-usage': usage.toString(),
                    'x-is-logged-in': isLoggedIn.toString()
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
                // Return a more descriptive error incorporating details if present
                const errorMessage = data.error || "Analysis failed";
                const errorDetails = data.details ? `: ${data.details}` : "";
                throw new Error(`${errorMessage}${errorDetails}`);
            }

            const analysisData = data.data;

            // Track usage
            if (analysisData.wordCount) {
                trackUsage(analysisData.wordCount, isLoggedIn);
                setUsage(getUsage(isLoggedIn));
            }

            setResult(analysisData);
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "Failed to analyze document");
        } finally {
            setLoading(false);
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
                body: JSON.stringify({ type: genType }),
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

                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setTab("analyze")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                tab === "analyze" ? "bg-white text-legal-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Analyze
                        </button>
                        <button
                            onClick={() => setTab("generate")}
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
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setInputMode("upload")}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2",
                                        inputMode === "upload" ? "border-legal-navy bg-slate-50 text-legal-navy" : "border-transparent text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    <Upload className="w-4 h-4" />
                                    File Upload
                                </button>
                                <button
                                    onClick={() => setInputMode("paste")}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2",
                                        inputMode === "paste" ? "border-legal-navy bg-slate-50 text-legal-navy" : "border-transparent text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    <FileText className="w-4 h-4" />
                                    Paste Text
                                </button>
                            </div>

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
                            ) : (
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste the legal text here..."
                                    className="w-full h-[300px] p-4 rounded-[1.5rem] border border-slate-200 focus:ring-2 focus:ring-legal-navy focus:border-transparent resize-none text-sm outline-none bg-slate-50/50"
                                />
                            )}

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || (inputMode === "upload" && !file) || (inputMode === "paste" && !text.trim())}
                                className="w-full h-14 rounded-2xl bg-legal-navy hover:bg-slate-800 text-lg font-bold mt-6 shadow-xl shadow-legal-navy/10 transition-all border-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Analyzing Intelligence...
                                    </>
                                ) : (
                                    <>
                                        Analyze Document
                                        <Zap className="ml-2 w-5 h-5 fill-emerald-400 text-emerald-400" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 font-medium">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Results Display */}
                    <div className="lg:col-span-7">
                        {result ? (
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
                                                        height: `${result.riskScore}%`,
                                                        backgroundColor: result.riskScore > 70 ? '#ef4444' : result.riskScore > 40 ? '#f59e0b' : '#10b981',
                                                        opacity: 0.1
                                                    }}
                                                />
                                                <div className="text-center z-10">
                                                    <div
                                                        className="text-4xl font-black font-outfit"
                                                        style={{ color: result.riskScore > 70 ? '#ef4444' : result.riskScore > 40 ? '#f59e0b' : '#10b981' }}
                                                    >
                                                        {result.riskScore}
                                                    </div>
                                                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Risk Score</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-legal-navy font-outfit">Analysis Summary</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-tight">
                                                        {result.languageDetection.primary}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        Confidence: {result.confidence}%
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm">{result.summary}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Red Flags */}
                                {result.redFlags && result.redFlags.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-red-600 px-2 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Red Flags
                                        </h3>
                                        <div className="grid gap-4">
                                            {(result.redFlags ?? []).map((flag, i) => (
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
                                    {(result.clauses ?? []).map((clause, i) => (
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
                                                {(result.nextSteps ?? []).map((step, i) => (
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
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-legal-navy font-outfit">Ready for Intelligence</h3>
                                <p className="text-slate-400 mt-2 max-w-sm">
                                    Upload a document or paste terms to see a deep dive analysis into the legal risks.
                                </p>
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
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-legal-navy outline-none font-bold text-slate-600 bg-slate-50 cursor-pointer"
                                >
                                    <option>NDA (Mutual)</option>
                                    <option>Service Agreement</option>
                                    <option>Employment Offer Letter</option>
                                    <option>Independent Contractor Agreement</option>
                                    <option>Privacy Policy</option>
                                    <option>Terms of Service</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-black text-legal-navy uppercase tracking-wider">Jurisdiction</label>
                                <Input placeholder="e.g. California, USA" className="h-12 rounded-xl" />
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <label className="text-sm font-black text-legal-navy uppercase tracking-wider">Additional Context (Optional)</label>
                            <textarea
                                placeholder="Add specific terms, party names, or requirements..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-legal-navy outline-none text-sm resize-none bg-slate-50"
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={genLoading}
                            className="w-full h-14 rounded-2xl bg-legal-navy hover:bg-slate-800 text-lg font-bold mt-8 shadow-xl shadow-legal-navy/10 transition-all border-none"
                        >
                            {genLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Drafting Legal Language...
                                </>
                            ) : (
                                <>
                                    Generate Draft
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
