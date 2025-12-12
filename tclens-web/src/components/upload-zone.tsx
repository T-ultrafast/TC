"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function UploadZone() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const data = await response.json();
            // Store result in localStorage for demo purposes since we don't have a real DB persistence layer for the "view" page yet
            // In a real app, we'd just redirect to /analysis/[id] and fetch from DB
            localStorage.setItem(`analysis-${data.id}`, JSON.stringify(data));

            router.push(`/analysis/${data.id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze document. Please try again.");
            setIsUploading(false);
        }
    }, [router]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "text/plain": [".txt"],
        },
        maxFiles: 1,
        disabled: isUploading,
    });

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
                    isDragActive
                        ? "border-legal-emerald bg-emerald-50/50"
                        : "border-slate-200 hover:border-legal-navy/30 hover:bg-slate-50",
                    isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                        isDragActive ? "bg-emerald-100 text-legal-emerald" : "bg-slate-100 text-slate-400"
                    )}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-legal-navy" />
                        ) : (
                            <UploadCloud className="w-8 h-8" />
                        )}
                    </div>

                    {isUploading ? (
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-legal-navy">Analyzing Document...</h3>
                            <p className="text-slate-500">Our AI is reading the fine print. This may take a moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-legal-navy">
                                {isDragActive ? "Drop it here!" : "Drag & Drop your contract"}
                            </h3>
                            <p className="text-slate-500">
                                Supports PDF and TXT files. Max 10MB.
                            </p>
                            <Button variant="outline" className="mt-4">
                                Browse Files
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>
    );
}
