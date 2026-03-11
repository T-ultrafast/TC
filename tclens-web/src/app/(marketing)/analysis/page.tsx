'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, ArrowLeft, Zap, Target, BarChart3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critical': return 'text-red-400 border-red-400/20 bg-red-400/10';
            case 'High': return 'text-orange-400 border-orange-400/20 bg-orange-400/10';
            case 'Medium': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
            case 'Low': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
            default: return 'text-foreground/40 border-border bg-muted/50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-red-500';
        if (score >= 50) return 'text-blue-500';
        return 'text-emerald-500';
    };

    const getScoreGlow = (score: number) => {
        if (score >= 80) return 'shadow-[0_0_30px_rgba(239,68,68,0.3)]';
        if (score >= 50) return 'shadow-[0_0_30px_rgba(168,85,247,0.3)]';
        return 'shadow-[0_0_30px_rgba(16,185,129,0.3)]';
    };

    return (
        <main className="min-h-screen bg-background pb-24 relative overflow-hidden">
            {/* Background Haze */}
            <div className="bg-haze">
                <div className="haze-gradient-1" />
                <div className="haze-gradient-2" />
            </div>

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6">
                <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/upload')}
                            className="rounded-full border border-border"
                        >
                            <ArrowLeft className="w-5 h-5 text-foreground" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-foreground font-playfair tracking-tight">Intelligence Report</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Neural Analysis Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">Confidence Model</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-3 h-1 rounded-full",
                                            i <= (result.confidence * 5) ? "bg-emerald-500" : "bg-muted/50"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={cn(
                            "px-6 py-2 rounded-2xl border border-border glass-card-glow flex items-center gap-3",
                            getScoreGlow(result.riskScore)
                        )}>
                            <span className="text-xs font-black uppercase tracking-widest text-foreground/50">Risk Index</span>
                            <span className={cn("text-2xl font-black font-playfair", getScoreColor(result.riskScore))}>
                                {result.riskScore}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">

                {/* Hero Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Executive Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass-card-glow p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Shield className="w-32 h-32 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6">
                                <Zap className="w-3 h-3" />
                                Neural Summary
                            </div>
                            <h2 className="text-3xl font-black text-foreground font-playfair mb-6 tracking-tight">Executive Breakdown</h2>
                            <p className="text-foreground/60 text-lg leading-relaxed font-medium">
                                {result.summary}
                            </p>
                        </div>
                    </motion.div>

                    {/* Threat Detection / Risk Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-10 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-foreground font-playfair uppercase tracking-wider">Delta Risks</h2>
                            <Target className="w-5 h-5 text-blue-500" />
                        </div>

                        <div className="space-y-4 flex-1">
                            {result.risk_breakdown?.length ? (
                                result.risk_breakdown.map((risk: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-muted/50 border border-border hover:border-red-500/30 transition-all">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{risk.label}</p>
                                            <span className="text-[10px] font-black text-foreground/30">+{risk.weight}%</span>
                                        </div>
                                        <p className="text-xs text-foreground/60 line-clamp-2 italic font-medium leading-relaxed">{risk.evidence}</p>
                                    </div>
                                ))
                            ) : ((result.redFlags ?? result.criticalAlerts) || []).length > 0 ? (
                                ((result.redFlags ?? result.criticalAlerts) || []).map((alert, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-muted/50 border border-border hover:border-red-500/30 transition-all">
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{alert.title}</p>
                                        <p className="text-xs text-foreground/60 font-medium leading-relaxed">{alert.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">Safe Zone: No Flags</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="flex items-center gap-3 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                                <Lock className="w-3 h-3" />
                                Encrypted Result
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Detailed Clause Analysis */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="w-8 h-8 text-emerald-500" />
                        <h2 className="text-4xl font-black text-foreground font-playfair tracking-tight">Neural Clause Mapping</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {(result.clauses ?? []).map((clause, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.05) }}
                                className={cn(
                                    "glass-card overflow-hidden transition-all duration-300",
                                    expandedClause === idx ? "border-border ring-4 ring-white/5" : "hover:border-border hover:bg-background/[0.04]"
                                )}
                            >
                                <div
                                    className="p-8 cursor-pointer flex items-start justify-between gap-6"
                                    onClick={() => setExpandedClause(expandedClause === idx ? null : idx)}
                                >
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border",
                                                getRiskColor(clause.riskLevel)
                                            )}>
                                                {clause.riskLevel} Severity
                                            </span>
                                            <h3 className="text-xl font-black text-foreground font-playfair">{clause.type}</h3>
                                        </div>
                                        <p className="text-foreground/50 font-medium text-lg leading-relaxed">{clause.summary}</p>
                                    </div>
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border border-border transition-all",
                                        expandedClause === idx ? "bg-background text-foreground" : "bg-muted/50 text-foreground/40"
                                    )}>
                                        {expandedClause === idx ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedClause === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-8 pb-10 pt-4 bg-background/[0.02] border-t border-border">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Neural Intelligence Basis</h4>
                                                        <p className="text-foreground/70 leading-relaxed font-medium">
                                                            {clause.explanation}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Extracted Artifact</h4>
                                                        <div className="p-6 bg-background rounded-2xl border border-border text-xs font-mono text-foreground/40 leading-loose">
                                                            "{clause.textSnippet}"
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer CTA: Professional Expert Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[48px] overflow-hidden glass-card-glow border-blue-500/20 py-20 px-12 text-center"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-500/30">
                            <Info className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground font-playfair tracking-tight">Escalate to Counsel?</h2>
                        <p className="text-foreground/50 text-xl font-medium leading-relaxed">
                            While our Neural Engine is 99% accurate on baseline risks, some edge cases require a human legal expert. Connect with our vetted partners.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-6 justify-center">
                            <Button size="xl" className="bg-background text-foreground hover:bg-muted/50 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                Talk to an Attorney
                            </Button>
                            <Button size="xl" variant="outline" className="border-border hover:border-border">
                                Download Analysis PDF
                            </Button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
