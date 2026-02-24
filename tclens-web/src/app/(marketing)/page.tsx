"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Shield,
    ArrowRight,
    Zap,
    CheckCircle,
    Clock,
    Lock,
    FileText,
    Search,
    Target,
    Eye,
    Github,
    Twitter,
    Linkedin,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <main>
                {/* 1) Hero Section (Lavender/Pink Gradient) */}
                <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                    {/* Background: Soft lavender/pink haze with radial gradient */}
                    <div className="absolute inset-0 -z-10 bg-[#FBFAFF]">
                        <div
                            className="absolute inset-0"
                            style={{
                                background: "radial-gradient(circle at 20% 25%, #F3E8FF 0%, #FBFAFF 45%, #FFFFFF 100%)"
                            }}
                        />
                    </div>

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            {/* Pill Label */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 text-sm font-bold text-slate-600 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                <span>Smart Legal Document Analysis</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl font-bold font-jakarta leading-[1.1] tracking-tight text-slate-900">
                                Actually <span className="text-[#7C3AED]">Understand</span> <br />
                                What You're Agreeing To
                            </h1>

                            {/* Subtext */}
                            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
                                Stop blindly clicking "I Agree." Our AI-powered platform breaks down complex terms and conditions into simple, digestible summaries.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base shadow-lg shadow-slate-900/10 transition-all hover:scale-105" asChild>
                                    <Link href="/signup">
                                        Try it Free
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 border-slate-200 text-slate-700 rounded-xl font-bold text-base bg-white hover:bg-slate-50 transition-all hover:scale-105" asChild>
                                    <Link href="#install-extension" aria-label="Scroll to Install Extension section">Install Extension</Link>
                                </Button>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-6 pt-6 border-t border-slate-200/50">
                                {[
                                    { label: "Documents Analyzed", value: "1M+" },
                                    { label: "Happy Users", value: "500K+" },
                                    { label: "Accuracy Rate", value: "99%" },
                                ].map((stat, i) => (
                                    <div key={stat.label} className={cn("flex flex-col", i !== 0 && "pl-6 border-l border-slate-200/50")}>
                                        <div className="text-2xl font-bold text-slate-900 font-jakarta">{stat.value}</div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative">
                            <div className="relative aspect-[4/5] md:aspect-square bg-slate-100 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
                                <img
                                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2070"
                                    alt="Legal Document Analysis"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2) Features Section (Light Teal Wash) */}
                <section className="py-24 px-6 relative">
                    {/* Background: Soft aqua tint */}
                    <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, #F6FDFF 0%, #E9FBFF 100%)" }} />

                    <div className="max-w-7xl mx-auto">
                        <div className="text-center space-y-4 mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-jakarta tracking-tight">Why Choose Terms Analyzer?</h2>
                            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                                We make legal documents accessible to everyone, not just lawyers.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { title: "AI-Powered Analysis", desc: "Advanced language models trained on millions of legal paragraphs.", icon: Shield, color: "bg-purple-100 text-purple-600" },
                                { title: "Key Points Highlighted", desc: "Never miss critical clauses buried in fine print again.", icon: Target, color: "bg-blue-100 text-blue-600" },
                                { title: "Risk Detection", desc: "Automatically flags predatory terms and unfair conditions.", icon: Eye, color: "bg-red-100 text-red-600" },
                                { title: "Instant Summaries", desc: "Get the gist of a 40-page document in under 30 seconds.", icon: Zap, color: "bg-amber-100 text-amber-600" },
                                { title: "Privacy Focused", desc: "Your documents are encrypted and never used for training.", icon: Lock, color: "bg-emerald-100 text-emerald-600" },
                                { title: "Save Time", desc: "Read minutes, not hours. Reclaim your time and peace of mind.", icon: Clock, color: "bg-indigo-100 text-indigo-600" },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-8 rounded-[1.5rem] border border-slate-100/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-default"
                                >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 font-jakarta">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3) How It Works Section (Warm Cream) */}
                <section className="py-24 px-6 relative">
                    {/* Background: Warm beige/cream wash */}
                    <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, #FFF8ED 0%, #FFF2DE 100%)" }} />

                    <div className="max-w-7xl mx-auto">
                        <div className="text-center space-y-4 mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-jakarta tracking-tight">How It Works</h2>
                            <p className="text-xl text-slate-600 font-medium">Three simple steps to clarity</p>
                        </div>

                        <div className="relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden lg:block absolute top-20 left-0 w-full h-0.5 bg-orange-200/60 -z-10" />

                            <div className="grid lg:grid-cols-3 gap-12">
                                {[
                                    { step: "01", title: "Upload Document", desc: "Simply drag and drop your PDF or paste term text.", icon: FileText },
                                    { step: "02", title: "AI Analysis", desc: "Our engine scans for hidden risks and key variables.", icon: Search },
                                    { step: "03", title: "Get Clear Summary", desc: "Read the bulleted summary and act with confidence.", icon: CheckCircle },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center space-y-6">
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg shadow-orange-900/5 flex items-center justify-center relative group border border-orange-100/50">
                                            {/* Step Badge */}
                                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-[#FFF8ED]">
                                                {item.step}
                                            </div>
                                            <item.icon className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform stroke-[1.5]" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 font-jakarta mb-3">{item.title}</h3>
                                            <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4) CTA Section (Centered Card with Mint Background) */}
                <section className="relative py-24 px-6 overflow-hidden">
                    {/* Soft Mint Background Glow */}
                    <div
                        className="absolute inset-0 -z-10"
                        style={{
                            background: "radial-gradient(circle at 50% 20%, #DFFAF0 0%, #F3FFFA 55%, #FFFFFF 100%)"
                        }}
                    />

                    {/* Centered CTA Card */}
                    <div className="max-w-7xl mx-auto">
                        <div
                            className="relative w-[85%] max-w-[1150px] mx-auto rounded-[64px] overflow-hidden"
                            style={{
                                background: "linear-gradient(90deg, #10B981 0%, #14B8A6 100%)",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                                minHeight: "480px"
                            }}
                        >
                            <div className="flex flex-col items-center justify-center text-center py-24 px-12">
                                {/* Headline */}
                                <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                                    Ready to Stop Clicking <br className="hidden md:block" />
                                    "I Agree" Blindly?
                                </h2>

                                {/* Italic Subtext */}
                                <p className="text-xl md:text-2xl text-white/90 italic font-medium max-w-3xl mb-10">
                                    "Join thousands of users who now actually understand what they're signing up for."
                                </p>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                    <Button
                                        size="lg"
                                        className="h-16 px-12 bg-white text-[#0F8F73] hover:bg-gray-50 rounded-full font-bold text-lg shadow-lg transition-all hover:scale-105"
                                        asChild
                                    >
                                        <Link href="/signup">Get Started Free</Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-16 px-12 border-2 border-white/40 text-white hover:bg-white/10 rounded-full font-bold text-lg transition-all hover:scale-105 bg-transparent"
                                        asChild
                                    >
                                        <Link href="/pricing">View Pricing</Link>
                                    </Button>
                                </div>

                                {/* Small Caps Line */}
                                <p className="text-xs text-white/85 uppercase tracking-widest font-semibold">
                                    NO CREDIT CARD REQUIRED · FREE FOREVER PLAN AVAILABLE
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* 5) Install Extension Section */}
                <section id="install-extension" className="py-24 px-6 relative bg-slate-50 border-t border-slate-200">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-sm font-bold text-teal-700 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Shield className="w-4 h-4" />
                            <span>Browser Extension</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-jakarta tracking-tight mb-6">
                            Install the Chrome Extension
                        </h2>
                        <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                            Automatically detects Terms & Privacy pages and analyzes them instantly as you browse.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Button
                                size="lg"
                                className="h-14 px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-base shadow-lg shadow-blue-900/10 transition-all hover:scale-105 gap-3"
                                disabled
                                aria-label="Install from Chrome Web Store (Coming Soon)"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A7.957 7.957 0 0 1 12 4.001h9.52A12.015 12.015 0 0 0 12 0zm0 24c3.09 0 5.942-1.045 8.144-2.825l-4.17-7.223A7.96 7.96 0 0 1 12 20.001c-3.522 0-6.52-2.356-7.55-5.632l-3.882 1.34A11.996 11.996 0 0 0 12 24zm0-19.999a8 8 0 0 0-3.327.725l-6.073-3.5a11.99 11.99 0 0 1 18.235 8.272h-7.65a8.005 8.005 0 0 0-1.185-5.497z" /></svg>
                                Install from Chrome Web Store
                                <span className="opacity-70 text-xs font-medium ml-1">(Coming Soon)</span>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold text-base transition-all hover:scale-105 gap-2"
                                asChild
                            >
                                <a href="/downloads/terms-analyzer-extension.zip" download aria-label="Download Extension as ZIP file">
                                    <Download className="w-5 h-5 text-slate-500" />
                                    Download Extension (.zip)
                                </a>
                            </Button>
                        </div>

                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                            WORKS ON CHROME, EDGE, BRAVE (CHROMIUM BROWSERS)
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#081427] text-slate-400 py-16 px-6">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
                        <div className="col-span-1 md:col-span-1 space-y-6">
                            <div className="flex items-center gap-2 text-white font-bold text-xl font-jakarta">
                                <Shield className="w-6 h-6 text-teal-500" />
                                <span>Terms Analyzer</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                Making legal agreements transparent and understandable for everyone.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 font-jakarta">Product</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                                <li><Link href="#install-extension" className="hover:text-teal-400 transition-colors">Extension</Link></li>
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">API</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 font-jakarta">Company</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">About</Link></li>
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Blog</Link></li>
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Careers</Link></li>
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 font-jakarta">Legal</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-600">
                        <p>&copy; {new Date().getFullYear()} Terms Analyzer. All rights reserved.</p>
                        <p>Designed with precision.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
