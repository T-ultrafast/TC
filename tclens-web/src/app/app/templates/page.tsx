"use client";

import { useState } from "react";
import {
    LayoutTemplate,
    Search,
    ChevronDown,
    ChevronUp,
    Download,
    FileIcon as FileText,
    Target,
    Zap,
    Scale,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
    { title: "Standard Business", count: 12, icon: Target },
    { title: "Employment", count: 8, icon: Zap },
    { title: "Software & SaaS", count: 15, icon: FileText },
    { title: "Privacy & Data", count: 6, icon: Scale },
];

const templates = [
    {
        id: 1,
        name: "Mutual Non-Disclosure Agreement",
        cat: "Standard Business",
        difficulty: "Easy",
        length: "2-3 pages",
        includes: ["Confidentiality", "Exclusions", "Term", "Remedies"],
        bestFor: "Startups, Contractors, Partnerships",
        sampleText: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into on [Date] (the "Effective Date") by and between:

[Party A Name], a [State] corporation with its principal place of business at [Address] ("Party A"), and
[Party B Name], a [State] corporation with its principal place of business at [Address] ("Party B").

1. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public proprietary or confidential information specifically marked or identified as "Confidential" or which should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. The Receiving Party shall restrict access to Confidential Information to employees, contractors, and agents who have a need to know and are bound by confidentiality obligations.

3. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
Confidential Information shall not include information that: (a) is or becomes publicly known through no act of the Receiving Party; (b) was in the Receiving Party's possession prior to disclosure; or (c) is independently developed by the Receiving Party without use of or reference to the Confidential Information.`
    },
    {
        id: 2,
        name: "Consulting Services Master Agreement",
        cat: "Software & SaaS",
        difficulty: "Medium",
        length: "4-6 pages",
        includes: ["Scope of Services", "Payment Terms", "IP Ownership", "Termination"],
        bestFor: "Agencies, Freelancers, Consultants",
        sampleText: `MASTER SERVICES AGREEMENT

This Master Services Agreement (the "Agreement") is made effective as of [Date], by and between [Client Name] ("Client") and [Consultant Name] ("Provider").

1. SCOPE OF SERVICES
Provider agrees to perform the services described in one or more Statements of Work ("SOW") attached hereto (the "Services"). In the event of a conflict between this Agreement and any SOW, the terms of the SOW shall govern.

2. COMPENSATION AND PAYMENT
Client shall pay Provider the fees set forth in the applicable SOW. Unless otherwise stated in an SOW, Provider will invoice Client monthly, and payment is due within thirty (30) days of the invoice date. Late payments shall incur interest at the rate of 1.5% per month.

3. INTELLECTUAL PROPERTY RIGHTS
Upon full payment of all fees due, Provider hereby assigns to Client all right, title, and interest in and to any specific deliverables created for Client under this Agreement ("Deliverables"). Provider retains all rights to its background technology, pre-existing materials, and general know-how.`
    },
    {
        id: 3,
        name: "Software License Agreement",
        cat: "Software & SaaS",
        difficulty: "Hard",
        length: "5-8 pages",
        includes: ["License Grant", "Restrictions", "Warranty Disclaimer", "Liability Cap"],
        bestFor: "SaaS Companies, Software Vendors",
        sampleText: `SOFTWARE LICENSE AGREEMENT

IMPORTANT — READ CAREFULLY: This Software License Agreement ("Agreement") is a legal agreement between you (either an individual or a single entity) ("Licensee") and [Licensor Name] ("Licensor").

1. GRANT OF LICENSE
Subject to the terms of this Agreement, Licensor grants to Licensee a non-exclusive, non-transferable, limited license to install and use the Software solely for Licensee’s internal business purposes.

2. RESTRICTIONS
Licensee shall not: (a) reverse engineer, decompile, or disassemble the Software; (b) rent, lease, lend, or sublicense the Software; or (c) create derivative works based on the Software.

3. WARRANTY DISCLAIMER
THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. LICENSOR DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.`
    },
    {
        id: 4,
        name: "Employee Offer Letter",
        cat: "Employment",
        difficulty: "Easy",
        length: "1-2 pages",
        includes: ["Position", "Salary", "Benefits", "At-Will Employment"],
        bestFor: "HR Departments, Hiring Managers",
        sampleText: `[Company Logo]

[Date]

[Candidate Name]
[Address]

Re: Offer of Employment

Dear [Candidate Name],

[Company Name] (the "Company") is pleased to offer you the position of [Job Title], reporting into [Manager Name]. We are excited about the skills and experience you bring to our team.

1. START DATE AND COMPENSATION
Your start date will be [Start Date]. You will receive an annual base salary of $[Amount], paid in accordance with the Company’s reliable payroll practices.

2. AT-WILL EMPLOYMENT
Your employment with the Company is "at-will." This means that either you or the Company may terminate the employment relationship at any time, with or without cause, and with or without notice.

3. BENEFITS
You will be eligible to participate in the Company's standard benefit plans, including medical, dental, and vision insurance, subject to the terms and conditions of those plans.`
    },
    {
        id: 5,
        name: "GDPR Compliant Privacy Policy",
        cat: "Privacy & Data",
        difficulty: "Medium",
        length: "3-5 pages",
        includes: ["Data Collection", "User Rights", "Cookies", "Third Parties"],
        bestFor: "Websites, Mobile Apps, E-commerce",
        sampleText: `PRIVACY POLICY

Last Updated: [Date]

[Company Name] ("we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share information about you when you visit our website [URL].

1. PERSONAL DATA WE COLLECT
We may collect the following types of information:
• Identity Data: Name, username, or similar identifier.
• Contact Data: Email address and telephone numbers.
• Technical Data: IP address, browser type and version, time zone setting, and operating system.

2. HOW WE USE YOUR DATA
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data:
• To provide and maintain our Service.
• To notify you about changes to our Service.
• To provide customer support.

3. YOUR LEGAL RIGHTS
Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, correct, erasure, restriction, transfer, or object to processing.`
    },
];

