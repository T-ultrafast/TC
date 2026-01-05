'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-red-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-emerald-500';
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/upload')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-legal-navy font-outfit">Analysis Results</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Risk Score:</span>
                        <span className={`text-2xl font-bold ${getScoreColor(result.riskScore)}`}>
                            {result.riskScore}/100
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Top Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Executive Summary */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-legal-navy mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Executive Summary
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            {result.summary}
                        </p>
                    </div>

                    {/* Critical Alerts */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-legal-navy mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Critical Alerts
                        </h2>
                        <div className="space-y-3">
                            {((result.redFlags ?? result.criticalAlerts) || []).length > 0 ? (
                                ((result.redFlags ?? result.criticalAlerts) || []).map((alert, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                                        <p className="text-xs font-bold text-red-700 uppercase mb-1">{alert.title}</p>
                                        <p className="text-sm text-slate-800">{alert.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 bg-emerald-50 rounded-lg flex items-center gap-3 text-emerald-700">
                                    <CheckCircle className="w-5 h-5" />
                                    <p className="text-sm font-medium">No critical issues found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Clause Analysis */}
                <div>
                    <h2 className="text-2xl font-bold text-legal-navy mb-6 font-outfit">Detailed Clause Analysis</h2>
                    <div className="space-y-4">
                        {(result.clauses ?? []).map((clause, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                                <div
                                    className="p-6 cursor-pointer flex items-start justify-between gap-4"
                                    onClick={() => setExpandedClause(expandedClause === idx ? null : idx)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getRiskColor(clause.riskLevel)}`}>
                                                {clause.riskLevel} Risk
                                            </span>
                                            <h3 className="text-lg font-bold text-legal-navy">{clause.type}</h3>
                                        </div>
                                        <p className="text-slate-600">{clause.summary}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-slate-400">
                                        {expandedClause === idx ? <ChevronUp /> : <ChevronDown />}
                                    </Button>
                                </div>

                                {expandedClause === idx && (
                                    <div className="px-6 pb-6 pt-0 bg-slate-50/50 border-t border-slate-100">
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Why it matters</h4>
                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                    {clause.explanation}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Text</h4>
                                                <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 border border-slate-200">
                                                    {clause.textSnippet}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-legal-navy rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Need a Professional Opinion?</h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                        Our AI provides a great starting point, but nothing replaces a licensed attorney. Connect with an expert for a full review.
                    </p>
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8">
                        Find a Lawyer
                    </Button>
                </div>

            </div>
        </main>
    );
}
