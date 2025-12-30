"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Scale, Search, FileText, CheckCircle, AlertTriangle, ArrowRight, Zap, Target, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(auth.isAuthenticated());
    }, []);

    return (
        <>
            <Navbar />
            <main className="flex min-h-screen flex-col items-center pt-16">
                {/* Hero Section */}
                <section className="relative w-full py-24 md:py-32 px-6 overflow-hidden">
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-blue-50/50 to-emerald-50/50 blur-3xl opacity-50" />
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                            <span>Next-Generation Legal Intelligence</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tight text-legal-navy font-outfit max-w-5xl leading-[1.1]">
                            Don't Just Agree. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-legal-navy via-emerald-600 to-legal-navy bg-[length:200%_auto] animate-gradient">Understand.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
                            Analyze your first 5,000 words for free. TCLens uses advanced AI to decode complex legal jargon into plain English.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold bg-legal-navy hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-legal-navy/10 transform hover:scale-105 transition-all group" asChild>
                                <Link href={isLoggedIn ? "/app/document" : "/signup"}>
                                    {isLoggedIn ? "Open Dashboard" : "Start Analysis"}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-slate-200 hover:bg-slate-50 rounded-2xl transition-all" asChild>
                                {/* FUTURE: Replace with Chrome Web Store link: https://chrome.google.com/webstore/detail/EXTENSION_ID */}
                                <a href="/extensions/tc-reader-extension.zip" download>Download Extension</a>
                            </Button>
                        </div>

                        <div className="pt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale contrast-125">
                            {/* Mock Logos */}
                            <div className="font-outfit text-2xl font-black italic tracking-tighter">TRUSTPILOT</div>
                            <div className="font-outfit text-2xl font-black italic tracking-tighter">LEGALZOOM</div>
                            <div className="font-outfit text-2xl font-black italic tracking-tighter">DOCUSIGN</div>
                            <div className="font-outfit text-2xl font-black italic tracking-tighter">TECHRUNCH</div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="w-full py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-4xl md:text-6xl font-bold font-outfit">
                                    AI Clarity for <br />
                                    <span className="text-emerald-400">Human Rights.</span>
                                </h2>
                                <p className="text-slate-400 text-xl leading-relaxed">
                                    We've built a multi-stage analysis engine that doesn't just scan text—it understands the legal implications for you.
                                </p>

                                <div className="space-y-6 pt-6">
                                    {[
                                        { icon: Search, title: "Deep Scanning", desc: "Our AI identifies over 50 types of legal clauses in seconds." },
                                        { icon: Target, title: "Risk Detection", desc: "Instantly flags unfair terms, automatic renewals, and hidden fees." },
                                        { icon: Lock, title: "Data Protection", desc: "We map exactly what companies are doing with your personal data." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                <item.icon className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                                <p className="text-slate-500">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-xl">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-25" />
                                    <div className="relative bg-slate-800 border border-white/10 p-8 rounded-3xl shadow-2xl">
                                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                                            <div className="h-4 w-1/2 bg-slate-700/50 rounded animate-pulse delay-75" />
                                            <div className="h-32 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center p-4">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-emerald-400 mb-1">85/100</div>
                                                    <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Safety Score</div>
                                                </div>
                                            </div>
                                            <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse delay-150" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Extension Section */}
                <section id="extension" className="w-full py-24 px-6 bg-white relative">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 bg-slate-50 rounded-[2.5rem] p-4 lg:p-8 border border-slate-100 shadow-inner">
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-legal-navy rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <span className="font-bold text-legal-navy">TCLens Extension</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                                        <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                                        <p className="text-sm text-emerald-800 font-medium">Ready! This site's T&Cs are marked as <span className="font-bold underline">Medium Risk</span>.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-100 rounded-full" />
                                        <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-8 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
                                <Shield className="w-4 h-4" />
                                BETA ACCESS
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-legal-navy font-outfit leading-tight">
                                Legal Protection, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">On Every Browser.</span>
                            </h2>
                            <p className="text-slate-600 text-xl leading-relaxed max-w-lg">
                                The TCLens extension works in the background and alerts you the moment you land on a page with predatory terms.
                            </p>
                            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                <Button size="lg" className="h-14 px-8 bg-legal-navy hover:bg-slate-800 rounded-2xl text-lg font-bold" asChild>
                                    <a href="/extensions/tc-reader-extension.zip" download>Download for Chrome</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-32 px-6 flex flex-col items-center text-center">
                    <div className="max-w-4xl space-y-8 p-12 md:p-24 bg-legal-navy rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black font-outfit">
                                Ready to level the <br /> playing field?
                            </h2>
                            <p className="text-slate-300 text-lg max-w-xl mx-auto">
                                Join 20,000+ users who don't sign blindly. Get your first analysis for free today.
                            </p>
                            <div className="pt-4">
                                <Button size="lg" className="h-16 px-12 text-xl font-bold bg-white text-legal-navy hover:bg-slate-100 rounded-2xl shadow-xl shadow-white/5 transform hover:scale-105 transition-all" asChild>
                                    <Link href="/signup">Create Free Account</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