export default function TemplatePage() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const togglePreview = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
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

            {/* Featured Samples Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-legal-navy">Preview popular templates</h3>
                    <p className="text-sm text-slate-400 font-medium">See before you use</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {templates.slice(0, 3).map((t) => (
                        <div
                            key={`featured-${t.id}`}
                            onClick={() => togglePreview(t.id)}
                            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg hover:border-legal-navy/30 transition-all cursor-pointer group flex flex-col justify-between h-48"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[150px]">{t.cat}</span>
                                </div>
                                <h4 className="font-bold text-legal-navy line-clamp-2 leading-tight">{t.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-legal-navy group-hover:text-emerald-600 transition-colors">
                                <Eye className="w-4 h-4" />
                                Preview Sample
                            </div>
                        </div>
                    ))}
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
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-legal-navy px-2">All Templates</h3>
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    {templates.map((t, i) => (
                        <div key={t.id} className={cn(
                            "transition-all",
                            i !== templates.length - 1 && "border-b border-slate-100"
                        )}>
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-50/50">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <LayoutTemplate className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg text-legal-navy">{t.name}</h4>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.cat}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase",
                                                t.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                                                    t.difficulty === "Medium" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {t.difficulty}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">Est. length: {t.length}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {t.includes?.map((tag) => (
                                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end md:self-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePreview(t.id)}
                                        className={cn(
                                            "rounded-xl font-bold gap-2 border-slate-200",
                                            expandedId === t.id ? "bg-slate-100 text-legal-navy" : "text-slate-500 hover:text-legal-navy"
                                        )}
                                    >
                                        {expandedId === t.id ? (
                                            <>Close Preview <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Preview <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </Button>
                                    <Button size="sm" className="bg-legal-navy hover:bg-slate-800 text-white rounded-xl font-bold gap-2 shadow-lg shadow-legal-navy/10 px-6">
                                        Use Template
                                        <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-legal-navy rounded-xl">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            {expandedId === t.id && (
                                <div className="bg-slate-50/50 border-t border-slate-100 p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sample Preview</span>
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                                <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                                                <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                                            </div>
                                        </div>
                                        <div className="p-8 font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-wrap selection:bg-emerald-100 selection:text-emerald-900">
                                            {t.sampleText}
                                        </div>
                                        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-center">
                                            <Button size="sm" className="w-full max-w-xs bg-legal-navy hover:bg-slate-800 text-white rounded-xl font-bold gap-2">
                                                Use This Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
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
