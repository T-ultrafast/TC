"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    FileText,
    ArrowUpRight,
    Globe,
    Calendar,
    LinkIcon,
    Upload,
    TypeIcon,
    Search
} from 'lucide-react';

interface HistoryRecord {
    id: string;
    sourceName: string;
    risk_score: number;
    inputType: string;
    jurisdiction: string;
    created_at: string;
}

interface AnalysisHistoryProps {
    history: HistoryRecord[];
    loadHistoryRecord: (record: HistoryRecord) => void;
    setShowHistory: (show: boolean) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
    history,
    loadHistoryRecord,
    setShowHistory
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-8 lg:col-span-12 pb-20">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Archive</h3>
                    <p className="text-xs text-slate-400 font-medium">Repository of previously analyzed legal frameworks</p>
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-slate-200/50">
                    {history.length} Profiles Generated
                </div>
            </div>

            {history.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-32 text-center border border-dashed border-slate-200 space-y-8 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center shadow-inner">
                        <FileText className="w-12 h-12 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-bold text-slate-300">Archive Void</p>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">Commence your first analysis to populate this tactical intelligence hub.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowHistory(false)}
                        className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {history.map((record) => (
                        <div
                            key={record.id}
                            onClick={() => loadHistoryRecord(record)}
                            className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:border-tclens-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all cursor-pointer flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-tclens-50 transition-colors">
                                    {record.inputType === 'link' ? <LinkIcon className="w-6 h-6 text-slate-400 group-hover:text-tclens-500" /> : record.inputType === 'upload' ? <Upload className="w-6 h-6 text-slate-400 group-hover:text-tclens-500" /> : <TypeIcon className="w-6 h-6 text-slate-400 group-hover:text-tclens-500" />}
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                    record.risk_score > 75 ? "bg-red-50 text-red-600 border-red-100" :
                                        record.risk_score > 40 ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-tclens-50 text-tclens-600 border-tclens-100"
                                )}>
                                    Score: {record.risk_score}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-tclens-600 transition-colors line-clamp-1">{record.sourceName}</h4>
                                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {record.jurisdiction}</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(record.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Profile</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-tclens-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-auto" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
