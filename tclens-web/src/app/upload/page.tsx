'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, Loader2, Type, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { auth } from '@/lib/auth';
import { getUsage, trackUsage, LIMITS, countWords, getRemainingQuota } from '@/lib/usage';
import Link from 'next/link';

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

        // Preliminary check for pasted text
        if (activeTab === 'text') {
            if (!pastedText.trim()) {
                setError("Please paste some text to analyze.");
                return;
            }
            const words = countWords(pastedText);
            if (currentQuotaUsage + words > currentLimit) {
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

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Analysis failed');
            }

            const data = await response.json();

            // Track successful usage
            if (data.wordCount) {
                trackUsage(data.wordCount, isUserLoggedIn);
                setUsage(getUsage(isUserLoggedIn));
            }

            localStorage.setItem('analysisResult', JSON.stringify(data));
            router.push('/analysis');

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to analyze document. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-6">
            <div className="max-w-3xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-legal-navy font-outfit">
                        Analyze Your Agreement
                    </h1>
                    <p className="text-slate-600 text-lg">
                        We'll scan it for risky clauses, hidden fees, and unfair terms in seconds.
                    </p>

                    {/* Usage Indicator */}
                    <div className="max-w-xs mx-auto pt-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            <span>Usage: {usage.toLocaleString()} / {currentLimit.toLocaleString()} Words</span>
                            <span>{Math.round(usagePercentage)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 rounded-full ${usagePercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${usagePercentage}%` }}
                            />
                        </div>
                        {!isLoggedIn && usage > 0 && (
                            <p className="text-[10px] text-slate-400 mt-2">
                                * Anonymous limit: 5,000 words. <Link href="/signup" className="text-emerald-600 underline">Sign up</Link> for 10,000.
                            </p>
                        )}
                    </div>
                </div>

                {remainingWords <= 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 border border-emerald-100 shadow-xl shadow-emerald-500/5 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
                            <Shield className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-legal-navy font-outfit">Quota Reached</h2>
                            <p className="text-slate-600 max-w-sm mx-auto">
                                You've reached your free word limit. {isLoggedIn ? 'Upgrade to a Pro plan' : 'Create a free account'} to continue analyzing.
                            </p>
                        </div>
                        <div className="pt-4">
                            {isLoggedIn ? (
                                <Button size="lg" className="h-14 px-10 bg-legal-navy hover:bg-slate-800 rounded-2xl font-bold text-lg">
                                    View Pricing Plans
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                <Button size="lg" className="h-14 px-10 bg-legal-navy hover:bg-slate-800 rounded-2xl font-bold text-lg" asChild>
                                    <Link href="/signup">
                                        Get 10,000 More Words
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'bg-slate-50 text-legal-navy border-b-2 border-legal-navy' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                Upload File
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'text' ? 'bg-slate-50 text-legal-navy border-b-2 border-legal-navy' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Type className="w-4 h-4" />
                                Paste Text
                            </button>
                        </div>

                        <div className="p-8">
                            {activeTab === 'upload' ? (
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-legal-navy'
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-legal-navy mb-2">
                                        {isDragActive ? 'Drop it here' : 'Drag & Drop PDF, Word or Text'}
                                    </h3>
                                    <p className="text-slate-500 mb-6">
                                        or click to browse your files
                                    </p>
                                    <div className="flex gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                        <span>PDF</span>
                                        <span>•</span>
                                        <span>DOCX</span>
                                        <span>•</span>
                                        <span>TXT</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder="Paste your contract text here..."
                                        className="w-full h-64 p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-legal-navy/20 focus:border-legal-navy resize-none text-slate-700 placeholder:text-slate-400 font-mono text-sm"
                                    />
                                    <div className="flex justify-end">
                                        <Button onClick={() => handleAnalyze()} disabled={isAnalyzing || !pastedText.trim()}>
                                            Analyze Text
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
                                    <AlertCircle className="w-5 h-5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="mt-6 p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                                    <h4 className="text-lg font-bold text-legal-navy">Analyzing Document...</h4>
                                    <p className="text-slate-500">Identifying clauses and calculating risk score.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <Button variant="ghost" onClick={() => router.push('/')}>
                        Back to Home
                    </Button>
                </div>
            </div>
        </main>
    );
}
