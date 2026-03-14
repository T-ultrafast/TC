'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, Loader2, Type, Shield, ArrowRight, Lock, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { authClient } from '@/lib/auth-client';
import { getUsage, trackUsage, LIMITS, countWords } from '@/lib/usage';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

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
        const checkAuth = async () => {
            const { data: session } = await authClient.getSession();
            setIsLoggedIn(!!session);
            setUsage(getUsage(!!session));
        };
        checkAuth();
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

        const isUserLoggedIn = isLoggedIn;
        const currentQuotaUsage = usage;

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed");
            }

            // Navigate to results
            router.push(`/app/document?result=${encodeURIComponent(JSON.stringify(data.result))}&text=${encodeURIComponent(data.text)}`);
        } catch (err: any) {
            setError(err.message || "Failed to analyze document. Please try again.");
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-white pt-20 pb-24 px-6 relative overflow-hidden font-jakarta">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 flex flex-col items-center pt-20 pointer-events-none sticky h-screen">
                <h1 className="bg-text-outline uppercase opacity-30">Scan</h1>
                <div className="orb-2 top-20 -left-20" />
                <div className="orb-1 bottom-20 -right-20" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto relative z-10"
            >
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-tclens-600 uppercase tracking-widest"
                    >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Secure & Confidential</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-bold text-slate-950 tracking-tight leading-none">
                        Analyze Your <span className="text-tclens-500">Document.</span>
                    </h1>
                    <p className="text-slate-600 text-xl max-w-2xl mx-auto font-medium">
                        Instant clarity on fine print, hidden obligations, and potential risks.
                    </p>
                </div>

                {remainingWords <= 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 text-center space-y-8 rounded-card border-2 border-slate-100"
                    >
                        <div className="w-24 h-24 bg-red-50 rounded-card flex items-center justify-center mx-auto">
                            <Shield className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-bold text-slate-950 tracking-tight">Limit Reached</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg font-medium leading-relaxed">
                                You've reached your free word limit. {isLoggedIn ? 'Please upgrade or wait for next plan' : 'Sign up free for a higher limit!'}
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                            {isLoggedIn ? (
                                <Button size="lg" className="h-16 px-12 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-tclens-100" asChild>
                                    <Link href="/pricing">View Plans</Link>
                                </Button>
                            ) : (
                                <Button size="lg" className="h-16 px-12 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold text-lg" asChild>
                                    <Link href="/signup">
                                        Sign Up for 10,000 Free Words
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-card border border-slate-100 overflow-hidden">
                        {/* Tabs Navigation */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={cn(
                                    "flex-1 py-6 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    activeTab === 'upload' ? "text-tclens-600 border-b-4 border-tclens-500 bg-tclens-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <Upload className="w-5 h-5" />
                                File Upload
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={cn(
                                    "flex-1 py-6 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    activeTab === 'text' ? "text-tclens-600 border-b-4 border-tclens-500 bg-tclens-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <Type className="w-5 h-5" />
                                Paste Text
                            </button>
                        </div>

                        <div className="p-10">
                            {activeTab === 'upload' ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    {...(getRootProps() as any)}
                                    className={cn(
                                        "relative group min-h-[350px] border-2 border-dashed rounded-card flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500",
                                        isDragActive ? "border-tclens-500 bg-tclens-50" : "border-slate-200 hover:border-tclens-300 hover:bg-slate-50"
                                    )}
                                >
                                    <input {...getInputProps()} />

                                    {/* Icon Container */}
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 bg-tclens-50 rounded-full flex items-center justify-center border border-tclens-100 relative z-10 animate-float-slow">
                                            <Upload className={cn("w-10 h-10 transition-all duration-500", isDragActive ? "text-tclens-600 scale-110" : "text-slate-400")} />
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-900 mb-2">
                                        {isDragActive ? 'Drop to Scan' : 'Drop File Here'}
                                    </h3>
                                    <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto font-medium">
                                        Support for PDF, Word, and Text documents.
                                    </p>

                                    <div className="flex gap-4 items-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>PDF</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <span>DOCX</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
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
                                            placeholder="Paste the document content here..."
                                            className="w-full h-80 p-8 rounded-[2rem] bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium text-lg resize-none leading-relaxed"
                                        />

                                        {/* Word count bubble */}
                                        <div className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-white border border-slate-100 text-xs font-bold text-slate-500">
                                            {pastedWordCount} Words
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-tclens-500" />
                                            AI-powered analysis
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={() => handleAnalyze()}
                                            disabled={isAnalyzing || !pastedText.trim()}
                                            className="h-14 px-10 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition-all"
                                        >
                                            Scan Text
                                            <ArrowRight className="ml-2 w-5 h-5 transition-transform" />
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
                                        className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100 flex items-center gap-4 text-red-500"
                                    >
                                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                        <p className="font-bold text-sm">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isAnalyzing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-8 p-10 bg-tclens-50 rounded-card border border-tclens-100 flex flex-col items-center justify-center text-center space-y-6"
                                >
                                    <div className="relative">
                                        <Loader2 className="w-16 h-16 text-tclens-500 animate-spin" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Analyzing...</h4>
                                        <p className="text-slate-500 font-medium">Extracting clauses and calculating insights.</p>
                                    </div>
                                    <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-tclens-500"
                                            animate={{ x: [-100, 300] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Usage Progress Footer */}
                        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", usagePercentage > 90 ? "bg-red-500" : "bg-tclens-500")} />
                                    <span>Quota: {usage.toLocaleString()} / {currentLimit.toLocaleString()} Words</span>
                                </div>
                                <span>{Math.round(usagePercentage)}% Used</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usagePercentage}%` }}
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        usagePercentage > 90 ? "bg-red-500" : "bg-tclens-500"
                                    )}
                                />
                            </div>

                            {!isLoggedIn && usage > 0 && (
                                <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest text-center">
                                    * Anonymous limit: 5k words • <Link href="/signup" className="text-tclens-600 hover:underline">Sign up</Link> for 10k free words.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mx-auto"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </motion.div>
        </main>
    );
}
