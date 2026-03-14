"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
    return (
        <footer className="bg-slate-50 py-16 px-6 border-t border-slate-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">
                <div className="space-y-4">
                    <Logo />
                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[240px]">
                        Helping professionals navigate legal documents with clarity and confidence.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Product</h4>
                    <ul className="space-y-3 text-xs font-medium text-slate-500">
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">How it works</Link></li>
                        <li><Link href="/pricing" className="hover:text-tclens-500 transition-colors">Pricing</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Company</h4>
                    <ul className="space-y-3 text-xs font-medium text-slate-500">
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">About us</Link></li>
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">Careers</Link></li>
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Support</h4>
                    <ul className="space-y-3 text-xs font-medium text-slate-500">
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">Documentation</Link></li>
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">Security</Link></li>
                        <li><Link href="#" className="hover:text-tclens-500 transition-colors">Legal</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} TCLens. All rights reserved.</p>
                <div className="flex gap-8">
                    <Link href="#" className="hover:text-slate-600 transition-colors">Privacy policy</Link>
                    <Link href="#" className="hover:text-slate-600 transition-colors">Terms of service</Link>
                </div>
            </div>
        </footer>
    );
}
