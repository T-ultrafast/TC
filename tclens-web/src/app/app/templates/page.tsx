"use client";

import {
    LayoutTemplate,
    Search,
    ChevronRight,
    Download,
    FileIcon as FileText,
    Target,
    Zap,
    Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
    { title: "Standard Business", count: 12, icon: Target },
    { title: "Employment", count: 8, icon: Zap },
    { title: "Software & SaaS", count: 15, icon: FileText },
    { title: "Privacy & Data", count: 6, icon: Scale },
];

const templates = [
    { id: 1, name: "Mutual Non-Disclosure Agreement", cat: "Standard Business", difficulty: "Easy" },
    { id: 2, name: "Consulting Services Master Agreement", cat: "Software & SaaS", difficulty: "Medium" },
    { id: 3, name: "Software License Agreement", cat: "Software & SaaS", difficulty: "Hard" },
    { id: 4, name: "Employee Offer Letter Template", cat: "Employment", difficulty: "Easy" },
    { id: 5, name: "GDPR Compliant Privacy Policy", cat: "Privacy & Data", difficulty: "Medium" },
];

export default function TemplatePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-legal-navy font-outfit mb-2">Legal Templates</h1>
                    <p className="text-slate-500">High-quality, lawyer-reviewed templates to jumpstart your legal needs.</p>
                </div>
                <div className="relative md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search templates..." className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-legal-navy" />
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:bg-legal-navy transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                            <cat.icon className="w-6 h-6 text-legal-navy group-hover:text-emerald-400" />
                        </div>
                        <h4 className="font-bold text-legal-navy group-hover:text-white transition-colors">{cat.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-bold tracking-tight uppercase group-hover:text-white/60">{cat.count} Templates</p>
                    </div>
                ))}
            </div>

            {/* Template List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-legal-navy px-2">Featured Templates</h3>
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    {templates.map((t, i) => (
                        <div key={t.id} className={cn(
                            "p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group",
                            i !== templates.length - 1 && "border-bottom border-slate-100"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <LayoutTemplate className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-legal-navy">{t.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.cat}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase",
                                            t.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                                                t.difficulty === "Medium" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {t.difficulty}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl font-bold gap-2 text-slate-500 hover:text-legal-navy hover:bg-slate-100">
                                    <Download className="w-4 h-4" />
                                    Download
                                </Button>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-legal-navy transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
