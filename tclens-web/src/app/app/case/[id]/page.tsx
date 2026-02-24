"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Briefcase,
    Clock,
    FileText,
    ChevronLeft,
    Download,
    Trash2,
    Plus,
    Loader2,
    Upload,
    X,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    storagePath: string;
}

interface CaseDetails {
    id: string;
    title: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    attachments: Attachment[];
}

export default function CaseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [caseData, setCaseData] = useState<CaseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const { id } = params;

    useEffect(() => {
        if (id && auth.isAuthenticated()) {
            fetchCaseDetails();
        }
    }, [id]);

    const fetchCaseDetails = async () => {
        try {
            const user = auth.getUser();
            if (!user) return;

            const res = await fetch(`/api/cases/${id}`, {
                headers: {
                    'x-user-id': user.email,
                    'x-is-logged-in': 'true'
                }
            });
            const data = await res.json();
            if (data.ok) {
                setCaseData(data.data);
            } else {
                router.push('/app/case'); // Redirect if not found
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        // Size check (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large (Max 10MB)");
            return;
        }

        setUploading(true);
        const user = auth.getUser();

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/cases/${id}/attachments`, {
                method: 'POST',
                headers: {
                    'x-user-id': user?.email || '',
                    'x-is-logged-in': 'true'
                },
                body: formData
            });

            if (res.ok) {
                fetchCaseDetails(); // Refresh data
            } else {
                const data = await res.json();
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Upload failed due to network error");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        const user = auth.getUser();
        try {
            const res = await fetch(`/api/cases/${id}/attachments?attachmentId=${attachmentId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.email || '',
                    'x-is-logged-in': 'true'
                }
            });

            if (res.ok) {
                fetchCaseDetails();
            } else {
                alert("Failed to delete attachment");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-legal-navy animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Loading case details...</p>
            </div>
        );
    }

    if (!caseData) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Breadcrumb */}
            <div className="space-y-4">
                <button
                    onClick={() => router.push('/app/case')}
                    className="flex items-center gap-2 text-slate-400 hover:text-legal-navy transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Cases
                </button>
                <div className="flex items-start justify-between border-b border-slate-200 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-legal-navy font-outfit">{caseData.title}</h1>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black tracking-tight uppercase",
                                caseData.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                                    caseData.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                            )}>
                                {caseData.status}
                            </span>
                        </div>
                        {caseData.description && (
                            <p className="text-slate-600 max-w-2xl leading-relaxed">{caseData.description}</p>
                        )}
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-2 pt-2">
                            <Clock className="w-3.5 h-3.5" />
                            Started on {new Date(caseData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    {/* Action Buttons (Future) */}
                    <div>
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-bold text-legal-navy font-outfit uppercase tracking-tighter flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Attachments
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full ml-1">{caseData.attachments.length}</span>
                    </h3>
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            accept=".pdf,.txt,.doc,.docx"
                            disabled={uploading}
                        />
                        <Button
                            variant="outline"
                            className="h-10 px-4 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {uploading ? "Uploading..." : "Add File"}
                        </Button>
                    </div>
                </div>

                {caseData.attachments.length === 0 ? (
                    <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">No files attached yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Upload relevant documents to keep everything in one place.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {caseData.attachments.map((file) => (
                            <div key={file.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-legal-navy/30 hover:shadow-lg hover:shadow-legal-navy/5 transition-all group relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 text-legal-navy">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-legal-navy text-sm truncate max-w-[200px]" title={file.fileName}>{file.fileName}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                                                <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                                <span>•</span>
                                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={file.storagePath} // Note: This assumes storagePath is publicly accessible or proxied. Ideally use a download API.
                                            // Given we are simulating with /uploads/, this works if public/uploads is static served. 
                                            // Next.js serves 'public' at root. So if storagePath is /uploads/x.pdf, it works.
                                            download={file.fileName}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-legal-navy hover:bg-slate-100 rounded-lg">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteAttachment(file.id)}
                                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
