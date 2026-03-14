"use client";

import { Check, Shield, Zap, Star, ArrowRight, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Anonymous",
        price: "$0",
        desc: "Quick analysis for one-off documents without an account.",
        words: "5,000",
        features: [
            "Basic risk detection",
            "Instant summary",
            "Standard analysis engine",
            "No account needed"
        ],
        cta: "Scan Now",
        href: "/upload",
        popular: false,
        accent: "white"
    },
    {
        name: "Individual Free",
        price: "$0",
        desc: "Best for personal contracts and organized history.",
        words: "10,000",
        features: [
            "Everything in Anonymous",
            "Saved analysis history",
            "Document export tools",
            "Relatable law explanations"
        ],
        cta: "Sign Up Free",
        href: "/signup",
        popular: true,
        accent: "tclens"
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "For teams and legal firms with high-volume needs.",
        words: "Unlimited",
        features: [
            "Multi-user team access",
            "Higher security standards",
            "Dedicated support person",
            "On-premise options"
        ],
        cta: "Contact Us",
        href: "#",
        popular: false,
        accent: "slate"
    }
];

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-white pt-32 pb-24 px-6 relative overflow-hidden font-jakarta">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 flex flex-col items-center pt-20 pointer-events-none sticky h-screen">
                <h1 className="bg-text-outline uppercase opacity-50">Pricing</h1>
                <div className="orb-1 top-40 -left-20" />
                <div className="orb-2 bottom-40 -right-20" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-6 max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tclens-50 border border-tclens-100 text-tclens-600 font-bold text-xs uppercase tracking-widest"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Fair Plans for Everyone
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-slate-950 tracking-tight leading-[1.1]"
                    >
                        Clarity that fits <br />
                        <span className="text-tclens-500">Every Need.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 text-xl font-medium"
                    >
                        Choose the plan that matches your document review workflow. <br className="hidden md:block" />
                        No hidden fees, just pure clarity.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={cn(
                                "relative p-8 md:p-10 flex flex-col transition-all h-full rounded-card",
                                tier.popular
                                    ? "bg-white border-2 border-tclens-500 z-20 scale-105 shadow-xl shadow-tclens-500/10"
                                    : "bg-slate-50 border border-slate-100"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-tclens-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-tclens-500/20">
                                    Highly Recommended
                                </div>
                            )}

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                                    {tier.accent === "tclens" && <Star className="w-5 h-5 fill-tclens-500 text-tclens-500" />}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-slate-950 tracking-tight">{tier.price}</span>
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Per Month</span>
                                </div>
                                <p className="text-slate-600 font-medium text-sm leading-relaxed">{tier.desc}</p>
                            </div>

                            <div className="space-y-8 flex-1">
                                <div className="pt-8 border-t border-slate-200">
                                    <div className="flex items-center gap-3 mb-6 font-bold text-slate-900 uppercase tracking-widest text-[10px]">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            tier.popular ? "bg-tclens-500 animate-pulse" : "bg-slate-300"
                                        )} />
                                        <span>{tier.words} Words Included</span>
                                    </div>
                                    <ul className="space-y-5">
                                        {tier.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                                                    tier.popular ? "bg-tclens-500 border-tclens-500 text-white" : "bg-white border-slate-200 text-slate-400"
                                                )}>
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-12">
                                <Button
                                    size="lg"
                                    className={cn(
                                        "w-full h-14 rounded-xl font-bold text-base transition-all duration-300",
                                        tier.popular
                                            ? "bg-tclens-500 hover:bg-tclens-600 text-white shadow-lg shadow-tclens-500/20"
                                            : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                                    )}
                                    asChild
                                >
                                    <Link href={tier.href}>
                                        {tier.cta}
                                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Enterprise CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative rounded-card overflow-hidden bg-slate-950 py-20 px-8 text-center text-white"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-tclens-500/10 blur-[120px] rounded-full" />
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="w-20 h-20 bg-tclens-500/20 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                            <CheckCircle2 className="w-10 h-10 text-tclens-400" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Need something custom?</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            We offer custom deployments and higher word counts for legal firms and growing businesses. Let's talk about your specific needs.
                        </p>
                        <Button size="lg" className="h-16 px-12 bg-white text-slate-950 hover:bg-slate-100 rounded-full font-bold text-lg transition-all border border-slate-200">
                            Talk To Sales
                        </Button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
