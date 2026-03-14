'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, ArrowLeft, Zap, Target, BarChart3, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

interface Clause {
    type: string;
    summary: string;
    riskLevel: "Low" | "Medium" | "High" | "Critical";
    explanation: string;
    textSnippet: string;
}

interface AnalysisResult {
    languageDetection: {
        primary: string;
        secondary?: string[];
    };
    summary: string;
    riskScore: number;
    risk_level?: string;
    risk_breakdown?: any[];
    ai_severity?: any;
    confidence: number;
    clauses: Clause[];
    redFlags?: { title: string; description: string }[];
    criticalAlerts?: { title: string; description: string }[];
}

export default function AnalysisPage() {
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [expandedClause, setExpandedClause] = useState<number | null>(null);

    useEffect(() => {
        const storedResult = localStorage.getItem('analysisResult');
        if (storedResult) {
            setResult(JSON.parse(storedResult));
        } else {
            router.push('/upload');
        }
    }, [router]);

    if (!result) return null;

    const getRiskStyles = (level: string) => {
        switch (level) {
            case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
            case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'Medium': return 'text-tclens-600 bg-tclens-50 border-tclens-100';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-red-600';
        if (score >= 50) return 'text-tclens-600';
        return 'text-emerald-600';
    };

    return (
        <main className="min-h-screen bg-white pb-24 relative overflow-hidden font-jakarta">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 flex flex-col items-center pt-20 pointer-events-none sticky h-screen">
                <h1 className="bg-text-outline uppercase opacity-20">Report</h1>
                <div className="orb-1 top-40 -left-20" />
                <div className="orb-2 bottom-40 -right-20" />
            </div>

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6">
                <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/upload')}
                            className="rounded-full hover:bg-slate-50 border border-slate-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-slate-950 tracking-tight">Analysis Summary</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-tclens-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Completed</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-sm" onClick={() => window.print()}>
                            Export PDF
                        </Button>
                        <Button className="bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold text-sm px-6" asChild>
                            <Link href="/signup">Save Report</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left: Score & Overview */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 rounded-card border border-slate-100 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-tclens-500/5 blur-3xl rounded-full" />

                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Calculated Risk</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn("text-7xl font-bold tracking-tight", getScoreColor(result.riskScore))}>
                                        {result.riskScore}
                                    </span>
                                    <span className="text-slate-300 font-bold text-2xl">/100</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                        "{result.summary}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</span>
                                        <span className="text-lg font-bold text-slate-900">{result.confidence}%</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clauses Found</span>
                                        <span className="text-lg font-bold text-slate-900">{result.clauses.length}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Critical Alerts Sticky */}
                        {result.criticalAlerts && result.criticalAlerts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 p-8 rounded-card border border-red-100 space-y-4"
                            >
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h4 className="font-bold text-base">Critical Red Flags</h4>
                                </div>
                                <div className="space-y-4">
                                    {result.criticalAlerts.map((alert, i) => (
                                        <div key={i} className="space-y-1">
                                            <p className="font-bold text-red-700 text-sm">{alert.title}</p>
                                            <p className="text-red-600/70 text-xs leading-relaxed font-medium">{alert.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Detailed Clauses */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-slate-900">Found Clauses</h2>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detailed Breakdown</span>
                        </div>

                        <div className="space-y-4">
                            {result.clauses.map((clause, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-card border border-slate-100 overflow-hidden hover:border-tclens-300 transition-all group"
                                >
                                    <button
                                        onClick={() => setExpandedClause(expandedClause === i ? null : i)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                getRiskStyles(clause.riskLevel)
                                            )}>
                                                {clause.riskLevel} Risk
                                            </div>
                                            <h4 className="font-bold text-slate-900 tracking-tight">{clause.type}</h4>
                                        </div>
                                        {expandedClause === i ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedClause === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-50"
                                            >
                                                <div className="p-8 space-y-8 bg-slate-50/50">
                                                    <div className="space-y-3">
                                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explanation</h5>
                                                        <p className="text-slate-600 font-medium leading-relaxed">{clause.explanation}</p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Text Snippet</h5>
                                                        <div className="p-6 rounded-xl bg-white border border-slate-200 text-slate-500 text-sm font-mono leading-relaxed italic">
                                                            "{clause.textSnippet}"
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recommendation Banner */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mt-12 p-8 bg-tclens-600 rounded-card flex flex-col md:flex-row items-center gap-8 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
                            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                                <Sparkles className="w-8 h-8 text-tclens-200" />
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h4 className="text-xl font-bold">Want professional summaries?</h4>
                                <p className="text-tclens-100 text-sm font-medium">Create a free account to save this report and get deep law explanations.</p>
                            </div>
                            <Button className="bg-white text-tclens-600 hover:bg-white/90 rounded-xl font-bold" asChild>
                                <Link href="/signup">Sign Up Now</Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
