"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FileText, Search, ShieldCheck, Zap, AlertCircle, CheckCircle2, Loader2, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

export function AiWorkflowAnimation() {
    const [stage, setStage] = useState(0); // 0: Enter, 1: Scan, 2: Transform, 3: Success

    // Interactive Mouse Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 100, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const rect = document.getElementById("ai-animation-container")?.getBoundingClientRect();
            if (rect) {
                mouseX.set(e.clientX - (rect.left + rect.width / 2));
                mouseY.set(e.clientY - (rect.top + rect.height / 2));
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStage((prev) => (prev + 1) % 4);
        }, 4000); // Slightly slower for readability
        return () => clearInterval(interval);
    }, []);

    const getStageLabel = () => {
        switch (stage) {
            case 0: return "Receiving Document...";
            case 1: return "Extracting Clauses...";
            case 2: return "Analyzing Risk Patterns...";
            case 3: return "Analysis Complete";
            default: return "";
        }
    };

    return (
        <motion.div
            id="ai-animation-container"
            style={{ rotateX, rotateY, perspective: 1000 }}
            className="relative w-full h-[450px] md:h-[500px] flex flex-col items-center justify-center overflow-visible"
        >
            {/* Stage Label Indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm transition-all duration-500">
                {stage < 3 ? (
                    <Loader2 className="w-3 h-3 text-tclens-500 animate-spin" />
                ) : (
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                )}
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest min-w-[140px] text-center">
                    {getStageLabel()}
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-48 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${(stage + 1) * 25}%` }}
                    className="h-full bg-tclens-500"
                />
            </div>
            <AnimatePresence mode="wait">
                {/* Stage 0 & 1: The Messy Document */}
                {(stage === 0 || stage === 1) && (
                    <motion.div
                        key="document"
                        initial={{ opacity: 0, scale: 0.8, y: 50, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                        transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        className="relative z-10 w-48 h-64 bg-white rounded-xl border-2 border-slate-200 p-6 flex flex-col gap-4 shadow-sm mx-auto"
                    >
                        <div className="flex justify-between items-center opacity-30">
                            <div className="w-12 h-2 bg-slate-300 rounded" />
                            <div className="w-4 h-4 rounded-full bg-slate-200" />
                        </div>
                        <div className="space-y-4 pt-4">
                            <motion.div
                                animate={stage === 1 ? { backgroundPosition: ["0% 0%", "100% 100%"] } : {}}
                                className="w-full h-1 bg-slate-100 rounded"
                            />
                            {/* Represents messy text */}
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="h-1.5 bg-slate-100 rounded flex-1" style={{ width: `${Math.random() * 50 + 50}%` }} />
                                    <div className="h-1.5 bg-slate-50 rounded w-8" />
                                </div>
                            ))}
                        </div>

                        {/* Scanning Laser Bar */}
                        {stage === 1 && (
                            <motion.div
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                className="absolute left-0 right-0 h-1 bg-tclens-500 shadow-[0_0_15px_rgba(14,165,233,0.8)] z-20"
                            />
                        )}

                        <div className="absolute inset-0 bg-tclens-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                )}

                {/* Stage 2 & 3: Clean UI Cards Out */}
                {(stage === 2 || stage === 3) && (
                    <motion.div
                        key="analysis"
                        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 space-y-4"
                    >
                        {/* Main Score Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white p-6 rounded-2xl border border-slate-100 w-full max-w-[280px] flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Liability Patterns</div>
                                <div className="text-xl font-black text-slate-900 leading-none">Low Risk (94%)</div>
                            </div>
                        </motion.div>

                        {/* Clause Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: -30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white p-4 rounded-xl border border-slate-100 w-full max-w-[240px] flex items-center gap-3 md:self-start md:ml-4 mx-auto shadow-sm"
                        >
                            <div className="w-8 h-8 bg-tclens-50 rounded-lg flex items-center justify-center text-tclens-500 border border-tclens-100">
                                <Search className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[9px] font-bold text-tclens-600 uppercase tracking-tight mb-1">Termination Clause</div>
                                <div className="h-1.5 w-full bg-slate-100 rounded" />
                            </div>
                        </motion.div>

                        {/* Clause Card 2 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-slate-900 p-4 rounded-xl border border-white/10 w-full max-w-[240px] flex items-center gap-3 md:self-end md:mr-4 mx-auto shadow-sm"
                        >
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/5">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">AI Recommendation</div>
                                <div className="h-1.5 w-full bg-white/10 rounded" />
                            </div>
                        </motion.div>

                        {/* Success Indicator */}
                        {stage === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-4 shadow-2xl border-4 border-emerald-50"
                            >
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Floating particles */}
            {stage >= 2 && (
                <div className="absolute inset-0 pointer-events-none">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0, 0.5, 0],
                                y: [-20, -100],
                                x: Math.sin(i) * 50
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeOut"
                            }}
                            className="absolute bottom-20 left-1/2 w-1.5 h-1.5 bg-tclens-200 rounded-full"
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
