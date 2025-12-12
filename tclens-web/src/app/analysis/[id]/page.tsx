"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Shield, CheckCircle, AlertOctagon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/ai-service";

interface AnalysisData {
    id: string;
    fileName: string;
    text: string;
    analysis: AnalysisResult;
}

export default function AnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const storedData = localStorage.getItem(`analysis-${id}`);

        if (storedData) {
            setData(JSON.parse(storedData));
        } else {
            // In a real app, fetch from API/DB
            console.error("Analysis not found");
        }
        setLoading(false);
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-navy"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <h1 className="text-2xl font-bold text-legal-navy">Analysis Not Found</h1>
                <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </div>
        );
    }

    const getRiskColor = (score: number) => {
        if (score <= 20) return "bg-emerald-500";
        if (score <= 50) return "bg-blue-500";
        if (score <= 75) return "bg-amber-500";
        return "bg-red-500";
    };

    const getRiskLabel = (score: number) => {
        if (score <= 20) return "Very Safe";
        if (score <= 50) return "Standard";
        if (score <= 75) return "Risky";
        return "Dangerous";
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-legal-navy text-lg flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            {data.fileName}
                        </h1>
                        <p className="text-xs text-slate-500">AI Analysis Report</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                        <div className={cn("w-3 h-3 rounded-full", getRiskColor(data.analysis.riskScore))} />
                        <span className="font-bold text-legal-navy">{data.analysis.riskScore}/100</span>
                        <span className="text-sm text-slate-500">({getRiskLabel(data.analysis.riskScore)})</span>
                    </div>
                    <Button variant="premium">Consult a Lawyer</Button>
                </div>
            </header>

            {/* Main Content - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Document Text */}
                <div className="flex-1 overflow-y-auto p-8 border-r border-slate-200 bg-white">
                    <div className="max-w-3xl mx-auto font-serif text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {data.text}
                    </div>
                </div>

                {/* Right Panel: Analysis */}
                <div className="w-[450px] overflow-y-auto bg-slate-50 p-6 shrink-0">
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-legal-navy mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                Executive Summary
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {data.analysis.summary}
                            </p>
                        </div>

                        {/* Clauses List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-legal-navy text-sm uppercase tracking-wider text-slate-500">
                                Key Clauses & Risks
                            </h3>

                            {data.analysis.clauses.map((clause, idx) => (
                                <div key={idx} className={cn(
                                    "bg-white p-4 rounded-xl shadow-sm border transition-all hover:shadow-md",
                                    clause.riskLevel === "critical" ? "border-red-200 bg-red-50/30" :
                                        clause.riskLevel === "high" ? "border-amber-200 bg-amber-50/30" :
                                            "border-slate-200"
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-full uppercase",
                                            clause.riskLevel === "critical" ? "bg-red-100 text-red-700" :
                                                clause.riskLevel === "high" ? "bg-amber-100 text-amber-700" :
                                                    clause.riskLevel === "medium" ? "bg-blue-100 text-blue-700" :
                                                        "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {clause.type}
                                        </span>
                                        {clause.riskLevel === "critical" && <AlertOctagon className="w-4 h-4 text-red-500" />}
                                        {clause.riskLevel === "high" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                    </div>

                                    <p className="text-sm font-medium text-legal-navy mb-2">
                                        {clause.explanation}
                                    </p>

                                    <div className="bg-slate-100 p-2 rounded text-xs text-slate-600 font-mono mb-2 border-l-2 border-slate-300">
                                        "{clause.text.slice(0, 150)}..."
                                    </div>

                                    {clause.recommendation && (
                                        <div className="flex gap-2 items-start mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                                            <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                            <span>{clause.recommendation}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
