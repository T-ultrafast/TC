"use client";

import { Check, Shield, Zap, Target, Star, ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Anonymous",
        price: "$0",
        desc: "Quick one-off analysis for non-sensitive documents.",
        words: "5,000",
        features: [
            "Basic risk detection",
            "Instant summary",
            "Standard neural processing",
            "No data persistence"
        ],
        cta: "Start Scanning",
        href: "/upload",
        popular: false,
        accent: "white"
    },
    {
        name: "Intelligence Free",
        price: "$0",
        desc: "Deep analysis for personal contracts & agreements.",
        words: "10,000",
        features: [
            "Neural risk mapping",
            "Saved analysis history",
            "Document export tools",
            "Priority community support"
        ],
        cta: "Create Vault",
        href: "/signup",
        popular: true,
        accent: "emerald"
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "High-volume legal throughput with SOC-2 security.",
        words: "Unlimited",
        features: [
            "Multi-user team auth",
            "API Infrastructure access",
            "Dedicated legal engineer",
            "On-premise deployment options"
        ],
        cta: "Neural Demo",
        href: "#",
        popular: false,
        accent: "blue"
    }
];

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-background pt-32 pb-24 px-6 relative overflow-hidden">
            {/* Background Haze */}
            <div className="bg-haze">
                <div className="haze-gradient-1" />
                <div className="haze-gradient-2" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-6 max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] backdrop-blur-md"
                    >
                        <Lock className="w-3 h-3" />
                        Transparent Pricing
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-foreground font-playfair tracking-tighter leading-[0.9]"
                    >
                        Intelligence for <br />
                        <span className="highlight-gradient">Every Scale.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-foreground/50 text-xl font-medium"
                    >
                        Protect your rights with our standard-setting AI. <br className="hidden md:block" />
                        Choose the vault that suits your legal workflow.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className={cn(
                                "relative group p-10 flex flex-col transition-all h-full",
                                tier.popular ? "glass-card-glow border-emerald-500/30 scale-105 z-20" : "glass-card border-border hover:border-border"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-foreground px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                    Highly Optimized
                                </div>
                            )}

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-foreground font-playfair uppercase tracking-wider">{tier.name}</h3>
                                    {tier.accent === "emerald" && <Sparkles className="w-5 h-5 text-emerald-500" />}
                                    {tier.accent === "blue" && <Zap className="w-5 h-5 text-brand-secondary" />}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-foreground font-playfair tracking-tighter">{tier.price}</span>
                                    <span className="text-foreground/30 font-bold uppercase tracking-widest text-[10px]">Per Instance</span>
                                </div>
                                <p className="text-foreground/50 font-medium text-sm leading-relaxed">{tier.desc}</p>
                            </div>

                            <div className="space-y-8 flex-1">
                                <div className="pt-8 border-t border-border">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full animate-pulse",
                                            tier.accent === "emerald" ? "bg-emerald-500" : tier.accent === "blue" ? "bg-blue-600" : "bg-muted/50"
                                        )} />
                                        <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">{tier.words} Words Included</span>
                                    </div>
                                    <ul className="space-y-5">
                                        {tier.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-4 text-sm text-foreground/60 font-medium group/item">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all",
                                                    tier.accent === "emerald" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                                        tier.accent === "blue" ? "bg-blue-600/10 border-blue-600/20 text-brand-secondary" :
                                                            "bg-muted/50 border-border text-foreground/40"
                                                )}>
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </div>
                                                <span className="group-hover/item:text-foreground transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-12">
                                <Button
                                    size="xl"
                                    className={cn(
                                        "w-full transition-all duration-500",
                                        tier.popular
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-foreground shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                            : "bg-muted/50 hover:bg-muted/50 text-foreground border border-border"
                                    )}
                                    asChild
                                >
                                    <Link href={tier.href}>
                                        {tier.cta}
                                        <ArrowRight className="ml-3 w-5 h-5" />
                                    </Link>
                                </Button>
                                {(tier.name === "Pro" || tier.name === "Enterprise") && (
                                    <p className="text-[9px] text-center text-foreground/20 mt-4 font-black uppercase tracking-widest italic animate-pulse">
                                        Neural Link Integration Soon
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Enterprise CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative rounded-[4rem] overflow-hidden glass-card-glow border-emerald-500/20 py-24 px-12 text-center"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/30">
                            <Shield className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-foreground font-playfair tracking-tight">Need Neural Customization?</h2>
                        <p className="text-foreground/50 text-xl font-medium leading-relaxed">
                            We provide on-premise deployments and custom neural training for legal firms handling sensitive jurisdictional artifacts.
                        </p>
                        <Button size="xl" className="bg-background text-foreground hover:bg-muted/50 shadow-2xl px-16">
                            Secure Enterprise Consultation
                        </Button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
