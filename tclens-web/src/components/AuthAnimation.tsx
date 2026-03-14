"use client";

import { motion } from "framer-motion";
import {
    FileText,
    ShieldCheck,
    Sparkles,
    User,
    Search,
    Cpu,
    CheckCircle2
} from "lucide-react";

interface AuthAnimationProps {
    title: string;
}

export function AuthAnimation({ title }: AuthAnimationProps) {
    // Split title by comma for better layout control
    const titleParts = (title || "").split(',');
    const mainTitle = titleParts[0] || "";
    const highlightedTitle = titleParts[1]?.trim() || "";

    return (
        <div className="relative w-full h-full min-h-[550px] flex flex-col items-center justify-center">
            {/* Ambient Background Glow - Subtly using theme colors */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-tclens-50 rounded-full blur-[100px]"
                />
            </div>

            {/* Central Animation Group */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Visual Identity Section */}
                <div className="relative mb-12 transform scale-110">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        {/* Character Bust - Using Brand Colors */}
                        <div className="w-24 h-24 bg-white rounded-full border border-tclens-100 flex items-center justify-center shadow-xl shadow-tclens-500/5 relative overflow-hidden">
                            <User className="w-12 h-12 text-tclens-500 opacity-90" />

                            {/* Scanning Laser Line */}
                            <motion.div
                                animate={{ y: [-40, 40, -40] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-0.5 bg-tclens-500 shadow-[0_0_10px_#0ea5e9]"
                            />
                        </div>

                        {/* Rotating Orbital Halo */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-x-[-18px] inset-y-[-18px] border-2 border-dashed border-tclens-200/40 rounded-full"
                        />
                    </motion.div>

                    {/* Floating Document Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] pointer-events-none">
                        {[
                            { icon: FileText, color: "text-tclens-500", delay: 0, x: -95, y: -55 },
                            { icon: ShieldCheck, color: "text-tclens-600", delay: 1, x: 95, y: -45 },
                            { icon: Sparkles, color: "text-amber-500", delay: 2, x: 80, y: 75 },
                            { icon: Search, color: "text-tclens-400", delay: 1.5, x: -80, y: 85 },
                            { icon: Cpu, color: "text-tclens-800", delay: 0.5, x: 0, y: -110 },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: item.x,
                                    y: item.y,
                                    transition: { delay: item.delay, duration: 0.6 }
                                }}
                            >
                                <motion.div
                                    animate={{
                                        y: [0, -12, 0],
                                        rotate: [-5, 5, -5]
                                    }}
                                    transition={{
                                        duration: 4 + i,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.2
                                    }}
                                    className="w-10 h-10 bg-white rounded-xl border border-tclens-100 flex items-center justify-center shadow-lg shadow-tclens-500/5 group"
                                >
                                    <item.icon className={`w-5 h-5 ${item.color}`} />

                                    {/* Connection Line to Center */}
                                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-10">
                                        <line
                                            x1="20" y1="20"
                                            x2={-item.x + 20} y2={-item.y + 20}
                                            stroke="currentColor"
                                            className="text-tclens-500"
                                            strokeWidth="1.5"
                                            strokeDasharray="4 4"
                                        />
                                    </svg>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Integrated Heading - Smaller & Themed */}
                <div className="text-center mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-1"
                    >
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                            {mainTitle},
                        </h1>
                        <span className="text-2xl font-bold bg-gradient-to-r from-tclens-500 to-tclens-700 bg-clip-text text-transparent">
                            {highlightedTitle}
                        </span>
                    </motion.div>

                    {/* Subtle Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-6 flex items-center justify-center gap-4 opacity-40 px-4 py-1.5 rounded-full border border-slate-100"
                    >
                        <div className="flex items-center gap-1.5 grayscale">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Enterprise Grade</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Ambient Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-tclens-200 rounded-full"
                        initial={{
                            x: Math.random() * 500,
                            y: Math.random() * 500,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, -120],
                            opacity: [0, 0.4, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
