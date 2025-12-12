'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';

export default function UploadPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        },
        maxFiles: 1,
    });

    const handleAnalyze = async (file: File) => {
        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();

            // Store result in localStorage to pass to analysis page (simple solution for now)
            localStorage.setItem('analysisResult', JSON.stringify(data));
            router.push('/analysis');

        } catch (err) {
            console.error(err);
            setError('Failed to analyze document. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-6">
            <div className="max-w-3xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-legal-navy font-outfit">
                        Upload Your Agreement
                    </h1>
                    <p className="text-slate-600 text-lg">
                        We'll scan it for risky clauses, hidden fees, and unfair terms in seconds.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
                            {isDragActive ? 'Drop it here' : 'Drag & Drop PDF or Text'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            or click to browse your files
                        </p>
                        <div className="flex gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                            <span>PDF</span>
                            <span>•</span>
                            <span>TXT</span>
                        </div>
                    </div>

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

                <div className="text-center">
                    <Button variant="ghost" onClick={() => router.push('/')}>
                        Back to Home
                    </Button>
                </div>
            </div>
        </main>
    );
}
