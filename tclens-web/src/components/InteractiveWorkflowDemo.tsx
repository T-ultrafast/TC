"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    MessageSquare,
    ShieldAlert,
    CheckCircle2,
    ChevronRight,
    Zap,
    MousePointer2,
    Eye
} from "lucide-react";
import { useState, useEffect } from "react";

export function InteractiveWorkflowDemo() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full relative group">
            {/* Browser Header / Container */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                    </div>
                    <div className="flex-1 max-w-sm h-6 bg-white rounded-md border border-slate-200 flex items-center px-3 gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">app.tclens.io/analysis</div>
                    </div>
                </div>

                <div className="aspect-[16/10] bg-slate-50 p-6 flex gap-6 overflow-hidden relative">
                    {/* Left: Document View */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-tclens-50 rounded-lg text-tclens-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-900 leading-none">Employment_Agreement.pdf</div>
                                <div className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">14 Pages • 2.4MB</div>
                            </div>
                        </div>

                        {/* Document Content Simulation */}
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="relative group/line">
                                    <div className="space-y-2">
                                        <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                                        <div className="h-1.5 bg-slate-50 rounded-full w-[90%]" />
                                    </div>

                                    {/* AI Highlight Layer */}
                                    <AnimatePresence>
                                        {((activeStep === 1 && (i === 3 || i === 5)) || (activeStep === 2 && i === 3)) && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "100%", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="absolute inset-x-0 -inset-y-1 bg-tclens-500/10 border-l-2 border-tclens-500 z-10"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Floating Cursor Simulation */}
                        <motion.div
                            animate={activeStep === 0 ? {
                                x: [20, 100, 20],
                                y: [20, 80, 20],
                            } : activeStep === 1 ? {
                                x: [20, 150, 150],
                                y: [20, 150, 150],
                            } : {
                                x: [150, 30, 30],
                                y: [150, 50, 50],
                            }}
                            className="absolute z-20 pointer-events-none"
                        >
                            <MousePointer2 className="w-4 h-4 text-slate-950 fill-white" />
                        </motion.div>
                    </div>

                    {/* Right: AI Panel */}
                    <div className="w-56 space-y-4 relative">
                        <AnimatePresence mode="wait">
                            {activeStep === 0 && (
                                <motion.div
                                    key="step0"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-tclens-50 rounded-full flex items-center justify-center text-tclens-500 border border-tclens-100">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-900 mb-1">Ready to Scan</div>
                                        <div className="text-[9px] text-slate-400 leading-relaxed font-medium">Click analyze to begin extraction</div>
                                    </div>
                                    <div className="mt-4 px-4 py-2 bg-tclens-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest animate-pulse">
                                        Analyze File
                                    </div>
                                </motion.div>
                            )}

                            {activeStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-1 space-y-4 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <div className="text-[9px] font-black text-slate-950 uppercase tracking-tight">Active Analysis</div>
                                    </div>

                                    <div className="space-y-3">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-2.5 bg-amber-50 rounded-lg border border-amber-100"
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <ShieldAlert className="w-2.5 h-2.5 text-amber-500" />
                                                <div className="text-[8px] font-bold text-amber-700 uppercase">Non-Compete Detected</div>
                                            </div>
                                            <div className="h-1 w-full bg-amber-200/30 rounded" />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-2.5 bg-tclens-50 rounded-lg border border-tclens-100 flex flex-col gap-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-2.5 h-2.5 text-tclens-500" />
                                                <div className="text-[8px] font-bold text-tclens-700 uppercase">Scanning Clauses...</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="h-1 bg-tclens-200 rounded w-1/3 animate-pulse" />
                                                <div className="h-1 bg-tclens-200 rounded w-1/3 animate-pulse delay-75" />
                                                <div className="h-1 bg-tclens-200 rounded w-1/3 animate-pulse delay-150" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}

                            {activeStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-slate-900 p-4 rounded-xl shadow-lg border border-white/5 flex-1 relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                        <div className="text-[9px] font-black text-white uppercase tracking-tight">AI Summary</div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                <MessageSquare className="w-3 h-3 text-tclens-400" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="h-1 w-16 bg-white/40 rounded" />
                                                <div className="h-1 w-24 bg-white/10 rounded" />
                                                <div className="h-1 w-20 bg-white/10 rounded" />
                                            </div>
                                        </div>

                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                <div className="text-[9px] font-bold text-emerald-400">Risk Cleared</div>
                                            </div>
                                            <div className="text-[8px] text-emerald-100/60 leading-relaxed font-medium italic">"Clause 4.2 complies with local labor standards."</div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 h-8 bg-tclens-500 rounded-lg flex items-center justify-center gap-2">
                                        <div className="text-[9px] font-bold text-white uppercase tracking-widest">Share Report</div>
                                        <ChevronRight className="w-3 h-3 text-white" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Background Visuals */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] z-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-tclens-100 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-[100px]" />
                    </div>
                </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center z-10 group-hover:-translate-y-2 transition-transform duration-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center z-10 group-hover:translate-y-2 transition-transform duration-500 delay-75">
                <Zap className="w-6 h-6 text-amber-500" />
            </div>
        </div>
    );
}
