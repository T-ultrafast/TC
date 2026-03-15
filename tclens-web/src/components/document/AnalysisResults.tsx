"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Zap,
    ShieldAlert,
    AlertTriangle,
    Check,
    Info,
    ArrowRight,
    User,
    MessageSquare,
    SendHorizonal,
    BrainCircuit,
    Search,
    Plus,
    Loader2,
    DollarSign,
    Target,
    Scale,
    FileSearch,
    Fingerprint,
    Lock,
    Eye,
    RefreshCw,
    Download,
    Link as LinkIcon,
    MessageCircle,
    Globe
} from 'lucide-react';

interface AnalysisResultsProps {
    result: any;
    isVerifiedHandshake: boolean;
    EXTENSION_ONLY: boolean;
    chatMessages: any[];
    chatLoading: boolean;
    handleChatSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleDownloadAnalysisPdf: () => void;
    analysisId?: string | null;
    loading?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
    result,
    isVerifiedHandshake,
    EXTENSION_ONLY,
    chatMessages,
    chatLoading,
    handleChatSubmit,
    handleDownloadAnalysisPdf,
    analysisId,
    loading = false
}) => {
    const router = useRouter();
    const [statusIndex, setStatusIndex] = React.useState(0);
    const forensicStatuses = [
        { message: "Initializing Forensic Scan...", icon: Search, color: "text-tclens-500", detail: "Synchronizing intelligence nodes..." },
        { message: "De-obfuscating legal jargon...", icon: FileSearch, color: "text-blue-500", detail: "Parsing archaic terminology..." },
        { message: "Hunting for shark clauses...", icon: ShieldAlert, color: "text-red-500", detail: "Identifying predatory power-grabs..." },
        { message: "Sniffing for hidden surcharges...", icon: DollarSign, color: "text-emerald-500", detail: "Scanning fee-lock structures..." },
        { message: "Extracting liability vectors...", icon: Scale, color: "text-amber-500", detail: "Mapping dispute resolution paths..." },
        { message: "De-scrambling unconscionable legalese...", icon: Fingerprint, color: "text-rose-500", detail: "Revealing obfuscated obligations..." },
        { message: "Calculating litigation probability...", icon: Target, color: "text-indigo-500", detail: "Simulating judicial outcomes..." },
        { message: "Synthesizing strategic audit...", icon: BrainCircuit, color: "text-purple-500", detail: "Drafting user-leverage brief..." },
    ];

    React.useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setStatusIndex((prev) => (prev + 1) % forensicStatuses.length);
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [loading]);

    if (loading) {
        const current = forensicStatuses[statusIndex];
        const CurrentIcon = current.icon;

        return (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-6 md:p-12 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(5,150,105,0.03),transparent_50%)]" />
                <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                <div className="relative mb-10 md:mb-16 h-24 w-24 md:h-32 md:w-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-tclens-500/10 animate-ping duration-[3s]" />
                    <div className="absolute inset-0 rounded-full border-2 border-tclens-500/20 animate-pulse duration-[2s]" />
                    <div className="absolute -inset-4 md:-inset-6 rounded-full border border-dashed border-slate-200 animate-[spin_15s_linear_infinite]" />
                    <div className="absolute -inset-8 md:-inset-12 rounded-full border border-dotted border-slate-100 animate-[spin_25s_linear_infinite_reverse]" />

                    <div className={cn(
                        "w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl flex items-center justify-center relative z-10 transition-all duration-700 transform rotate-3 shadow-2xl shadow-slate-200/50",
                        current.color.replace('text-', 'bg-').replace('500', '50')
                    )}>
                        <CurrentIcon className={cn("w-10 h-10 md:w-14 md:h-14 animate-[bounce_2s_infinite] transition-all", current.color)} />
                    </div>
                </div>

                <div className="space-y-6 relative z-10 max-w-sm">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-tclens-50 rounded-full text-[10px] font-black text-tclens-600 uppercase tracking-widest ring-1 ring-tclens-200/50">
                            Neural Pipeline Active
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Forensic Extraction
                        </h3>
                    </div>

                    <div className="h-12 flex flex-col items-center justify-center">
                        <p className="text-lg font-bold text-slate-700">
                            {current.message}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-60">
                            {current.detail}
                        </p>
                    </div>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        <div className="w-64 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-tclens-600 to-tclens-500 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                                style={{ width: `${((statusIndex + 1) / forensicStatuses.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <span key={i} className="w-1.5 h-1.5 bg-tclens-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                SYNC: {Math.round(((statusIndex + 1) / forensicStatuses.length) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-slate-100 rounded-tl-2xl" />
                <div className="absolute top-10 right-10 w-12 h-12 border-t-2 border-r-2 border-slate-100 rounded-tr-2xl" />
                <div className="absolute bottom-10 left-10 w-12 h-12 border-b-2 border-l-2 border-slate-100 rounded-bl-2xl" />
                <div className="absolute bottom-10 right-10 w-12 h-12 border-b-2 border-r-2 border-slate-100 rounded-br-2xl" />
            </div>
        );
    }

    if (!result || (EXTENSION_ONLY && !isVerifiedHandshake)) {
        return (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mb-8">
                    <Search className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ready for Intelligence</h3>
                <p className="text-slate-500 mt-2 max-w-sm font-medium">
                    {EXTENSION_ONLY
                        ? "This analysis interface is restricted to the TCLens browser extension. Please trigger an analysis from the extension to see results."
                        : "Upload a document or paste terms to see a deep dive analysis into the legal risks."}
                </p>
                {EXTENSION_ONLY && (
                    <Button
                        variant="outline"
                        className="mt-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
                        onClick={() => window.open('/#install-extension', '_blank')}
                    >
                        Get Extension
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
            {/* Score & Summary Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 md:p-10 relative overflow-hidden group transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 bg-tclens-500/5 rounded-full -mr-20 -mt-20 md:-mr-40 md:-mt-40 blur-2xl md:blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-center">
                    <div className="relative shrink-0 flex flex-col items-center">
                        <div className="relative">
                            <svg className="w-28 h-28 md:w-36 md:h-36 transform -rotate-90">
                                <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 hidden md:block" />
                                <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 hidden md:block" />
                                <circle
                                    cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={301}
                                    strokeDashoffset={301 - (301 * (result.risk_score || 0)) / 100}
                                    className={cn(
                                        "md:hidden transition-all duration-1000 ease-out",
                                        result.risk_score > 75 ? "text-red-500" : result.risk_score > 40 ? "text-amber-500" : "text-tclens-500"
                                    )}
                                />
                                <circle
                                    cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="transparent"
                                    strokeDasharray={402}
                                    strokeDashoffset={402 - (402 * (result.risk_score || 0)) / 100}
                                    className={cn(
                                        "hidden md:block transition-all duration-1000 ease-out",
                                        result.risk_score > 75 ? "text-red-500" : result.risk_score > 40 ? "text-amber-500" : "text-tclens-500"
                                    )}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl md:text-4xl font-bold text-slate-900">{result.risk_score || 0}</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Risk Score</span>
                            </div>
                        </div>

                        <div className={cn(
                            "mt-4 md:mt-8 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest border transition-colors flex flex-col items-center gap-1",
                            result.risk_score > 75 ? "bg-red-50 text-red-600 border-red-100" :
                                result.risk_score > 40 ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-tclens-50 text-tclens-600 border-tclens-100"
                        )}>
                            <span>{result.risk_score > 75 ? "Critical Review" :
                                result.risk_score > 40 ? "Standard Review" :
                                    "Safety Assured"}</span>
                            {result.litigation_risk_index && (
                                <span className="opacity-60 text-[7px] md:text-[8px] border-t border-current pt-1 mt-1 font-black italic">Litigation Exposure: {result.litigation_risk_index}%</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 md:space-y-6 w-full text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                            <div className="space-y-1">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Intelligence Briefing</h3>
                                <div className="flex items-center justify-start gap-2">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {result.languageDetection?.primary || 'Legal English'}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 capitalize">Confidence: {result.analysis_confidence || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate prose-xs md:prose-sm max-w-none text-slate-600 leading-snug md:leading-normal font-medium text-[11px] md:text-sm text-left break-words min-w-0">
                            <ReactMarkdown
                                components={{
                                    strong: ({ children }) => {
                                        const text = String(children);
                                        const isHeader = ["Executive Summary", "Risk Analysis", "Strategic Posture", "Executive Audit", "Predatory Clauses", "Critical Gaps", "Surgical Posture", "Ambiguity Mapping"].some(h => text.includes(h));
                                        
                                        if (isHeader) {
                                            return (
                                                <span className="block mt-6 first:mt-0 font-bold text-slate-900 border-l-2 border-tclens-500 pl-3 py-0.5 mb-2 uppercase text-[10px] tracking-widest">
                                                    {children}
                                                </span>
                                            );
                                        }
                                        return <strong className="font-bold text-slate-900">{children}</strong>;
                                    }
                                }}
                            >
                                {result.summary}
                            </ReactMarkdown>
                        </div>

                        <div className="pt-4 md:pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                            <Button
                                onClick={handleDownloadAnalysisPdf}
                                className="h-10 md:h-11 px-6 rounded-lg text-[11px] md:text-xs font-bold gap-2 bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 w-full sm:w-auto"
                            >
                                <Download className="w-4 h-4" />
                                Download Intelligence Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Risk Metrics Grid */}
                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    <div className="space-y-4 group/metric">
                        <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-slate-400 group-hover/metric:text-tclens-500 transition-colors" />
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-slate-400 break-words">Privacy Rating</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-extrabold text-slate-900">{result.fairness_metrics?.privacy || 0}</div>
                            <div className="text-[10px] font-black text-slate-300">/10</div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-tclens-500 transition-all duration-1000" style={{ width: `${(result.fairness_metrics?.privacy || 0) * 10}%` }} />
                        </div>
                    </div>
                    <div className="space-y-4 md:border-l lg:border-l border-slate-100 px-0 md:px-8 group/metric">
                        <div className="flex items-center gap-2">
                            <Scale className="w-3.5 h-3.5 text-slate-400 group-hover/metric:text-amber-500 transition-colors" />
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-slate-400 break-words">Liability Shield</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-extrabold text-slate-900">{result.fairness_metrics?.liability || 0}</div>
                            <div className="text-[10px] font-black text-slate-300">/10</div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(result.fairness_metrics?.liability || 0) * 10}%` }} />
                        </div>
                    </div>
                    <div className="space-y-4 lg:border-l border-slate-100 lg:px-8 group/metric">
                        <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover/metric:text-blue-500 transition-colors" />
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-slate-400 break-words">Transparency</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-extrabold text-slate-900">{result.fairness_metrics?.transparency || 0}</div>
                            <div className="text-[10px] font-black text-slate-300">/10</div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(result.fairness_metrics?.transparency || 0) * 10}%` }} />
                        </div>
                    </div>
                    <div className="space-y-4 lg:border-l border-slate-100 lg:px-8 group/metric">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover/metric:text-purple-500 transition-colors" />
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-slate-400 break-words">Continuity</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-extrabold text-slate-900">{result.fairness_metrics?.continuity || 0}</div>
                            <div className="text-[10px] font-black text-slate-300">/10</div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(result.fairness_metrics?.continuity || 0) * 10}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Risk Breakdown */}
            {result.breakdown && result.breakdown.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-2 h-7 bg-tclens-500 rounded-full" />
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Risk Vector Analysis</h3>
                    </div>
                    <div className="grid gap-4">
                        {result.breakdown.map((item: any, i: number) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-100 p-6 hover:border-tclens-500/50 transition-all duration-300 group shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1 min-w-0 w-full">
                                        <div className="font-bold text-base text-slate-900 group-hover:text-tclens-600 transition-colors break-words line-clamp-2">{item.category}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest break-words">{item.label}</div>
                                    </div>

                                    <div className="flex-1 md:max-w-[200px] space-y-3 min-w-0 w-full">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-wider",
                                                item.points > 15 ? "text-red-500" : item.points > 10 ? "text-amber-600" : "text-tclens-600"
                                            )}>
                                                {item.points > 15 ? "Critical Severity" : item.points > 10 ? "Significant Impact" : "Nominal Impact"}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500">+{item.points}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    item.points > 15 ? "bg-red-500" : item.points > 10 ? "bg-amber-500" : "bg-tclens-500"
                                                )}
                                                style={{ width: `${Math.min(100, (item.points / 20) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 md:max-w-[300px] min-w-0 w-full">
                                        <div className="space-y-2 border-l-2 border-slate-100 pl-4 group-hover:border-tclens-200 transition-colors overflow-hidden">
                                            {item.evidence?.slice(0, 2).map((snippet: string, j: number) => (
                                                <p key={j} className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-2 break-words">"{snippet}"</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Critical Gaps Section */}
            {result.missingProtections && result.missingProtections.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1 text-tclens-600">
                        <Fingerprint className="w-6 h-6" />
                        <h3 className="text-xl font-bold tracking-tight">Critical Forensic Gaps</h3>
                    </div>
                    <div className="grid gap-6">
                        {result.missingProtections.map((gap: any, i: number) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-6 md:p-8 hover:bg-slate-100 transition-all group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                                            <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{gap.type}</h4>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">{gap.description}</p>
                                    </div>
                                    <div className="flex-1 bg-white border border-slate-100 rounded-xl p-5 shadow-sm min-w-0 overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Surgical Rebuttal Text</p>
                                        <p className="text-xs text-tclens-700 font-mono italic p-3 bg-tclens-50/50 rounded-lg border border-tclens-100 leading-relaxed break-words">"{gap.fix}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ambiguity Audit & Leverage Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Ambiguity Audit */}
                {result.ambiguity_audit && result.ambiguity_audit.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <FileSearch className="w-6 h-6 text-amber-500" />
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ambiguity Audit</h3>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                            {result.ambiguity_audit.map((item: any, i: number) => (
                                <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-1 bg-amber-50 rounded text-[10px] font-black text-amber-700 uppercase ring-1 ring-amber-200 ring-inset">Vague Term: "{item.term}"</span>
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3 font-medium">Context: <span className="italic">"{item.context}"</span></p>
                                    <p className="text-[11px] text-slate-900 font-bold leading-relaxed">{item.risk}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leverage Matrix */}
                {result.user_leverage && result.user_leverage.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <Target className="w-6 h-6 text-tclens-500" />
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Leverage Matrix</h3>
                        </div>
                        <div className="bg-slate-900 rounded-xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                            {result.user_leverage.map((item: any, i: number) => (
                                <div key={i} className="p-6 hover:bg-white/5 transition-colors group">
                                    <h4 className="text-tclens-400 font-bold text-sm mb-2 flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 fill-tclens-400" />
                                        {item.point}
                                    </h4>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.strategy}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Red Flags */}
            {result.redFlags && result.redFlags.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1 text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="text-xl font-bold tracking-tight">Critical Forensic Red Flags</h3>
                    </div>
                    <div className="grid gap-6">
                        {(result.redFlags ?? []).map((flag: any, i: number) => (
                            <div key={i} className="bg-red-50/20 border border-red-100 rounded-xl p-5 md:p-8 hover:bg-red-50/40 transition-all group">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <ShieldAlert className="w-6 h-6 md:w-7 md:h-7 text-red-500" />
                                    </div>
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <h4 className="font-bold text-red-900 text-base md:text-lg">{flag.title}</h4>
                                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{flag.description}</p>
                                        {flag.implication && (
                                            <div className="mt-5 pt-4 border-t border-red-100/50">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                    <div className="w-1 h-3 bg-red-400 rounded-full" />
                                                    <span className="font-bold text-red-900/40 uppercase text-[8px] md:text-[9px] tracking-[0.2em]">Forensic Impact</span>
                                                </div>
                                                <p className="text-[13px] md:text-sm text-red-900/80 font-medium leading-relaxed italic break-words">"{flag.implication}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Identified Clauses */}
            {result.clauses && result.clauses.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-2 h-7 bg-slate-400 rounded-full" />
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Deep Clause Extraction</h3>
                    </div>
                    <div className="grid gap-4">
                        {(result.clauses ?? []).map((clause: any, i: number) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 group hover:border-tclens-200 transition-all">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    clause.riskLevel === "Critical" ? "bg-red-500 animate-pulse" :
                                                        clause.riskLevel === "High" ? "bg-orange-500" :
                                                            clause.riskLevel === "Medium" ? "bg-amber-500" : "bg-tclens-500"
                                                )} />
                                                <h4 className="text-base md:text-lg font-bold text-slate-900 break-words min-w-0">{clause.type}</h4>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border",
                                                    clause.riskLevel === "Critical" ? "bg-red-50 text-red-600 border-red-100" :
                                                        clause.riskLevel === "High" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                            clause.riskLevel === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-tclens-50 text-tclens-600 border-tclens-100"
                                                )}>
                                                    {clause.riskLevel} Risk
                                                </span>
                                            </div>
                                            <p className="text-[13px] md:text-base text-slate-700 font-semibold leading-snug group-hover:text-slate-900 transition-colors break-words">{clause.summary}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Analysis</h5>
                                            <p className="text-sm text-slate-600 leading-snug font-medium italic break-words">"{clause.explanation}"</p>
                                        </div>
                                        {clause.rebuttal && (
                                            <div className="space-y-3 lg:col-span-1">
                                                <h5 className="text-[10px] font-bold text-tclens-500 uppercase tracking-widest flex items-center gap-2">
                                                    Strategic Counter-Clause
                                                    <Zap className="w-3 h-3 fill-tclens-500" />
                                                </h5>
                                                <div className="p-4 bg-tclens-50/30 border border-tclens-100 rounded-xl">
                                                    <p className="text-xs text-tclens-900 font-mono leading-snug break-all md:break-words">"{clause.rebuttal}"</p>
                                                </div>
                                            </div>
                                        )}
                                        {clause.originalExcerpt && (
                                            <div className="space-y-3 lg:col-span-1">
                                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Provision</h5>
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                    <p className="text-xs text-slate-500 italic line-clamp-3 leading-snug font-medium break-words">"{clause.originalExcerpt}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Neural Guidance */}
            {result.nextSteps && result.nextSteps.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-1">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <BrainCircuit className="w-6 h-6 text-tclens-500" />
                                Strategic Optimization
                            </h3>
                            <p className="text-xs text-slate-400 font-medium ml-9">AI-recommended path to safety and compliance</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {(result.nextSteps ?? []).map((step: any, i: number) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-center p-6 md:p-8 group hover:bg-white/[0.02] transition-colors cursor-pointer text-center md:text-left"
                                    onClick={() => {
                                        const form = document.querySelector('#chat-form') as HTMLFormElement;
                                        const input = form?.querySelector('input[name="question"]') as HTMLInputElement;
                                        if (input && form) {
                                            input.value = `Can you guide me through: ${step}?`;
                                            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                        }
                                    }}>
                                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all group-hover:bg-tclens-500/10 group-hover:border-tclens-500/20">
                                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-tclens-400 group-hover:text-tclens-500" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[13px] md:text-sm font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors capitalize">{step}</p>
                                    </div>
                                    <div className="md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-tclens-500 uppercase tracking-widest mt-2 md:mt-0">
                                        Activate Guidance
                                        <Plus className="w-3 h-3" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-br md:bg-gradient-to-r from-tclens-600 to-tclens-500 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div className="space-y-1.5">
                                <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">Interactive Legal Support</h4>
                                <p className="text-white/80 text-[13px] md:text-sm font-medium max-w-[280px] md:max-w-none">Activate full AI reasoning for deeper document clarification.</p>
                            </div>
                            <Button
                                onClick={() => {
                                    const chatSection = document.getElementById('ai-follow-up');
                                    chatSection?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-white text-tclens-600 hover:bg-slate-50 h-11 md:h-12 px-8 rounded-xl font-bold transition-all active:scale-95 text-xs md:text-sm w-full md:w-auto shadow-lg shadow-tclens-900/10"
                            >
                                Initialize Chat
                                <MessageCircle className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Follow-up Section */}
            <div id="ai-follow-up" className="pt-10 border-t border-slate-100 space-y-8">
                <div className="flex items-center justify-between px-1">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-500" />
                            Active Intelligence Assistant
                        </h3>
                        {chatMessages.length > 0 && !chatLoading && (
                            <div className="mt-2 ml-9 p-3 bg-amber-50 rounded-lg border border-amber-100/50 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-500">
                                <p className="text-[10px] font-semibold text-amber-800 leading-tight">
                                    Want a focused deep-dive? Relocate this session to our full-screen Professional Assistant.
                                </p>
                                <Button 
                                    size="sm" 
                                    onClick={() => router.push(`/app/ai-lawyer?analysisId=${analysisId || ''}`)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold uppercase tracking-widest px-4 h-7 whitespace-nowrap"
                                >
                                    Proceed to Central Hub
                                </Button>
                            </div>
                        )}
                        <p className="text-[11px] font-semibold text-slate-400 ml-9">
                            Real-time contextual synthesis • No legal advice provided
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-[500px] md:h-[600px] relative">
                    <div className="absolute top-4 right-4 z-10">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            onClick={() => router.push(`/app/ai-lawyer?analysisId=${analysisId || ''}`)}
                        >
                            <Globe className="w-3 h-3 mr-2" />
                            Relocate to Main Hub
                        </Button>
                    </div>
                    <div id="chat-messages-container" className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar scroll-smooth bg-slate-50/30">
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
                                    <MessageSquare className="w-10 h-10 text-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-slate-900">Neural Stream Empty</p>
                                    <p className="text-xs text-slate-500 max-w-[200px]">Query me about risk mitigation or specific clauses.</p>
                                </div>
                            </div>
                        ) : (
                            chatMessages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "flex",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}>
                                    <div className={cn(
                                        "max-w-[85%] md:max-w-[75%] p-3 md:p-5 text-[13px] md:text-sm leading-snug relative break-words",
                                        msg.role === 'user'
                                            ? "bg-slate-900 text-white rounded-xl md:rounded-2xl rounded-tr-none shadow-sm"
                                            : "bg-transparent text-slate-700 font-medium text-left px-0"
                                    )}>
                                        {msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            <div className="prose prose-slate prose-xs md:prose-sm max-w-none text-current leading-snug text-left">
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {chatLoading && (
                            <div className="flex gap-4 items-center animate-in fade-in duration-500">
                                <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3 shadow-sm">
                                    <span className="flex gap-1">
                                        <span className="w-1.2 h-1.2 bg-tclens-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.2 h-1.2 bg-tclens-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.2 h-1.2 bg-tclens-500 rounded-full animate-bounce" />
                                    </span>
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                        <form id="chat-form" onSubmit={handleChatSubmit} className="flex gap-3">
                            <div className="flex-1 relative group">
                                <input
                                    name="question"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Inquire about risk..."
                                    className="w-full h-12 md:h-14 pl-4 md:pl-6 pr-10 md:pr-14 rounded-lg md:rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none text-xs md:text-sm font-bold transition-all group-hover:border-slate-300"
                                />
                                <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 group-hover:text-slate-400 uppercase tracking-widest pointer-events-none transition-colors">
                                    Send
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={chatLoading}
                                className="h-12 w-12 md:h-14 md:w-14 rounded-lg md:rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-0 transition-all active:scale-95"
                            >
                                <SendHorizonal className="w-5 h-5 md:w-6 md:h-6 text-tclens-400" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
