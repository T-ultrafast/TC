'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, Loader2, Type, Shield, ArrowRight, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { auth } from '@/lib/auth';
import { getUsage, trackUsage, LIMITS, countWords } from '@/lib/usage';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function UploadPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
    const [pastedText, setPastedText] = useState('');

    // Usage state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usage, setUsage] = useState(0);

    useEffect(() => {
        const loggedIn = auth.isAuthenticated();
        setIsLoggedIn(loggedIn);
        setUsage(getUsage(loggedIn));
    }, []);

    const currentLimit = isLoggedIn ? LIMITS.FREE_ACCOUNT : LIMITS.ANONYMOUS;
    const remainingWords = Math.max(0, currentLimit - usage);
    const usagePercentage = Math.min(100, (usage / currentLimit) * 100);

    // Pasted text word count
    const pastedWordCount = countWords(pastedText);

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        await handleAnalyze(file);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
    });

    const handleAnalyze = async (file?: File) => {
        if (isAnalyzing) return;

        const isUserLoggedIn = auth.isAuthenticated();
        const currentQuotaUsage = getUsage(isUserLoggedIn);

        if (activeTab === 'text') {
            if (!pastedText.trim()) {
                setError("Please paste some text to analyze.");
                return;
            }
            if (pastedText.trim().length < 50) {
                setError("Please provide at least 50 characters for a meaningful analysis.");
                return;
            }
            if (currentQuotaUsage + pastedWordCount > currentLimit) {
                setError(`Usage limit exceeded. You have ${remainingWords} words left. Please upgrade or reduce text.`);
                return;
            }
        }

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();

        if (activeTab === 'upload') {
            if (file) {
                formData.append('file', file);
            } else {
                setError("Please select a file to upload.");
                setIsAnalyzing(false);
                return;
            }
        } else {
            formData.append('text', pastedText);
        }

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
                headers: {
                    'x-usage': currentQuotaUsage.toString(),
                    'x-is-logged-in': isUserLoggedIn.toString()
                }
            });

            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text.substring(0, 50) || "Server error occurred");
            }

            if (!response.ok || data.ok === false) {
                const errorMessage = data.error || 'Analysis failed';
                const errorDetails = data.details ? `: ${data.details}` : "";
                throw new Error(`${errorMessage}${errorDetails}`);
            }

            const result = data.data;

            if (result.wordCount) {
                trackUsage(result.wordCount, isUserLoggedIn);
                setUsage(getUsage(isUserLoggedIn));
            }

            localStorage.setItem('analysisResult', JSON.stringify(result));
            router.push('/analysis');

        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || 'Failed to analyze document. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden">
            {/* Background Haze */}
            <div className="bg-haze">
                <div className="haze-gradient-1" />
                <div className="haze-gradient-2" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full z-10"
            >
                {/* Header Area */}
                <div className="text-center space-y-6 mb-12">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-xs font-bold text-emerald-500 uppercase tracking-widest backdrop-blur-md"
                    >
                        <Lock className="w-3 h-3" />
                        <span>AES-256 Secured Vault</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-black text-foreground font-playfair tracking-tighter leading-none">
                        Analyze Your <span className="highlight-gradient">Agreement.</span>
                    </h1>
                    <p className="text-foreground/50 text-xl max-w-2xl mx-auto font-medium">
                        Instant risk detection for fine print, hidden fees, and unfair terms.
                    </p>
                </div>

                {remainingWords <= 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card-glow p-12 text-center space-y-8"
                    >
                        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30">
                            <Shield className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-foreground tracking-tight">Quota Exhausted</h2>
                            <p className="text-foreground/60 max-w-sm mx-auto text-lg leading-relaxed">
                                You've reached your free intelligence limit. {isLoggedIn ? 'Upgrade to Pro' : 'Create a free account'} for unlimited analysis.
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                            {isLoggedIn ? (
                                <Button size="xl" className="h-16 px-12 bg-background text-foreground hover:bg-muted/50 rounded-2xl font-bold text-lg shadow-xl transition-all">
                                    View Pro Plans
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                <Button size="xl" className="h-16 px-12 bg-emerald-500 hover:bg-emerald-400 text-foreground rounded-2xl font-bold text-lg shadow-xl transition-all" asChild>
                                    <Link href="/signup">
                                        Get 10,000 More Words
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="glass-card-glow overflow-hidden">
                        {/* Tabs Navigation */}
                        <div className="flex border-b border-border bg-background/[0.02]">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={cn(
                                    "flex-1 py-6 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    activeTab === 'upload' ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-foreground/40 hover:text-foreground/60 hover:bg-background/[0.01]"
                                )}
                            >
                                <Upload className="w-5 h-5" />
                                Secure Upload
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={cn(
                                    "flex-1 py-6 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    activeTab === 'text' ? "text-blue-500 border-b-2 border-blue-500 bg-blue-500/5" : "text-foreground/40 hover:text-foreground/60 hover:bg-background/[0.01]"
                                )}
                            >
                                <Type className="w-5 h-5" />
                                Paste Intelligence
                            </button>
                        </div>

                        <div className="p-10">
                            {activeTab === 'upload' ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    {...(getRootProps() as any)}
                                    className={cn(
                                        "relative group min-h-[350px] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500",
                                        isDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-border hover:bg-background/[0.02]"
                                    )}
                                >
                                    <input {...getInputProps()} />

                                    {/* Pulsing Shield Icon */}
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/40 transition-all duration-500" />
                                        <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center border-emerald-500/30 relative z-10 animate-float">
                                            <Shield className={cn("w-10 h-10 transition-all duration-500", isDragActive ? "text-emerald-500 scale-110" : "text-foreground/60")} />
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black text-foreground mb-3 font-playfair">
                                        {isDragActive ? 'Release to Scan' : 'Drop Vault Key'}
                                    </h3>
                                    <p className="text-foreground/40 text-lg mb-8 max-w-sm mx-auto font-medium">
                                        Drag & Drop PDF, Word or Text files for neural processing.
                                    </p>

                                    <div className="flex gap-4 items-center px-4 py-2 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                        <span>PDF</span>
                                        <div className="w-1 h-1 bg-muted/50 rounded-full" />
                                        <span>DOCX</span>
                                        <div className="w-1 h-1 bg-muted/50 rounded-full" />
                                        <span>TXT</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="relative">
                                        <textarea
                                            value={pastedText}
                                            onChange={(e) => setPastedText(e.target.value)}
                                            placeholder="Paste the fine print here for instant breakdown..."
                                            className="w-full h-80 p-8 rounded-[2rem] bg-background/[0.03] border border-border focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-foreground placeholder:text-foreground/20 font-medium text-lg resize-none leading-relaxed"
                                        />

                                        {/* Real-time word count bubble */}
                                        <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full glass-card border-border text-xs font-bold text-foreground/60">
                                            {pastedWordCount} Words
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-sm font-bold text-foreground/40 italic flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-blue-500" />
                                            AI-Ready for Analysis
                                        </div>
                                        <Button
                                            size="xl"
                                            onClick={() => handleAnalyze()}
                                            disabled={isAnalyzing || !pastedText.trim()}
                                            className="h-16 px-10 bg-blue-600 hover:bg-blue-500 text-foreground rounded-2xl font-black text-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:shadow-none"
                                        >
                                            Process Text
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="mt-8 p-6 glass-card border-red-500/20 flex items-center gap-4 text-red-500 bg-red-500/5 group"
                                    >
                                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                        <p className="font-bold text-sm tracking-tight">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isAnalyzing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-8 p-10 glass-card-glow flex flex-col items-center justify-center text-center space-y-6"
                                >
                                    <div className="relative">
                                        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                                        <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-foreground mb-2">Neural Syncing...</h4>
                                        <p className="text-foreground/40 font-medium">Extracting clauses and calculating delta-risk scores.</p>
                                    </div>
                                    <div className="w-full max-w-xs h-1 bg-muted/50 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            animate={{ x: [-100, 300] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Usage Footer: Glowing Progress Bar */}
                        <div className="px-10 py-8 bg-background/[0.01] border-t border-border">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", usagePercentage > 90 ? "bg-red-500" : "bg-emerald-500")} />
                                    <span>Intelligence Quota: {usage.toLocaleString()} / {currentLimit.toLocaleString()} Words</span>
                                </div>
                                <span>{Math.round(usagePercentage)}% Consumed</span>
                            </div>
                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden relative group">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usagePercentage}%` }}
                                    className={cn(
                                        "h-full transition-all duration-1000 relative z-10",
                                        usagePercentage > 90 ? "bg-red-500" : "bg-emerald-500"
                                    )}
                                />
                                {/* Glowing effect for the bar */}
                                <motion.div
                                    className={cn(
                                        "absolute top-0 left-0 h-full blur-sm opacity-50 z-0",
                                        usagePercentage > 90 ? "bg-red-500" : "bg-emerald-500"
                                    )}
                                    animate={{ width: `${usagePercentage}%` }}
                                />
                            </div>

                            {!isLoggedIn && usage > 0 && (
                                <p className="text-[10px] text-foreground/20 mt-4 font-bold uppercase tracking-wider text-center">
                                    * Anonymous vault limit: 5k words • <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4 transition-all">Authenticate</Link> for 10k limit.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="text-foreground/30 hover:text-foreground/60 hover:bg-muted/50 font-bold uppercase tracking-widest text-xs"
                    >
                        Return to Command Center
                    </Button>
                </div>
            </motion.div>
        </main>
    );
}
