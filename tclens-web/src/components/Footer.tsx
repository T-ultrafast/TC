"use client";

import Link from "next/link";
import { Shield, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-navy-950 text-white/40 py-24 px-6 border-t border-white/5 font-medium">
            <div className="max-w-7xl mx-auto space-y-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                <Shield className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="text-2xl font-black text-white font-jakarta tracking-tight">TC<span className="text-emerald-500">Lens</span></span>
                        </div>
                        <p className="text-lg leading-relaxed max-w-sm font-medium">
                            Redefining legal transparency with elite-level AI analysis for every consumer and business.
                        </p>
                        <div className="flex gap-5">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <Link key={i} href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-navy-950 hover:border-emerald-500 transition-all group">
                                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-10 font-jakarta">Product</h4>
                        <ul className="space-y-5 font-bold text-sm">
                            {["Contract Analysis", "Risk Scoring", "Neural Search", "Enterprise"].map(item => (
                                <li key={item}><Link href="#" className="hover:text-emerald-500 transition-colors">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-10 font-jakarta">Resources</h4>
                        <ul className="space-y-5 font-bold text-sm">
                            {["Documentation", "API Reference", "Browser Extension", "Status"].map(item => (
                                <li key={item}><Link href="#" className="hover:text-emerald-500 transition-colors">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-10 font-jakarta">Legal</h4>
                        <ul className="space-y-5 font-bold text-sm">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"].map(item => (
                                <li key={item}><Link href="#" className="hover:text-emerald-500 transition-colors">{item}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/20">
                    <p>© {new Date().getFullYear()} TCLens Intelligence. All rights reserved.</p>
                    <div className="flex gap-10">
                        <Link href="#" className="hover:text-white transition-colors">ISO 27001</Link>
                        <Link href="#" className="hover:text-white transition-colors">GDPR Compliant</Link>
                        <Link href="#" className="hover:text-white transition-colors">SOC 2 Type II</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
