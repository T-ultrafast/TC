"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Globe,
    Upload,
    Link as LinkIcon,
    Type as TypeIcon,
    Zap,
    Loader2,
    FileText
} from 'lucide-react';
import { Country, State } from 'country-state-city';

interface AnalysisFormProps {
    jurisdiction: string;
    handleJurisdictionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    geoState: string;
    handleGeoStateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    inputMode: string;
    setInputMode: (mode: string) => void;
    text: string;
    setText: (val: string) => void;
    linkUrl: string;
    setLinkUrl: (val: string) => void;
    file: File | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAnalyze: () => void;
    loading: boolean;
    isOverLimit: boolean;
    currentWordCount: number;
    currentLimit: number;
    usagePercentage: number;
}

const LOADING_STEPS = [
    "Hunting for shark clauses...",
    "De-obfuscating legal jargon...",
    "Checking for hidden arbitration traps...",
    "Auditing unconscionable liability limits...",
    "Sifting through 'snake words'...",
    "Preparing your forensic dossier...",
    "Calculating litigation probability...",
    "Polishing the leverage matrix...",
    "Finalizing intelligence briefing..."
];

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
    jurisdiction,
    handleJurisdictionChange,
    geoState,
    handleGeoStateChange,
    inputMode,
    setInputMode,
    text,
    setText,
    linkUrl,
    setLinkUrl,
    file,
    handleFileChange,
    handleAnalyze,
    loading,
    isOverLimit,
    currentWordCount,
    currentLimit,
    usagePercentage
}) => {
    const [loadingStep, setLoadingStep] = React.useState(0);

    React.useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [loading]);

    const countries = Country.getAllCountries();
    const states = jurisdiction ? State.getStatesOfCountry(jurisdiction) : [];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 relative overflow-hidden group hover:border-tclens-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tclens-500/5 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                {/* Jurisdiction Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <div className="space-y-2.5">
                        <label className="text-[11px] font-bold capitalize tracking-wider text-[var(--label-color)] flex items-center gap-2 ml-1">
                            <Globe className="w-3.5 h-3.5 text-tclens-400" />
                            Country
                        </label>
                        <div className="relative">
                            <select
                                value={jurisdiction}
                                onChange={handleJurisdictionChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 appearance-none outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 cursor-pointer"
                            >
                                <option value="">Select country</option>
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[11px] font-bold capitalize tracking-wider text-[var(--label-color)] flex items-center gap-2 ml-1">
                            <Zap className="w-3.5 h-3.5 text-tclens-400" />
                            State/Region
                        </label>
                        <select
                            disabled={!jurisdiction || states.length === 0}
                            value={geoState}
                            onChange={handleGeoStateChange}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 appearance-none outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 cursor-pointer disabled:opacity-50"
                        >
                            <option value="">{states.length === 0 ? "No states available" : "Select region"}</option>
                            {states.map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 mb-8">
                    {[
                        { id: 'paste', label: 'Snippet', icon: TypeIcon },
                        { id: 'upload', label: 'Document', icon: Upload },
                        { id: 'link', label: 'Live Link', icon: LinkIcon }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setInputMode(mode.id)}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                inputMode === mode.id ? "bg-white text-tclens-600 border border-slate-100 scale-105 z-10" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <mode.icon className="w-3.5 h-3.5" />
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    {inputMode === "upload" ? (
                        <div className="space-y-4">
                            <label className="flex flex-col items-center justify-center w-full h-[300px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 hover:bg-slate-50/50 hover:border-tclens-500/50 transition-all cursor-pointer group">
                                <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Upload className="w-10 h-10 text-tclens-500" />
                                    </div>
                                    <p className="font-bold text-slate-900 text-lg">{file ? file.name : "Drop your document"}</p>
                                    <p className="text-sm text-slate-500 mt-2">PDF, DOCX, or TXT (Max 10MB)</p>
                                </div>
                            </label>
                        </div>
                    ) : inputMode === "paste" ? (
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste the agreement clauses here for clinical AI analysis..."
                            className="w-full h-[300px] p-6 rounded-2xl border border-slate-200 bg-slate-50/30 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 focus:bg-white outline-none resize-none text-sm font-medium leading-relaxed transition-all"
                        />
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 space-y-8">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                                    <LinkIcon className="w-8 h-8 text-tclens-500" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-900 capitalize tracking-widest ml-1">Live URL Path</label>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com/terms-and-conditions"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Agreement must be publicly accessible for extraction.</p>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleAnalyze}
                    disabled={
                        loading ||
                        isOverLimit ||
                        (inputMode === "upload" && !file) ||
                        (inputMode === "paste" && !text.trim()) ||
                        (inputMode === "link" && !linkUrl.trim()) ||
                        !jurisdiction
                    }
                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold mt-10 transition-all gap-3 group"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-tclens-400" />
                                <span className="text-base">Analyzing Document...</span>
                            </div>
                            <p className="text-[10px] font-bold text-tclens-400/60 uppercase tracking-[0.2em] animate-pulse">
                                {LOADING_STEPS[loadingStep]}
                            </p>
                        </div>
                    ) : (
                        <>
                            <span>Start Risk Analysis</span>
                            <Zap className="w-5 h-5 fill-tclens-400 text-tclens-400 group-hover:scale-125 transition-transform" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
