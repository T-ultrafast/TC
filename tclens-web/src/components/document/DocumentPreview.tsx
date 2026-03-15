"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Download,
    FileText,
    Loader2,
    Sparkles,
    Wand2,
    X,
    Send
} from 'lucide-react';

// Quill must be dynamic to avoid SSR issues
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
}, { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface DocumentPreviewProps {
    genResult: string;
    setGenResult: (val: string) => void;
    setKeyDetails: (val: string) => void;
    setKeyDetailsWordCount: (val: number) => void;
    countWordsFromHtml: (html: string) => number;
    mounted: boolean;
    handleDownloadDOCX: () => void;
    handleDownloadPDF: () => void;
    downloadingDocx: boolean;
    downloadingPdf: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    genResult,
    setGenResult,
    setKeyDetails,
    setKeyDetailsWordCount,
    countWordsFromHtml,
    mounted,
    handleDownloadDOCX,
    handleDownloadPDF,
    downloadingDocx,
    downloadingPdf
}) => {
    const [quillInstance, setQuillInstance] = React.useState<any>(null);
    const [selection, setSelection] = React.useState<{ index: number, length: number } | null>(null);
    const [selectionPosition, setSelectionPosition] = React.useState<{ top: number, left: number, width: number, height: number } | null>(null);
    const [isRefinePopoverOpen, setIsRefinePopoverOpen] = React.useState(false);
    const [refineInstruction, setRefineInstruction] = React.useState("");
    const [isRefining, setIsRefining] = React.useState(false);

    useEffect(() => {
        // Register custom fonts with Quill
        if (typeof window !== 'undefined') {
            try {
                const Quill = require('quill').default;
                const Font = Quill.import('formats/font');
                Font.whitelist = ['', 'serif', 'monospace', 'roboto', 'montserrat', 'playfair', 'lora', 'arial', 'sourcesans'];
                Quill.register(Font, true);
            } catch (e) {
                console.error('Quill registration failed:', e);
            }
        }
    }, []);

    const handleRefineSelection = async () => {
        if (!selection || !refineInstruction || !quillInstance) return;

        setIsRefining(true);
        try {
            const selectedText = quillInstance.getText(selection.index, selection.length);
            const response = await fetch("/api/refine-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullDocument: genResult,
                    selectedText,
                    instruction: refineInstruction
                })
            });

            const data = await response.json();
            if (data.content) {
                // Surgical replacement in the editor
                quillInstance.deleteText(selection.index, selection.length);
                quillInstance.clipboard.dangerouslyPasteHTML(selection.index, data.content);

                setIsRefinePopoverOpen(false);
                setSelection(null);
                setSelectionPosition(null);
                setRefineInstruction("");
            }
        } catch (err) {
            console.error("Refinement error:", err);
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Preview Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                    <h2 className="text-lg font-bold text-tclens-500 tracking-tight">Intelligence preview</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Real-time neural render</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleDownloadDOCX}
                        disabled={!genResult || downloadingDocx}
                        className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white hover:bg-tclens-50 border border-tclens-200 text-tclens-600 flex items-center gap-2 transition-all disabled:opacity-30"
                    >
                        {downloadingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        DOCX
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={!genResult || downloadingPdf}
                        className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white hover:bg-tclens-50 border border-tclens-200 text-tclens-600 flex items-center gap-2 transition-all disabled:opacity-30"
                    >
                        {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        PDF
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-slate-50/50 p-6 md:p-14 overflow-y-auto custom-scrollbar">
                {!genResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-slate-200 opacity-60">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-tight">Preview Pending</h3>
                        <p className="text-xs mt-2 max-w-xs text-slate-400 font-bold uppercase tracking-widest">Neural draft sequence initialization required.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-none border border-slate-200 min-h-full flex flex-col">
                        {mounted ? (
                            <div className="quill-wrapper flex-1 flex flex-col">
                                <div className="relative flex-1 flex flex-col min-h-0">
                                    <ReactQuill
                                        forwardedRef={(el: any) => { if (el) setQuillInstance(el.getEditor()); }}
                                        value={genResult}
                                        onChange={(content: string) => {
                                            setGenResult(content);
                                            setKeyDetails(content);
                                            setKeyDetailsWordCount(countWordsFromHtml(content));
                                        }}
                                        onChangeSelection={(range: any) => {
                                            if (range && range.length > 0 && quillInstance) {
                                                setSelection(range);
                                                try {
                                                    const bounds = quillInstance.getBounds(range.index, range.length);
                                                    setSelectionPosition(bounds);
                                                } catch (e) {
                                                    console.error("Failed to get bounds", e);
                                                }
                                            }
                                        }}
                                        placeholder="Generated content will appear here..."
                                        theme="snow"
                                        modules={{
                                            toolbar: [
                                                [{ 'font': ['', 'serif', 'monospace', 'roboto', 'montserrat', 'playfair', 'lora', 'arial', 'sourcesans'] }],
                                                ['bold', 'italic', 'underline'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'header': [1, 2, false] }],
                                                [{ 'color': [] }, { 'background': [] }],
                                                ['link'],
                                                ['clean']
                                            ]
                                        }}
                                        className="flex-1 overflow-y-auto custom-scrollbar quill-custom-height"
                                    />

                                    {/* AI Refine Floating Button */}
                                    {selection && selection.length > 0 && selectionPosition && !isRefinePopoverOpen && (
                                        <div
                                            className="absolute z-50 animate-in fade-in zoom-in duration-200"
                                            style={{
                                                top: `${selectionPosition.top + selectionPosition.height + 10}px`,
                                                left: `${Math.min(selectionPosition.left, 500)}px`
                                            }}
                                        >
                                            <Button
                                                onClick={() => setIsRefinePopoverOpen(true)}
                                                className="bg-tclens-500 hover:bg-tclens-600 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest h-auto border-2 border-white"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Refine selection
                                            </Button>
                                        </div>
                                    )}

                                    {/* AI Refine Overlay (Floating) */}
                                    {isRefinePopoverOpen && selectionPosition && (
                                        <div
                                            className="absolute z-[60] p-2 animate-in fade-in slide-in-from-top-2 duration-300"
                                            style={{
                                                top: `${selectionPosition.top + selectionPosition.height + 10}px`,
                                                left: `${Math.max(20, Math.min(selectionPosition.left - 100, 400))}px`,
                                                width: '100%',
                                                maxWidth: '380px'
                                            }}
                                        >
                                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-tclens-500/10 flex items-center justify-center text-tclens-600">
                                                            <Wand2 className="w-3.5 h-3.5" />
                                                        </div>
                                                        <h4 className="text-xs font-bold text-slate-900 tracking-tight">Neural Refinement</h4>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => { setIsRefinePopoverOpen(false); setSelection(null); setSelectionPosition(null); }}
                                                        className="rounded-full h-7 w-7 hover:bg-slate-50"
                                                    >
                                                        <X className="w-3.5 h-3.5 text-slate-400" />
                                                    </Button>
                                                </div>

                                                <textarea
                                                    autoFocus
                                                    value={refineInstruction}
                                                    onChange={(e) => setRefineInstruction(e.target.value)}
                                                    placeholder="Specify the transformation..."
                                                    className="w-full min-h-[80px] p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-tclens-500/20 focus:border-tclens-500 transition-all resize-none custom-scrollbar"
                                                />

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleRefineSelection}
                                                        disabled={!refineInstruction || isRefining}
                                                        className="flex-1 bg-tclens-500 hover:bg-tclens-600 text-white rounded-lg font-bold text-[10px] uppercase h-10 flex items-center justify-center gap-2"
                                                    >
                                                        {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                        {isRefining ? 'Synthesizing...' : 'Apply Change'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <style jsx global>{`
                                    .quill-custom-height { display: flex; flex-direction: column; height: 100%; border: none !important; }
                                    .quill-custom-height .ql-container { flex: 1; overflow-y: auto; font-family: 'Times New Roman', Times, serif !important; font-size: 16px; border: none !important; }
                                    .ql-editor { font-size: 16px !important; line-height: 1.6 !important; padding: 60px 80px !important; height: 100%; color: #000 !important; }
                                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f5f9 !important; padding: 16px 24px !important; background: #fff !important; sticky; top: 0; z-index: 10; }
                                    .ql-snow .ql-picker.ql-font { width: 140px !important; margin-right: 12px !important; }
                                    .ql-snow .ql-formats { margin-right: 18px !important; display: inline-flex !important; items-center !important; }
                                    .ql-toolbar.ql-snow .ql-formats:last-child { margin-right: 0 !important; }

                                    /* Font Definitions */
                                    .ql-font-arial { font-family: Arial, sans-serif !important; }
                                    .ql-font-playfair { font-family: 'Playfair Display', serif !important; }
                                    .ql-font-roboto { font-family: 'Roboto', sans-serif !important; }
                                    .ql-font-montserrat { font-family: 'Montserrat', sans-serif !important; }
                                    .ql-font-sourcesans { font-family: var(--font-source-sans), sans-serif !important; }
                                    .ql-font-serif { font-family: serif !important; }
                                    .ql-font-monospace { font-family: monospace !important; }

                                    /* Toolbar Picker Labels */
                                    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="sourcesans"]::before,
                                    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="sourcesans"]::before {
                                        content: 'Source Sans' !important;
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-tclens-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
