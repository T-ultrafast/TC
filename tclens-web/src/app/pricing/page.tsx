"use client";

import { Check, Shield, Zap, Target, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const tiers = [
    {
        name: "Free Account",
        price: "$0",
        desc: "Perfect for personal documents and getting started.",
        words: "10,000",
        features: [
            "10,000 words lifetime quota",
            "Saved analysis history",
            "Document generation tools",
            "Expert lawyer network access"
        ],
        cta: "Create Free Account",
        href: "/signup",
        popular: true
    },
    {
        name: "Pro",
        price: "$19",
        period: "/mo",
        desc: "For small businesses & frequent users.",
        words: "100,000 words/month",
        features: [
            "Priority AI processing",
            "Batch document analysis",
            "Advanced data privacy mapping",
            "Custom clause training"
        ],
        cta: "Upgrade to Pro",
        href: "#",
        popular: false
    },
    {
        name: "Business",
        price: "$49",
        period: "/mo",
        desc: "Full legal operations control.",
        words: "500,000 words/month",
        features: [
            "Team collaboration",
            "API Access",
            "Dedicated legal consultant",
            "Enterprise-grade security"
        ],
        cta: "Contact Sales",
        href: "#",
        popular: false
    }
];

export default function PricingPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-50 pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-100 uppercase tracking-widest">
                            Simple Pricing
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-legal-navy font-outfit">
                            Protect More, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-legal-navy to-emerald-600">Analyze Faster.</span>
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Choose a plan that fits your legal throughput. Every plan includes our core AI-powered risk detection.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {tiers.map((tier, i) => (
                            <div
                                key={i}
                                className={`bg-white rounded-[2.5rem] p-8 border border-slate-200 transition-all hover:shadow-xl hover:-translate-y-1 relative flex flex-col ${tier.popular ? 'border-emerald-500 ring-4 ring-emerald-500/5' : ''}`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                        Most Popular
                                    </div>
                                )}

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-xl font-bold text-legal-navy font-outfit">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-legal-navy">{tier.price}</span>
                                        {tier.period && <span className="text-slate-400 font-bold">{tier.period}</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">{tier.desc}</p>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                                            <span className="text-sm font-black text-legal-navy uppercase tracking-tighter">{tier.words}</span>
                                        </div>
                                        <ul className="space-y-4">
                                            {tier.features.map((feature, j) => (
                                                <li key={j} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Button
                                        className={`w-full h-12 rounded-xl font-bold transition-all ${tier.popular ? 'bg-legal-navy hover:bg-slate-800 text-white' : 'bg-slate-50 hover:bg-slate-100 text-legal-navy border border-slate-200'}`}
                                        asChild
                                    >
                                        <Link href={tier.href}>
                                            {tier.cta}
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </Button>
                                    {tier.name === "Pro" || tier.name === "Business" ? (
                                        <p className="text-[10px] text-center text-slate-400 mt-3 italic">* Payments coming soon. Current limits are for evaluation.</p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-legal-navy rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-3xl font-bold font-outfit">Need a custom enterprise solution?</h2>
                            <p className="text-slate-300 max-w-xl mx-auto">
                                We offer bespoke training for legal teams, tailored to specific jurisdictions and industry standards.
                            </p>
                            <Button size="lg" className="bg-white text-legal-navy hover:bg-slate-100 font-bold rounded-xl h-14 px-8">
                                Contact Sales Team
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
