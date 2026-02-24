"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    Plus,
    Clock,
    FileText,
    Search,
    ChevronRight,
    MoreVertical,
    X,
    Upload,
    Loader2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

interface Case {
    id: string;
    title: string;
    description: string;
    status: "Active" | "Pending" | "Completed";
    updatedAt: string;
    attachmentCount: number;
}

interface UploadingFile {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
}

export default function CasePage() {
    const router = useRouter();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCase, setNewCase] = useState({ title: "", description: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filesToUpload, setFilesToUpload] = useState<UploadingFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (auth.isAuthenticated()) {
            fetchCases();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCases = async () => {
        try {
            const user = auth.getUser();
            if (!user) return;

            const res = await fetch('/api/cases', {
                headers: {
                    'x-user-id': user.email,
                    'x-is-logged-in': 'true'
                }
            });
            const data = await res.json();
            if (data.ok) {
                setCases(data.data.map((c: any) => ({
                    ...c,
                    updatedAt: new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                })));
            }
        } catch (error) {
            console.error("Failed to fetch cases", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                status: 'pending' as const,
                progress: 0
            }));

            // Limit to 5 files total
            if (filesToUpload.length + newFiles.length > 5) {
                alert("Maximum 5 files allowed");
                return;
            }

            setFilesToUpload(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCase.title.trim()) return;

        setIsSubmitting(true);
        const user = auth.getUser();
        if (!user) return;

        try {
            // 1. Create Case
            const createRes = await fetch('/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.email,
                    'x-is-logged-in': 'true'
                },
                body: JSON.stringify(newCase)
            });

            const createData = await createRes.json();
            if (!createData.ok) throw new Error(createData.error);

            const caseId = createData.data.id;

            // 2. Upload Files (Parallel)
            if (filesToUpload.length > 0) {
                const uploadPromises = filesToUpload.map(async (fileObj, index) => {
                    const formData = new FormData();
                    formData.append('file', fileObj.file);

                    // Update status to uploading
                    setFilesToUpload(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading' } : f));

                    try {
                        const uploadRes = await fetch(`/api/cases/${caseId}/attachments`, {
                            method: 'POST',
                            headers: {
                                'x-user-id': user.email,
                                'x-is-logged-in': 'true'
                            },
                            body: formData
                        });

                        if (!uploadRes.ok) throw new Error('Upload failed');

                        setFilesToUpload(prev => prev.map((f, i) => i === index ? { ...f, status: 'success' } : f));
                    } catch (err) {
                        setFilesToUpload(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' } : f));
                    }
                });

                await Promise.all(uploadPromises);
            }

            // 3. Redirect
            router.push(`/app/case/${caseId}`);

        } catch (error) {
            console.error("Creation failed:", error);
            setIsSubmitting(false);
        }
    };

    const filteredCases = cases.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8 tracking-tight">
                <div>
                    <h1 className="text-3xl font-black text-legal-navy font-outfit mb-2">Cases</h1>
                    <p className="text-slate-500">Manage your legal matters and organize related documents.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 px-6 rounded-xl bg-legal-navy hover:bg-slate-800 font-bold gap-2 shadow-lg shadow-legal-navy/10 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Create Case
                </Button>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-legal-navy font-outfit uppercase tracking-tighter">Your Matters</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 h-10 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-legal-navy w-64"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-legal-navy animate-spin" />
                    </div>
                ) : cases.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-20 text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-legal-navy font-outfit">No cases found</h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm">Create your first legal matter to start organizing your documents.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-10 px-6 rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                        >
                            Create First Case
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        {filteredCases.map((c, i) => (
                            <div key={c.id}
                                onClick={() => router.push(`/app/case/${c.id}`)}
                                className={cn(
                                    "group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all cursor-pointer",
                                    i !== filteredCases.length - 1 && "border-b border-slate-100"
                                )}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-legal-navy group-hover:text-emerald-400 transition-all">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-legal-navy group-hover:text-legal-navy">{c.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <Clock className="w-3 h-3" />
                                                Updated {c.updatedAt}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <FileText className="w-3 h-3" />
                                                {c.attachmentCount} Documents
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black tracking-tight uppercase",
                                        c.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                                            c.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                    )}>
                                        {c.status}
                                    </span>
                                    <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-legal-navy transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Case Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-legal-navy font-outfit">New Legal Matter</h2>
                                <p className="text-sm text-slate-500">Provide a title and optional description for your case.</p>
                            </div>

                            <form onSubmit={handleCreateCase} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Case Title</label>
                                    <Input
                                        required
                                        placeholder="e.g. Service Provider Agreement Review"
                                        value={newCase.title}
                                        onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                                        className="h-12 rounded-xl focus-visible:ring-legal-navy"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Description (Optional)</label>
                                    <textarea
                                        placeholder="Brief summary of the legal context..."
                                        value={newCase.description}
                                        onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                        className="w-full h-32 p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-legal-navy text-sm transition-all resize-none"
                                    />
                                </div>

                                {/* Attachments Section */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Attachments (Optional)</label>

                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept=".pdf,.txt,.doc,.docx"
                                        />
                                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-legal-navy">Click or drag files here</p>
                                        <p className="text-[10px] text-slate-400 mt-1">PDF, TXT, DOC, DOCX (Max 10MB)</p>
                                    </div>

                                    {filesToUpload.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {filesToUpload.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <div className="truncate">
                                                            <p className="text-xs font-bold text-legal-navy truncate">{item.file.name}</p>
                                                            <p className="text-[10px] text-slate-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(i)}
                                                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 rounded-xl bg-legal-navy hover:bg-slate-800 font-bold text-white shadow-lg shadow-legal-navy/10"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : "Create Matter"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
