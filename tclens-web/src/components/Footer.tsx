"use client";

import Link from "next/link";
import { FileText, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400 py-24 px-6 border-t border-slate-900">
            <div className="max-w-7xl mx-auto space-y-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black text-white font-outfit tracking-tighter">Terms Analyzer</span>
                        </div>
                        <p className="text-lg leading-relaxed max-w-sm">
                            Making legal documents understandable for everyone. Reclaim your rights today.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                                    <Icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Product</h4>
                        <ul className="space-y-4 font-bold">
                            {["Features", "Pricing", "API", "Browser Extension"].map(item => (
                                <li key={item}><Link href="#" className="hover:text-purple-400">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Company</h4>
                        <ul className="space-y-4 font-bold">
                            {["About Us", "Blog", "Careers", "Contact"].map(item => (
                                <li key={item}><Link href="#" className="hover:text-purple-400">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Legal</h4>
                        <ul className="space-y-4 font-bold">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map(item => (
                                <li key={item}><Link href="#" className="hover:text-purple-400">{item}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] opacity-50">
                    <p>© 2026 Terms Analyzer Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#">System Status</Link>
                        <Link href="#">Security</Link>
                        <Link href="#">Trust</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
