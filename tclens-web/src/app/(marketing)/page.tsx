"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Shield,
    ArrowRight,
    Scale,
    FileText,
    Search,
    BrainCircuit,
    Lock,
    Clock,
    CheckCircle,
    ChevronRight,
    Building2,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Home() {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-[0.02]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            </div>

            <main className="relative z-10">
                {/* 1) Hero Section: Clean, Corporate, Editorial */}
                <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 container mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="max-w-4xl space-y-8"
                    >
                        {/* Pill Label */}
                        <motion.div
                            variants={fadeIn}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 text-sm font-semibold tracking-wide uppercase text-muted-foreground shadow-sm"
                        >
                            <Scale className="w-4 h-4" />
                            <span>Unrivaled Contract Intelligence</span>
                        </motion.div>

                        {/* Headline: Classic Serif for Law Firm feel */}
                        <motion.h1
                            variants={fadeIn}
                            className="text-5xl md:text-7xl lg:text-8xl font-black font-playfair leading-[1.05] tracking-tight text-foreground dark:text-foreground"
                        >
                            <span className="block">Decipher Legal</span>
                            <span className="block italic text-emerald-600 dark:text-emerald-400">Complexities</span>
                            <span className="block">Instantly.</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            variants={fadeIn}
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium"
                        >
                            TCLens is the definitive AI engine for meticulous contract review. We empower professionals to unearth hidden risks, clarify obligations, and accelerate negotiations with unprecedented accuracy.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            variants={fadeIn}
                            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                        >
                            <Button size="lg" className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold text-base shadow-lg transition-transform hover:scale-[1.02]" asChild>
                                <Link href="/signup">
                                    Analyze Document
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 border-border text-foreground hover:bg-muted rounded-none font-bold text-base transition-transform hover:scale-[1.02]" asChild>
                                <Link href="#features">Explore Platform</Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image: Premium Photography */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="w-full max-w-6xl mx-auto mt-24 relative"
                    >
                        <div className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border border-border group">
                            <Image
                                src="/hero.png"
                                alt="Diverse legal team reviewing documents"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            {/* Gradient Overlay for Text Readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Stats Banner Below Image */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl bg-background border border-border shadow-xl rounded-xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-border">
                            <div>
                                <div className="text-3xl font-playfair font-bold text-foreground">98.5%</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Accuracy Rate</div>
                            </div>
                            <div>
                                <div className="text-3xl font-playfair font-bold text-foreground">50k+</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Documents Scanned</div>
                            </div>
                            <div>
                                <div className="text-3xl font-playfair font-bold text-foreground">10x</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Faster Review</div>
                            </div>
                            <div>
                                <div className="text-3xl font-playfair font-bold text-foreground">Bank</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Grade Security</div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* spacer for the overlapping stats banner */}
                <div className="h-20 lg:h-32"></div>

                {/* 2) Practice Areas / Features: Minimalist Grid */}
                <section id="features" className="py-24 px-6 bg-muted/30 border-y border-border">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="max-w-2xl"
                            >
                                <h2 className="text-3xl md:text-5xl font-playfair font-black tracking-tight text-foreground mb-4">Precision Engineered for Legal Excellence</h2>
                                <p className="text-lg text-muted-foreground font-medium">Equipping counsel with deterministic AI models configured specifically for nuanced contract syntax.</p>
                            </motion.div>
                            <Button variant="link" className="text-emerald-600 font-bold p-0 h-auto self-start md:self-end hover:text-emerald-700">
                                View Technical Whitepaper <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {/* Feature 1 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group cursor-default"
                            >
                                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-emerald-500">
                                    <Search className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold font-playfair mb-3 text-foreground tracking-tight">Deep Clause Extraction</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Automatically isolates indemnities, limitations of liability, and termination rights, presenting them alongside industry benchmarks.
                                </p>
                            </motion.div>

                            {/* Feature 2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="group cursor-default"
                            >
                                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-emerald-500">
                                    <Shield className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold font-playfair mb-3 text-foreground tracking-tight">Risk Quantification Matrix</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Assigns an objective risk score to every document based on aggressive language, atypical jurisdiction, and imbalanced terms.
                                </p>
                            </motion.div>

                            {/* Feature 3 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="group cursor-default"
                            >
                                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-emerald-500">
                                    <Clock className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold font-playfair mb-3 text-foreground tracking-tight">Expedited Review Cycles</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Convert exhaustive 100-page enterprise drafts into executive summaries in under 3 seconds, preserving key obligations.
                                </p>
                            </motion.div>

                            {/* Feature 4 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="group cursor-default"
                            >
                                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-emerald-500">
                                    <Lock className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold font-playfair mb-3 text-foreground tracking-tight">Absolute Confidentiality</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    SOC 2 Type II certified. Files are transiently processed using strict zero-retention policies. We never train on your data.
                                </p>
                            </motion.div>

                            {/* Feature 5 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="group cursor-default"
                            >
                                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-emerald-500">
                                    <Briefcase className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold font-playfair mb-3 text-foreground tracking-tight">Corporate Standardized</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Ensure organizational consistency by importing your corporate legal playbooks and letting the AI measure compliance.
                                </p>
                            </motion.div>

                            {/* Feature 6 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="group cursor-default"
                            >
                                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-emerald-500">
                                    <BrainCircuit className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold font-playfair mb-3 text-foreground tracking-tight">Semantic Drafting</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Generate flawlessly formatted, jurisdiction-specific contracts from scratch using natural language prompts.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 3) Workflow Section: Structured & Clean */}
                <section id="workflow" className="py-24 px-6 border-b border-border">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2">
                            <div className="aspect-square bg-muted/50 border border-border flex items-center justify-center relative shadow-sm">
                                {/* Abstract wireframe representation of the app */}
                                <div className="absolute inset-4 border border-border bg-background shadow-lg p-6 flex flex-col gap-4">
                                    <div className="flex gap-4 items-center border-b border-border pb-4">
                                        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    </div>
                                    <div className="flex-1 flex gap-4">
                                        <div className="w-2/3 space-y-3">
                                            <div className="h-3 w-full bg-muted rounded" />
                                            <div className="h-3 w-full bg-muted rounded" />
                                            <div className="h-3 w-4/5 bg-muted rounded" />
                                            <div className="h-3 w-full bg-muted rounded" />
                                            <div className="h-3 w-5/6 bg-muted rounded" />
                                        </div>
                                        <div className="w-1/3 flex flex-col gap-3">
                                            <div className="h-16 w-full border border-emerald-500/30 bg-emerald-500/5 rounded" />
                                            <div className="h-16 w-full bg-muted/50 rounded" />
                                            <div className="h-16 w-full bg-muted/50 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 space-y-12">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-playfair font-black tracking-tight mb-4">Streamlined Review Process</h2>
                                <p className="text-muted-foreground text-lg">Shift your paradigm from manual redlining to strategic oversight.</p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { step: "01.", title: "Upload & Encrypt", desc: "Drag and drop any PDF, DOCX, or text file. It is encrypted instantly via AES-256." },
                                    { step: "02.", title: "Algorithmic Analysis", desc: "Our proprietary legal LLM scans thousands of tokens to cross-reference jurisdictional standards." },
                                    { step: "03.", title: "Actionable Intelligence", desc: "Receive a categorized brief of critical risks, required actions, and clear red-flags." },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="text-xl font-playfair font-bold text-muted-foreground group-hover:text-emerald-600 transition-colors">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold font-playfair text-foreground mb-1">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4) CTA Section: Elegant and Authoritative */}
                <section className="py-32 px-6 bg-background dark:bg-muted/10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <Scale className="w-16 h-16 mx-auto text-emerald-500 opacity-80" />
                        <h2 className="text-4xl md:text-6xl font-playfair font-black text-foreground leading-tight">
                            Elevate your Legal Practice.
                        </h2>
                        <p className="text-xl text-foreground/60 font-medium max-w-2xl mx-auto">
                            Join elite law firms, in-house counsel, and stringent compliance teams utilizing TCLens.
                        </p>
                        <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold text-base shadow-xl" asChild>
                                <Link href="/signup">Commence Analysis</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 border-border text-foreground hover:bg-muted/50 rounded-none font-bold text-base" asChild>
                                <Link href="/pricing">View Enterprise Plans</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer: Clean and Strict */}
                <footer className="bg-background border-t border-border py-20 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
                        <div className="col-span-1 md:col-span-1 space-y-6">
                            <div className="flex items-center gap-3 text-foreground font-black text-2xl font-playfair tracking-tight">
                                <Shield className="w-6 h-6 text-emerald-600" />
                                <span>TC<span className="text-emerald-600">Lens</span></span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                The gold standard in AI contract analysis and risk mitigation.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-foreground font-bold mb-6 font-playfair text-sm">Capabilities</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground transition-colors">Risk Extraction</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">Document Summarization</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">Contract Generation</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-foreground font-bold mb-6 font-playfair text-sm">Organization</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">Enterprise API</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">Security Overview</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-foreground font-bold mb-6 font-playfair text-sm">Compliance</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">SOC 2 Report</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} TCLens Corp. All rights reserved.</p>
                        <div className="flex gap-6">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> New York, NY</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
