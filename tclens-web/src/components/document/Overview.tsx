"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Zap,
    FileText,
    ArrowRight,
    Search,
    BrainCircuit,
    Plus,
    Sparkles,
    Clock,
    Globe,
    History as HistoryIcon
} from 'lucide-react';

interface OverviewProps {
    user: any;
    history: any[];
    onAnalyze: () => void;
    onGenerate: () => void;
    loadHistoryRecord: (record: any) => void;
}

export const Overview: React.FC<OverviewProps> = ({
    user,
    history,
    onAnalyze,
    onGenerate,
    loadHistoryRecord
}) => {
    // Mock stats
    const stats = [
        { label: "Analyses", value: history.length, icon: BrainCircuit, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Documents", value: "12", icon: FileText, color: "text-tclens-500", bg: "bg-tclens-50" },
        { label: "Health Score", value: "84%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action buttons and stats below */}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 group hover:border-tclens-500/30 transition-all duration-500">
                        <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
                        </div>
                        <div className="space-y-0.5 text-center md:text-left">
                            <p className="text-[8px] md:text-[10px] font-bold text-[var(--label-color)] capitalize tracking-wider md:tracking-widest">{stat.label}</p>
                            <p className="text-sm md:text-xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Analyze Card */}
                <div className="bg-slate-900 rounded-xl p-6 md:p-8 relative overflow-hidden group cursor-pointer" onClick={onAnalyze}>
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-tclens-500/10 rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32 blur-2xl md:blur-3xl group-hover:scale-125 transition-transform duration-700" />

                    <div className="relative z-10 space-y-4 md:space-y-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                            <Search className="w-5 h-5 md:w-7 md:h-7 text-tclens-400" />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Intelligence Analysis</h3>
                            <p className="text-slate-400 text-[11px] md:text-xs leading-snug md:leading-relaxed max-w-xs">
                                Upload contracts or paste clauses to identify risks and compliance gaps instantly.
                            </p>
                        </div>
                        <Button className="h-9 md:h-10 px-5 md:px-6 rounded-lg bg-tclens-500 hover:bg-tclens-600 text-white font-bold text-[10px] md:text-xs gap-2 group-hover:pl-8 transition-all">
                            Start Analysis
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Generate Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 relative overflow-hidden group cursor-pointer" onClick={onGenerate}>
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-tclens-500/5 rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32 blur-2xl md:blur-3xl group-hover:scale-125 transition-transform duration-700" />

                    <div className="relative z-10 space-y-4 md:space-y-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-tclens-50 rounded-lg md:rounded-xl flex items-center justify-center border border-tclens-100">
                            <FileText className="w-5 h-5 md:w-7 md:h-7 text-tclens-500" />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Precision Generation</h3>
                            <p className="text-slate-500 text-[11px] md:text-xs leading-snug md:leading-relaxed max-w-xs">
                                Orchestrate legally binding agreements and localized documents with AI precision.
                            </p>
                        </div>
                        <Button className="h-9 md:h-10 px-5 md:px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] md:text-xs gap-2 group-hover:pl-8 transition-all">
                            New Document
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-6 pt-6 pb-20">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-tclens-500 rounded-full" />
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                    </div>
                    <Button variant="ghost" className="text-xs font-bold text-slate-400 hover:text-tclens-600 hover:bg-tclens-50 rounded-lg h-8">
                        View Archive Hub
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.slice(0, 3).map((record) => (
                        <div
                            key={record.id}
                            onClick={() => loadHistoryRecord(record)}
                            className="bg-white rounded-xl border border-slate-100 p-5 hover:border-tclens-500/50 hover:shadow-xl hover:shadow-slate-100/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-tclens-50 transition-colors">
                                    <Clock className="w-4 h-4 text-slate-400 group-hover:text-tclens-500" />
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    record.risk_score > 75 ? "bg-red-50 text-red-600 border-red-100" : "bg-tclens-50 text-tclens-600 border-tclens-100"
                                )}>
                                    Score: {record.risk_score}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-tclens-600 transition-colors">{record.sourceName}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {record.jurisdiction}</span>
                                    <span>•</span>
                                    <span>{new Date(record.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-12 col-span-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <HistoryIcon className="w-8 h-8 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">No Intelligence Records</p>
                                <p className="text-xs text-slate-500">Your analysis history will appear here once you begin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
