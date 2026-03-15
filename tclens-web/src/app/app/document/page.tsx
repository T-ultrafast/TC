"use client";

import React, { useState, useEffect } from "react";
import {
    Upload, FileText, Zap, AlertTriangle, Check, ChevronRight,
    Loader2, Search, Link as LinkIcon, Type as TypeIcon,
    CheckCircle, Globe, Plus, Download, Scale, ArrowRight,
    Sparkles, Save, Info, BrainCircuit, MessageCircle,
    ShieldAlert, MessageSquare, User, SendHorizonal, ArrowUpRight,
    Calendar, MessageSquareCode, LayoutDashboard
} from "lucide-react";
import { Country, State } from 'country-state-city';
import { auth } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import 'react-quill-new/dist/quill.snow.css';
import './document.css';
import { AnalysisHistory } from "@/components/document/AnalysisHistory";
import { AnalysisResults } from "@/components/document/AnalysisResults";
import { DocumentBuilder } from "@/components/document/DocumentBuilder";
import { DocumentPreview } from "@/components/document/DocumentPreview";
import { AnalysisForm } from "@/components/document/AnalysisForm";
import { Overview } from "@/components/document/Overview";


// Dynamically import ReactQuill with SSR disabled to prevent findDOMNode error
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
}, {
    ssr: false,
    loading: () => <div className="min-h-[200px] bg-muted/30 rounded-none border border-border flex items-center justify-center">
        <div className="text-sm text-muted-foreground font-medium">Loading editor...</div>
    </div>
});
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";
import { DOCUMENT_PARAMS_MAP, DEFAULT_PARAMS, DOCUMENT_CATEGORIES } from "@/lib/document-params";

const LIMITS = {
    ANONYMOUS: 200,
    FREE_USER: 1000,
    PREMIUM: 5000,
    UNLIMITED: Infinity
};

const countWords = (str: string) => {
    return str.trim().split(/\s+/).length;
};

const countWordsFromHtml = (html: string) => {
    // Strip HTML tags and count words
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
};

const getUsage = (loggedIn: boolean) => {
    if (typeof window === 'undefined') return 0;
    const key = loggedIn ? 'tclens_usage_user' : 'tclens_usage_anon';
    return parseInt(localStorage.getItem(key) || '0');
};

const trackUsage = (count: number, loggedIn: boolean) => {
    const key = loggedIn ? 'tclens_usage_user' : 'tclens_usage_anon';
    const current = getUsage(loggedIn);
    localStorage.setItem(key, (current + count).toString());
};


function DocumentPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usage, setUsage] = useState(0);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [tab, setTab] = useState("overview"); // overview | analyze | generate
    const [isVerifiedHandshake, setIsVerifiedHandshake] = useState(false);
    const EXTENSION_ONLY = process.env.NEXT_PUBLIC_EXTENSION_ONLY === "true";

    // Analysis State
    const [inputMode, setInputMode] = useState("paste"); // paste | upload | link
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetchingStage, setFetchingStage] = useState("idle"); // idle | fetching | extracting | analyzing | completed
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [currentWordCount, setCurrentWordCount] = useState(0);

    const [jurisdiction, setJurisdiction] = useState("");
    const [geoState, setGeoState] = useState(""); // State/Region

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Bypassing auth for design
        const currentUser = {
            firstName: "Demo",
            lastName: "User",
            email: "demo@tclens.com",
            plan: "premium"
        };
        setUser(currentUser);
        setIsLoggedIn(true);
        const loggedIn = true;
        setIsLoggedIn(loggedIn);
        setUsage(getUsage(loggedIn));

        // Load saved jurisdiction & state
        const savedJurisdiction = localStorage.getItem("tclens-jurisdiction");
        const savedState = localStorage.getItem("tclens-geo-state");

        if (savedJurisdiction) {
            setJurisdiction(savedJurisdiction);
            if (savedState) {
                // For country-state-city, we don't strictly need to validate here as it will be handled by the dropdowns
                setGeoState(savedState);
            }
        }

        // Listen for extension handshake
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === "TCLENS_HANDSHAKE") {
                console.log("TCLens: Verified Extension Handshake received");
                setIsVerifiedHandshake(true);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const searchParams = useSearchParams();
    const reportId = searchParams.get('report_id');

    useEffect(() => {
        if (reportId && reportId !== 'new') {
            const loadReport = async () => {
                setLoading(true);
                setFetchingStage("fetching");
                try {
                    const response = await fetch(`/api/analysis/${reportId}`);
                    if (!response.ok) throw new Error("Failed to load report");
                    const data = await response.json();

                    // Map data to state
                    setResult(data.analysisResult);
                    setAnalysisId(data.id);
                    setFetchingStage("completed");
                } catch (err) {
                    console.error("Error loading report from URL:", err);
                    setError("Could not load the report. It may have expired or the link is invalid.");
                    setFetchingStage("idle");
                } finally {
                    setLoading(false);
                }
            };
            loadReport();
        }
    }, [reportId]);

    const handleJurisdictionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setJurisdiction(value);
        localStorage.setItem("tclens-jurisdiction", value);

        // Reset state when jurisdiction changes
        setGeoState("");
        localStorage.removeItem("tclens-geo-state");
    };

    const handleGeoStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setGeoState(value);
        if (value) localStorage.setItem("tclens-geo-state", value);
        else localStorage.removeItem("tclens-geo-state");
    };

    const fetchHistory = async () => {
        const loggedInUser = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
        if (!loggedInUser) return;

        try {
            const response = await fetch('/api/analysis', {
                headers: {
                    'x-is-logged-in': 'true',
                    'x-user-id': loggedInUser.email
                }
            });
            const data = await response.json();
            if (data.ok) setHistory(data.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const fetchChatMessages = async (id: string) => {
        const userId = user?.email || 'anonymous';
        const isLoggedInVal = !!user;

        try {
            const response = await fetch(`/api/analysis/${id}/chat`, {
                headers: {
                    'x-is-logged-in': isLoggedInVal.toString(),
                    'x-user-id': userId
                }
            });
            const data = await response.json();
            if (data.ok) setChatMessages(data.data);
        } catch (err) {
            console.error("Failed to fetch chat:", err);
        }
    };

    // Effect for real-time word count in paste/link mode
    useEffect(() => {
        if (inputMode === "paste") {
            setCurrentWordCount(countWords(text));
        } else if (inputMode === "link" && result) {
            setCurrentWordCount((result as any).wordCount || 0);
        } else {
            setCurrentWordCount(0);
        }
    }, [text, inputMode, result]);

    const plan = user?.plan || "free";

    let currentLimit = LIMITS.ANONYMOUS;
    if (isLoggedIn) {
        // Force unlimited for any logged in user during dev
        currentLimit = LIMITS.UNLIMITED;
    }

    const usagePercentage = currentLimit === Infinity ? 0 : Math.min(100, (usage / currentLimit) * 100);
    const isOverLimit = currentLimit === Infinity ? false : (usage + currentWordCount) > currentLimit;

    // Generation State
    const [genType, setGenType] = useState("");
    const [genResult, setGenResult] = useState<string | null>(null);
    const [genLoading, setGenLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mobileGenView, setMobileGenView] = useState<'builder' | 'preview'>('builder');
    const [genJurisdiction, setGenJurisdiction] = useState("");
    const [genState, setGenState] = useState("");
    const [keyDetails, setKeyDetails] = useState("");
    const [keyDetailsWordCount, setKeyDetailsWordCount] = useState(0);
    const [customParams, setCustomParams] = useState<Record<string, string>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [useWatermark, setUseWatermark] = useState(false);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [mounted, setMounted] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [hasSavedDraft, setHasSavedDraft] = useState(false);
    const [savedDraftTime, setSavedDraftTime] = useState<string | null>(null);
    const [downloadingDocx, setDownloadingDocx] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const currentFields = DOCUMENT_PARAMS_MAP[genType] || [];
    const handleParamChange = (key: string, val: string) => {
        setCustomParams(prev => ({ ...prev, [key]: val }));
    };

    useEffect(() => {
        setMounted(true);
        const savedRaw = localStorage.getItem("tclens-doc-draft");
        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                if (parsed && parsed.timestamp) {
                    setHasSavedDraft(true);
                    setSavedDraftTime(new Date(parsed.timestamp).toLocaleString());
                }
            } catch (e) { }
        }
    }, []);

    const handleSaveDraft = () => {
        const draftData = {
            timestamp: new Date().toISOString(),
            wizardStep,
            genType,
            genJurisdiction,
            genState,
            keyDetails,
            customParams
        };
        localStorage.setItem("tclens-doc-draft", JSON.stringify(draftData));
        setHasSavedDraft(true);
        setSavedDraftTime(new Date().toLocaleString());
    };

    const handleResumeDraft = () => {
        const savedRaw = localStorage.getItem("tclens-doc-draft");
        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                setWizardStep(parsed.wizardStep || 1);
                setGenType(parsed.genType || "");
                setGenJurisdiction(parsed.genJurisdiction || "");
                setGenState(parsed.genState || "");
                setKeyDetails(parsed.keyDetails || "");
                setCustomParams(parsed.customParams || {});
            } catch (e) { }
        }
    };

    const handleAnalyze = async () => {
        if (inputMode === "upload" && !file) return;
        if (inputMode === "paste" && !text.trim()) return;
        if (inputMode === "link" && !linkUrl.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setFetchingStage("idle");

        try {
            let textToAnalyze = text;
            let finalSourceName = "";

            if (inputMode === "link") {
                setFetchingStage("fetching");
                const extractResponse = await fetch("/api/extract-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: linkUrl, jurisdiction })
                });

                const extractData = await extractResponse.json();
                if (!extractResponse.ok) throw new Error(extractData.error || "Failed to extract content from URL");

                textToAnalyze = extractData.data.extractedText;
                finalSourceName = extractData.data.title || new URL(linkUrl).hostname;
                setFetchingStage("extracting");
            }

            setFetchingStage("analyzing");
            const formData = new FormData();
            formData.append("mode", inputMode === "link" ? "paste" : inputMode);
            formData.append("jurisdiction", jurisdiction);
            if (geoState) formData.append("state", geoState);

            if (inputMode === "upload" && file) {
                formData.append("file", file);
            } else if (inputMode === "paste" || inputMode === "link") {
                formData.append("text", textToAnalyze);
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
                headers: {
                    'x-usage': usage.toString(),
                    'x-is-logged-in': isLoggedIn.toString(),
                    'x-plan': plan,
                    'x-user-id': user?.email || 'anonymous'
                }
            });

            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const rawText = await response.text();
                throw new Error(rawText.substring(0, 100) || "Server error occurred");
            }

            if (!response.ok || data.ok === false) {
                const errorMessage = data.error || "Analysis failed";
                const errorDetails = data.details ? `: ${data.details}` : "";
                throw new Error(`${errorMessage}${errorDetails}`);
            }

            const analysisData = data.data;
            if (inputMode === "link" && finalSourceName) {
                analysisData.sourceUrl = linkUrl;
                analysisData.sourceName = finalSourceName;
            }

            if (analysisData.wordCount) {
                trackUsage(analysisData.wordCount, isLoggedIn);
                setUsage(getUsage(isLoggedIn));
            }

            // Update analysis results condition to correctly handle EXTENSION_ONLY and isVerifiedHandshake
            if (EXTENSION_ONLY && !isVerifiedHandshake) {
                // If in extension-only mode and not verified, don't set full result
                setError("Analysis results are only available via the browser extension.");
                setFetchingStage("idle");
                return;
            }

            setResult(analysisData);
            setAnalysisId(data.analysisId);
            setIsVerifiedHandshake(true); // Manual analyze counts as verified
            setChatMessages([]);
            if (isLoggedIn) fetchHistory();
            setFetchingStage("completed");
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "Failed to analyze document");
            setFetchingStage("idle");
        } finally {
            setLoading(false);
        }
    };

    const loadHistoryRecord = async (record: any) => {
        setResult(record.analysisResult);
        setAnalysisId(record.id);
        setJurisdiction(record.jurisdiction);
        setInputMode(record.inputType);
        setTab("analyze");
        setError(null);
        fetchChatMessages(record.id);
    };

    const sendChatMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('question') as HTMLInputElement;
        const question = input.value;
        
        if (!question.trim()) return;
        
        if (!analysisId) {
            setError("Analysis context missing. Please wait for the scan to complete or try re-analyzing.");
            return;
        }

        setChatLoading(true);
        const userId = user?.email || 'anonymous';
        const isLoggedInVal = !!user;

        try {
            // Optimistic update
            const tempUserMsg = { id: Date.now().toString(), role: 'user', content: question, createdAt: new Date().toISOString() };
            setChatMessages(prev => [...prev, tempUserMsg]);
            input.value = '';

            const response = await fetch(`/api/analysis/${analysisId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-is-logged-in': isLoggedInVal.toString(),
                    'x-user-id': userId
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to reach intelligence hub");
            }

            const data = await response.json();
            if (data.ok) {
                setChatMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, data.data]);
            } else {
                setError(data.error || "Failed to get AI response");
            }
        } catch (err: any) {
            console.error("Chat error:", err);
            setError(err.message || "The intelligence service is currently unavailable.");
        } finally {
            setChatLoading(false);
        }
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        const chatContainer = document.getElementById('chat-messages-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatMessages, chatLoading]);

    const handleGenerate = async () => {
        setGenLoading(true);
        setGenResult("");
        setError(null);
        try {
            const response = await fetch("/api/generate-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: genType,
                    jurisdiction: genJurisdiction,
                    state: genState,
                    keyDetails: keyDetails,
                    customParams: customParams,
                    currentDate: new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Generation failed");

            // Directly update the keyDetails editor with the generated content
            setKeyDetails(data.content);
            setGenResult(data.content);
            setKeyDetailsWordCount(countWordsFromHtml(data.content));

            // On mobile, automatically switch to preview view once generated
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setMobileGenView('preview');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenLoading(false);
        }
    };

    const handleClearAll = () => {
        setGenResult("");
        setKeyDetails("");
        setKeyDetailsWordCount(0);
        setGenType("");
        setGenJurisdiction("");
        setGenState("");
        setCustomParams({});
        setLogoFile(null);
        setSignatureFile(null);
        setError(null);
        setWizardStep(1);
    };

    const handleDownloadDocx = async () => {
        if (!genResult) return;
        setDownloadingDocx(true);
        try {
            // Include logos and signature right into the HTML that is sent to our backend converter
            let logoHtml = '';
            let signatureHtml = '';

            if (logoFile) {
                const logoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoFile);
                });

                if (useWatermark) {
                    logoHtml = `<div style="text-align:center; margin-bottom: 30px;"><img src="${logoBase64}" style="width: 120px; max-height: 80px; object-fit: contain; opacity:0.3;" alt="logo watermark" /></div>`;
                } else {
                    logoHtml = `<div style="text-align:center; margin-bottom: 30px;"><img src="${logoBase64}" style="width: 100px; max-height: 60px; object-fit: contain;" alt="logo" /></div>`;
                }
            }

            if (signatureFile) {
                const sigBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(signatureFile);
                });

                let signedBy = "Signatory";
                if (customParams["employeeName"] || customParams["partyA"]) {
                    signedBy = customParams["employeeName"] || customParams["partyA"] || "Signatory";
                }

                signatureHtml = `
                    <br/><br/>
                    <p style="font-weight: bold; margin-bottom: 20px;">IN WITNESS WHEREOF:</p>
                    <img src="${sigBase64}" width="150" alt="Signature" style="margin-bottom: 5px;" />
                    <p style="margin: 0;">____________________________</p>
                    <p style="margin-top: 5px;">${signedBy}</p>
                `;
            }

            // Also capture the current edited state of the document (ReactQuill outputs clean HTML)
            const fullHtml = `
                ${logoHtml}
                ${genResult}
                ${signatureHtml}
            `;

            const res = await fetch('/api/download-docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: fullHtml, title: genType })
            });

            if (!res.ok) throw new Error("Failed to export Word file. Server error.");

            const blob = await res.blob();
            saveAs(blob, `${genType.replace(/\s+/g, '_')}_Draft.docx`);
        } catch (err) {
            console.error("DOCX Export Error:", err);
            setError("Failed to generate DOCX file.");
        }
    };

    const handleDownloadPdf = async () => {
        if (!keyDetails) return;
        setDownloadingPdf(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;

            let logoHtml = '';
            let signatureHtml = '';

            if (logoFile) {
                const logoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoFile);
                });
                logoHtml = `<div style="text-align:center; margin-bottom: 30px;"><img src="${logoBase64}" style="width: 100px; max-height: 60px; object-fit: contain;" alt="logo" /></div>`;
            }

            if (signatureFile) {
                const sigBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(signatureFile);
                });
                let signedBy = customParams["employeeName"] || customParams["partyA"] || "Signatory";
                signatureHtml = `
                    <div style="margin-top: 40px; page-break-inside: avoid;">
                        <p style="font-weight: 800; font-size: 10pt; color: #1a202c; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">Execution</p>
                        <div style="display: flex; flex-direction: column;">
                            <img src="${sigBase64}" style="width: 140px; height: auto; margin-bottom: -10px; margin-left: 10px;" alt="Signature" />
                            <p style="margin: 0; color: #2d3748;">____________________________</p>
                            <p style="margin-top: 8px; font-weight: 700; color: #1a202c; font-size: 10pt;">${signedBy}</p>
                            <p style="margin: 0; font-size: 9pt; color: #718096;">Authorized Signatory</p>
                        </div>
                    </div>
                `;
            }
            let pdfLogoBase64 = '';
            if (logoFile) {
                pdfLogoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoFile);
                });
            }

            const watermarkStyle = (useWatermark && pdfLogoBase64) ? `
                background-image: url(${pdfLogoBase64});
                background-repeat: no-repeat;
                background-position: center;
                background-size: 50%;
                opacity: 0.04;
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                z-index: -1;
            ` : '';

            const contentHtml = `
                <div style="width: 800px; padding: 60px; font-family: 'Source Sans 3', 'Helvetica', 'Arial', sans-serif; color: #1a202c; line-height: 1.6; font-size: 11pt; text-align: justify; background: white; min-height: 1120px; position: relative; box-sizing: border-box; overflow-wrap: break-word;">
                    ${(useWatermark && pdfLogoBase64) ? `<div style="${watermarkStyle}"></div>` : ''}

                    <!-- Letterhead / Header -->
                    <div style="margin-bottom: 50px; border-bottom: 1px solid #edf2f7; padding-bottom: 30px; display: flex; flex-direction: column; align-items: center; width: 100%;">
                        ${(!useWatermark && pdfLogoBase64) ? `<div style="margin-bottom: 20px;"><img src="${pdfLogoBase64}" style="max-height: 70px; max-width: 100%; object-fit: contain;" /></div>` : ''}
                        
                        <h1 style="font-size: 18pt; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #2d3748; text-align: center;">
                            ${genType || 'Legal Agreement'}
                        </h1>
                        <p style="text-align: center; font-size: 9pt; color: #a0aec0; margin-top: 8px; font-weight: 600; letter-spacing: 1px;">OFFICIAL DRAFT • GENERATED VIA TCLENS BRAIN</p>
                    </div>

                    <!-- Body Content -->
                    <div style="margin-bottom: 60px; color: #2d3748; width: 100%;">
                        ${keyDetails}
                    </div>

                    <!-- Execution / Signature -->
                    <div style="margin-top: 80px; page-break-inside: avoid; border-top: 1px solid #edf2f7; padding-top: 40px; width: 100%;">
                        ${signatureHtml}
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 100px; padding-top: 20px; font-size: 8.5pt; color: #cbd5e0; text-align: center; font-weight: 500; width: 100%;">
                        This document was generated using secure neural drafting protocols and is subject to local governing laws.
                        <br/>&copy; ${new Date().getFullYear()} TcLens Legal Hub. All rights reserved.
                    </div>
                </div>
            `;

            const element = document.createElement('div');
            // Ensure the element is "visible" to the capture engine but hidden from the user
            element.style.position = 'fixed';
            element.style.left = '-2000px';
            element.style.top = '0';
            element.style.zIndex = '-9999';
            element.style.backgroundColor = 'white';
            element.innerHTML = contentHtml;
            document.body.appendChild(element);

            const opt = {
                margin: [0, 0, 0, 0] as [number, number, number, number],
                filename: `${genType?.replace(/\s+/g, '_') || 'Legal_Document'}_Draft.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    windowWidth: 800,
                    width: 800
                },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);
        } catch (err) {
            console.error("PDF Export Error:", err);
            setError("Failed to generate PDF. Make sure you are using a compatible browser.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleDownloadAnalysisPdf = async () => {
        if (!result) return;
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const analysisTitle = result.languageDetection?.primary || 'Legal';
            const riskLabel = result.risk_score > 75 ? "CRITICAL" : result.risk_score > 40 ? "MODERATE" : "MINIMAL";

            // 1. Metrics Grid HTML
            const metricsHtml = `
                <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 12px 0; margin: 30px 0;">
                    <div style="display: table-cell; width: 25%; background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="display: block; font-size: 9px; font-weight: 900; color: #166534; letter-spacing: 1px; margin-bottom: 8px;">PRIVACY</span>
                        <span style="font-size: 24px; font-weight: 900; color: #065f46;">${result.fairness_metrics?.privacy || 0}/10</span>
                    </div>
                    <div style="display: table-cell; width: 25%; background: #fffcf0; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="display: block; font-size: 9px; font-weight: 900; color: #92400e; letter-spacing: 1px; margin-bottom: 8px;">LIABILITY</span>
                        <span style="font-size: 24px; font-weight: 900; color: #78350f;">${result.fairness_metrics?.liability || 0}/10</span>
                    </div>
                    <div style="display: table-cell; width: 25%; background: #f0f9ff; border: 1px solid #e0f2fe; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="display: block; font-size: 9px; font-weight: 900; color: #075985; letter-spacing: 1px; margin-bottom: 8px;">TRANSPARENCY</span>
                        <span style="font-size: 24px; font-weight: 900; color: #0c4a6e;">${result.fairness_metrics?.transparency || 0}/10</span>
                    </div>
                    <div style="display: table-cell; width: 25%; background: #faf5ff; border: 1px solid #f3e8ff; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="display: block; font-size: 9px; font-weight: 900; color: #6b21a8; letter-spacing: 1px; margin-bottom: 8px;">CONTINUITY</span>
                        <span style="font-size: 24px; font-weight: 900; color: #581c87;">${result.fairness_metrics?.continuity || 0}/10</span>
                    </div>
                </div>
            `;

            // 2. Ambiguity Audit
            let ambiguityHtml = "";
            if (result.ambiguity_audit && result.ambiguity_audit.length > 0) {
                ambiguityHtml = `
                    <h2 style="color: #0f172a; font-size: 16px; margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Ambiguity Audit</h2>
                    ${result.ambiguity_audit.map((a: any) => `
                        <div style="margin-bottom: 15px; border-left: 3px solid #f59e0b; padding-left: 15px; page-break-inside: avoid;">
                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #b45309;">Term: "${a.term}"</p>
                            <p style="margin: 5px 0; font-size: 11px; color: #475569;">${a.risk}</p>
                        </div>
                    `).join('')}
                `;
            }

            // 3. Leverage Matrix
            let leverageHtml = "";
            if (result.user_leverage && result.user_leverage.length > 0) {
                leverageHtml = `
                    <h2 style="color: #0f172a; font-size: 16px; margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Strategic Leverage Matrix</h2>
                    <div style="background: #1e293b; border-radius: 8px; padding: 10px; margin-top: 15px;">
                        ${result.user_leverage.map((l: any) => `
                            <div style="padding: 15px; border-bottom: 1px solid #334155; page-break-inside: avoid;">
                                <p style="margin: 0; font-size: 12px; font-weight: bold; color: #34d399;">${l.point}</p>
                                <p style="margin: 5px 0 0 0; font-size: 10px; color: #94a3b8;">${l.strategy}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // 4. Forensic Gaps
            let gapsHtml = "";
            if (result.missingProtections && result.missingProtections.length > 0) {
                gapsHtml = `
                    <h2 style="color: #059669; font-size: 16px; margin-top: 40px; border-bottom: 2px solid #d1fae5; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Critical Forensic Gaps</h2>
                    ${result.missingProtections.map((g: any) => `
                        <div style="margin-bottom: 20px; page-break-inside: avoid; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                            <div style="background: #f8fafc; padding: 12px; border-bottom: 1px solid #e2e8f0;">
                                <strong style="font-size: 13px; color: #0f172a;">${g.type}</strong>
                            </div>
                            <div style="padding: 15px;">
                                <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b;">${g.description}</p>
                                <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 10px; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 10px; color: #9d174d; font-family: monospace;">REBUTTAL: "${g.fix}"</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `;
            }

            let redFlagsHtml = "";
            if (result.redFlags && result.redFlags.length > 0) {
                redFlagsHtml = `
                    <h2 style="color: #dc2626; font-size: 16px; margin-top: 40px; border-bottom: 2px solid #fee2e2; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Forensic Red Flags</h2>
                    ${result.redFlags.map((f: any) => `
                        <div style="margin-bottom: 20px; padding: 15px; background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #dc2626; border-radius: 8px; page-break-inside: avoid;">
                            <h3 style="margin: 0 0 5px 0; font-size: 13px; color: #991b1b;">${f.title}</h3>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #b91c1c;">${f.description}</p>
                            ${f.implication ? `<p style="margin: 0; font-size: 10px; color: #7f1d1d; font-style: italic; background: white; padding: 6px; border-radius: 4px;"><strong>Forensic Implication:</strong> ${f.implication}</p>` : ''}
                        </div>
                    `).join('')}
                `;
            }

            let clausesHtml = "";
            if (result.clauses && result.clauses.length > 0) {
                clausesHtml = `
                    <h2 style="color: #0f172a; font-size: 16px; margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Clause Extraction Analysis</h2>
                    ${result.clauses.map((c: any) => `
                        <div style="margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
                            <div style="background: #f8fafc; padding: 12px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                                <strong style="font-size: 13px; color: #1e293b;">${c.type}</strong>
                                <span style="font-size: 8px; padding: 3px 10px; border-radius: 100px; background: ${c.riskLevel === 'Critical' ? '#fee2e2' : '#f1f5f9'}; color: ${c.riskLevel === 'Critical' ? '#991b1b' : '#475569'}; font-weight: 900; letter-spacing: 1px;">${c.riskLevel.toUpperCase()} RISK</span>
                            </div>
                            <div style="padding: 15px;">
                                <p style="margin: 0 0 12px 0; font-size: 12px; color: #334155; font-weight: bold;">${c.summary}</p>
                                <div style="display: table; width: 100%; border-spacing: 10px 0;">
                                    <div style="display: table-cell; width: 50%;">
                                        <p style="margin: 0 0 5px 0; font-size: 9px; font-weight: 900; color: #94a3b8; letter-spacing: 1px;">DIAGNOSTIC</p>
                                        <p style="margin: 0; font-size: 11px; color: #64748b; font-style: italic;">${c.explanation}</p>
                                    </div>
                                    <div style="display: table-cell; width: 50%;">
                                        ${c.rebuttal ? `
                                            <p style="margin: 0 0 5px 0; font-size: 9px; font-weight: 900; color: #059669; letter-spacing: 1px;">STRATEGIC COUNTER</p>
                                            <p style="margin: 0; font-size: 11px; color: #047857; font-family: monospace; background: #f0fdf4; padding: 8px; border-radius: 4px;">${c.rebuttal}</p>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `;
            }

            const reportHtml = `
                <div style="padding: 50px; font-family: 'Helvetica', sans-serif; color: #1e293b; line-height: 1.6; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 5px solid #059669; padding-bottom: 20px;">
                        <div style="text-align: left;">
                            <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">TCLens <span style="color: #059669;">Intelligence</span></h1>
                            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 11px; font-weight: bold; letter-spacing: 2px;">AUDIT: #${Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold;">FORENSIC COMPLIANCE DOSSIER</p>
                            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 9px;">EXTRACTED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div style="background-color: #0f172a; padding: 35px; margin-bottom: 40px; border-radius: 12px; color: white;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-size: 10px; font-weight: 900; color: #059669; letter-spacing: 2px; margin-bottom: 10px;">TOTAL RISK COEFFICIENT</div>
                                <div style="display: flex; align-items: baseline; gap: 10px;">
                                    <span style="font-size: 56px; font-weight: 900; color: #fff; line-height: 1;">${result.risk_score}</span>
                                    <span style="font-size: 16px; color: #475569; font-weight: bold;">/ 100</span>
                                </div>
                                ${result.litigation_risk_index ? `<div style="margin-top: 10px; font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">LITIGATION PROB: ${result.litigation_risk_index}%</div>` : ''}
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 10px; font-weight: 900; color: #475569; letter-spacing: 2px; margin-bottom: 10px;">THREAT LEVEL</div>
                                <div style="font-size: 24px; font-weight: 900; color: ${result.risk_score > 75 ? '#ef4444' : result.risk_score > 40 ? '#f59e0b' : '#059669'}">${riskLabel}</div>
                                ${result.financial_exposure ? `<div style="margin-top: 10px; font-size: 10px; color: #ef4444; font-weight: 900; background: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;">EXPOSURE: ${result.financial_exposure}</div>` : ''}
                            </div>
                        </div>
                    </div>

                    ${metricsHtml}

                    <h2 style="color: #0f172a; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">Executive Intelligence Summary</h2>
                    <div style="font-size: 12px; color: #334155; line-height: 1.8; margin-bottom: 40px; white-space: pre-wrap; background: #f8fafc; padding: 25px; border-radius: 10px; border: 1px solid #f1f5f9;">
                        ${result.summary.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; margin-top: 15px; display: block; font-size: 13px;">$1</strong>')}
                    </div>

                    ${redFlagsHtml}
                    ${gapsHtml}

                    ${result.nextSteps && result.nextSteps.length > 0 ? `
                        <h2 style="color: #0f172a; font-size: 16px; margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Strategic Optimization Path</h2>
                        <div style="margin-top: 15px;">
                            ${result.nextSteps.map((step: any) => `
                                <div style="padding: 12px; margin-bottom: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; color: #1e293b; display: flex; align-items: center; gap: 10px;">
                                    <span style="color: #059669; font-weight: 900;">➔</span>
                                    <span>${step}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${ambiguityHtml}
                    ${leverageHtml}
                    ${clausesHtml}
                    
                    <div style="margin-top: 60px; border-top: 2px solid #f1f5f9; padding-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; letter-spacing: 0.5px;">
                        <strong style="color: #64748b; font-size: 10px; display: block; margin-bottom: 6px;">DISCLAIMER & LEGAL PROVISION</strong>
                        This document is a precision AI-generated forensic analysis. It is provided for informational and tactical strategy purposes only and does not constitute formal legal advice, solicitation, or an attorney-client relationship.
                        <br/><br/>&copy; ${new Date().getFullYear()} TCLens Forensic Systems. Digital Signature: ${Math.random().toString(36).substring(2, 12)}
                    </div>
                </div>
            `;

            const element = document.createElement('div');
            element.style.width = '210mm';
            element.innerHTML = reportHtml;
            document.body.appendChild(element);

            const opt = {
                margin: [5, 5, 5, 5] as [number, number, number, number],
                filename: `${analysisTitle}_Analysis_Report.pdf`,
                image: { type: 'jpeg' as const, quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false, letterRendering: true, windowWidth: 794 },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);
        } catch (err) {
            console.error("Analysis PDF Export Error:", err);
            setError("Failed to generate PDF analysis report.");
        }
    };

    const copyToClipboard = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 space-y-6 animate-in fade-in duration-700">
            {/* Workspace Row: Usage & Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                <div className="flex items-center gap-4">
                    <div className="w-1 h-8 bg-tclens-500 rounded-full" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {tab === 'overview' ? 'Intelligence Hub' : tab === 'analyze' ? 'Document Analysis' : 'Precision Builder'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tactical Workspace</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
                    {/* Usage for Others - Not shown on Overview */}
                    {tab !== "overview" && (
                        !isLoggedIn ? (
                            <div className="w-full md:w-56 space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Free Credits</span>
                                    <span className="text-slate-900">{Math.round(usagePercentage)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-700 rounded-full",
                                            usagePercentage > 90 ? "bg-red-500" : "bg-tclens-500"
                                        )}
                                        style={{ width: `${usagePercentage}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setTab("overview")}
                                className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all active:scale-95 group shadow-sm"
                            >
                                <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-tclens-500 transition-colors" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Back to workspace</span>
                            </button>
                        )
                    )}

                </div>
            </div>

            {tab === "overview" ? (
                <Overview
                    user={user}
                    history={history}
                    onAnalyze={() => setTab("analyze")}
                    onGenerate={() => setTab("generate")}
                    loadHistoryRecord={(record) => {
                        loadHistoryRecord(record);
                        setTab("analyze");
                    }}
                />
            ) : tab === "analyze" ? (
                <div className="flex flex-col gap-10 items-stretch">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="w-12 h-12 bg-white rounded-xl border border-red-100 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-bold text-red-900 text-sm italic uppercase tracking-widest">Document Analysis Exception</h4>
                                <p className="text-red-800 text-sm font-medium leading-relaxed">{error}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-100/50 font-bold text-[10px] uppercase tracking-widest"
                            >
                                Dismiss
                            </Button>
                        </div>
                    )}
                    {!showHistory && (
                        <div className="w-full">
                            <AnalysisForm
                                jurisdiction={jurisdiction}
                                handleJurisdictionChange={handleJurisdictionChange}
                                geoState={geoState}
                                handleGeoStateChange={handleGeoStateChange}
                                inputMode={inputMode}
                                setInputMode={setInputMode}
                                text={text}
                                setText={setText}
                                linkUrl={linkUrl}
                                setLinkUrl={setLinkUrl}
                                file={file}
                                handleFileChange={(e) => setFile(e.target.files?.[0] || null)}
                                handleAnalyze={handleAnalyze}
                                loading={loading}
                                isOverLimit={isOverLimit}
                                currentWordCount={currentWordCount}
                                currentLimit={currentLimit}
                                usagePercentage={usagePercentage}
                            />
                        </div>
                    )}

                    <div className="w-full">
                        {showHistory ? (
                            <AnalysisHistory
                                history={history}
                                loadHistoryRecord={loadHistoryRecord}
                                setShowHistory={setShowHistory}
                            />
                        ) : (
                            <AnalysisResults
                                result={result}
                                loading={loading}
                                isVerifiedHandshake={isVerifiedHandshake}
                                EXTENSION_ONLY={EXTENSION_ONLY}
                                chatMessages={chatMessages}
                                chatLoading={chatLoading}
                                handleChatSubmit={sendChatMessage}
                                handleDownloadAnalysisPdf={handleDownloadAnalysisPdf}
                                analysisId={analysisId}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full h-auto flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-40">
                    <div className="w-full bg-white border border-slate-200/60 flex flex-col overflow-hidden transition-all duration-500 rounded-2xl">
                        <DocumentBuilder
                            wizardStep={wizardStep}
                            setWizardStep={setWizardStep}
                            genType={genType}
                            setGenType={setGenType}
                            genJurisdiction={genJurisdiction}
                            setGenJurisdiction={setGenJurisdiction}
                            genState={genState}
                            setGenState={setGenState}
                            currentFields={(DOCUMENT_PARAMS_MAP[genType] || DEFAULT_PARAMS)}
                            customParams={customParams}
                            handleParamChange={(fieldId, value) => setCustomParams(prev => ({ ...prev, [fieldId]: value }))}
                            generationLoading={genLoading}
                            handleGenerate={handleGenerate}
                            documentOptions={DOCUMENT_CATEGORIES}
                            logoFile={logoFile}
                            setLogoFile={setLogoFile}
                            signatureFile={signatureFile}
                            setSignatureFile={setSignatureFile}
                            useWatermark={useWatermark}
                            setUseWatermark={setUseWatermark}
                        />
                    </div>

                    {(wizardStep === 3 || genResult) && (
                        <div className="w-full bg-white animate-in zoom-in-95 fade-in duration-700 rounded-2xl border border-slate-200/60 overflow-hidden">
                            <DocumentPreview
                                genResult={genResult || ""}
                                setGenResult={setGenResult}
                                setKeyDetails={setKeyDetails}
                                setKeyDetailsWordCount={setKeyDetailsWordCount}
                                countWordsFromHtml={countWordsFromHtml}
                                mounted={mounted}
                                handleDownloadDOCX={handleDownloadDocx}
                                handleDownloadPDF={handleDownloadPdf}
                                downloadingDocx={downloadingDocx}
                                downloadingPdf={downloadingPdf}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default dynamic(() => Promise.resolve(DocumentPage), { ssr: false });
