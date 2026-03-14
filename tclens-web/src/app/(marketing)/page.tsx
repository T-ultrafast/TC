"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Search,
    BrainCircuit,
    Lock,
    Clock,
    Shield,
    Star,
    Sparkles,
    CheckCircle2,
    Users
} from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { AiWorkflowAnimation } from "@/components/AiWorkflowAnimation";
import { InteractiveWorkflowDemo } from "@/components/InteractiveWorkflowDemo";
import { Footer } from "@/components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden pt-12 relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
                <h1 className="bg-text-outline uppercase opacity-20">Tc Lens</h1>
                <div className="orb-1 top-40 -right-20" />
                <div className="orb-2 bottom-40 -left-20" />
            </div>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative px-6 py-12 md:py-20 lg:py-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight"
                            >
                                Analyze Anywhere, <br />
                                <span className="text-tclens-500">Empower</span> Your Future
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-base text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                            >
                                Join thousands of professionals gaining instant clarity on complex contracts and legal documents—one clause at a time. No jargon, just insights.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
                            >
                                <Button size="lg" className="h-14 px-10 bg-tclens-500 hover:bg-tclens-600 text-white rounded-card font-bold text-lg group" asChild>
                                    <Link href="/signup">
                                        Get Started Free
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* AI Workflow Animation */}
                        <div className="flex-1 relative lg:-mt-8 overflow-visible">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative z-10 w-full max-w-[380px] mx-auto"
                            >
                                <AiWorkflowAnimation />
                            </motion.div>
                        </div>
                    </div>
                </section>



                {/* Features Section */}
                <section id="features" className="py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-3xl mx-auto mb-12 space-y-4"
                        >
                            <h2 className="text-sm font-bold text-tclens-500 uppercase tracking-widest">Built for humans</h2>
                            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-950">Professional insights, no law degree required.</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">We simplify complex legal terms into actionable insights you can actually use.</p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {[
                                {
                                    icon: <Search className="w-6 h-6" />,
                                    title: "Smart Scanning",
                                    desc: "Quickly scan any document to find key clauses, missing terms, and potential obligations."
                                },
                                {
                                    icon: <Shield className="w-6 h-6" />,
                                    title: "Risk Scoring",
                                    desc: "Get an instant risk level for your contract based on industry standards and common pitfalls."
                                },
                                {
                                    icon: <BrainCircuit className="w-6 h-6" />,
                                    title: "Natural Insights",
                                    desc: "Ask questions about your document in plain English and get clear, jargon-free answers."
                                },
                                {
                                    icon: <Clock className="w-6 h-6" />,
                                    title: "Time Saved",
                                    desc: "Reduce review time from hours to minutes without sacrificing accuracy or detail."
                                },
                                {
                                    icon: <Lock className="w-6 h-6" />,
                                    title: "Bank-Grade Security",
                                    desc: "Your data is ours to protect. We follow strict zero-retention policies for all analysis."
                                },
                                {
                                    icon: <Users className="w-6 h-6" />,
                                    title: "Professional Standards",
                                    desc: "Trusted by legal teams and freelancers alike for consistent, high-quality analysis."
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="p-8 rounded-card bg-slate-50 border border-slate-100 hover:border-tclens-200 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-tclens-500 border border-slate-100 mb-6 group-hover:bg-tclens-500 group-hover:text-white transition-all">
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h4>
                                    <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section id="workflow" className="py-32 px-6 bg-slate-50 text-slate-900 rounded-card mx-4 mb-20 border border-slate-100">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex-1 space-y-10"
                        >
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-tclens-500 uppercase tracking-widest">How it works</h2>
                                <h3 className="text-2xl md:text-5xl font-extrabold leading-tight text-slate-950">Simplify Your Workflow in Seconds</h3>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { step: 1, title: "Upload your file", desc: "Drag and drop any contract or document. We support PDF, DOCX, and more." },
                                    { step: 2, title: "AI Magic", desc: "Our engine scans every word, comparing it against thousands of legal standards." },
                                    { step: 3, title: "Get Clarity", desc: "Review your summary, risk level, and ask follow-up questions for complete clarity." }
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * (i + 1) }}
                                        className="flex gap-6 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-950 font-black text-lg group-hover:bg-tclens-500 group-hover:text-white transition-all shrink-0">
                                            {step.step}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-bold text-slate-900">{step.title}</h4>
                                            <p className="text-slate-500 leading-relaxed text-sm font-medium">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex-1 w-full"
                        >
                            <InteractiveWorkflowDemo />
                        </motion.div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto space-y-10"
                    >
                        <div className="w-20 h-20 bg-tclens-50 rounded-xl flex items-center justify-center mx-auto mb-8 border border-tclens-100">
                            <CheckCircle2 className="w-10 h-10 text-tclens-500" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                            Ready to take <br /> <span className="text-tclens-500">control</span> of your future?
                        </h2>
                        <p className="text-xl text-slate-600">
                            Join thousands of users who have already simplified their legal document review process.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                            <Button size="lg" className="h-16 px-12 bg-tclens-500 hover:bg-tclens-600 text-white rounded-card font-bold text-xl transition-all" asChild>
                                <Link href="/signup">Start Free Now</Link>
                            </Button>
                        </div>
                    </motion.div>
                </section>


                <Footer />
            </main>
        </div>
    );
}
