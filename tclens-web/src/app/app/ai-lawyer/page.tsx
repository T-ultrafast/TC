"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import {
    Bot,
    Send,
    User,
    Shield,
    Scale,
    Loader2
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    role: "user" | "assistant";
    content: string;
};

function AILawyerContent() {
    const searchParams = useSearchParams();
    const analysisId = searchParams.get('analysisId');
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your TCLens AI Legal Assistant. I can help you understand legal terms, explain complex clauses, or provide general legal information. How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [contextLoaded, setContextLoaded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (analysisId && !contextLoaded) {
            const loadContext = async () => {
                try {
                    const response = await fetch(`/api/analysis/${analysisId}`);
                    if (response.ok) {
                        const data = await response.json();
                        const result = data.analysisResult || data.result;
                        if (result) {
                            const summary = typeof result.summary === 'string' 
                                ? result.summary.substring(0, 300) + "..." 
                                : "a document";
                            
                            setMessages([
                                { 
                                    role: "assistant", 
                                    content: `I've successfully linked your recent analysis session. I am now calibrated with the following document context:\n\n> ${summary}\n\nWhat specifics would you like to discuss from this document?` 
                                }
                            ]);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load context:", err);
                } finally {
                    setContextLoaded(true);
                }
            };
            loadContext();
        }
    }, [analysisId, contextLoaded]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch("/api/ai-lawyer-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMsg }],
                    analysisId 
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Chat failed");

            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-12rem)] flex flex-col animate-in fade-in duration-500 -mt-2 md:mt-0 pt-0 px-1">
            {/* Chat Area - Page Level Scroll */}
            <div
                ref={scrollRef}
                className="flex-1 space-y-5 md:space-y-6 bg-slate-50/10 p-3 md:p-4 transition-all"
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                            msg.role === "user" ? "ml-auto" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "flex flex-col gap-1 w-full",
                            msg.role === "user" ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "p-3 md:p-4 text-[13px] md:text-sm leading-snug",
                                msg.role === "user"
                                    ? "bg-tclens-500 text-white rounded-lg md:rounded-xl rounded-tr-none shadow-sm"
                                    : "bg-transparent text-slate-700 font-medium px-0"
                            )}>
                                {msg.role === "assistant" ? (
                                    <div className="prose prose-slate prose-xs md:prose-sm max-w-none text-current leading-snug break-words">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <span className="break-words font-medium">{msg.content}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-4 max-w-[85%] mr-auto animate-pulse">
                        <div className="p-3 md:p-4 rounded-lg md:rounded-xl rounded-tl-none bg-white border border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-sm">
                            <span className="flex gap-1">
                                <span className="w-1 h-1 md:w-1.2 md:h-1.2 bg-tclens-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1 h-1 md:w-1.2 md:h-1.2 bg-tclens-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1 h-1 md:w-1.2 md:h-1.2 bg-tclens-500 rounded-full animate-bounce" />
                            </span>
                            Thinking...
                        </div>
                    </div>
                )}
                {/* Spacer to prevent overlap on mobile */}
                <div className="h-40 md:h-10" />
            </div>

            {/* Sticky Input Area */}
            <div className="sticky bottom-0 md:relative shrink-0 space-y-3 pt-4 border-t border-slate-100 bg-white/95 backdrop-blur-xl -mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10 pb-4 md:pb-6 mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="relative group max-w-[1600px] mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Inquire about legal terms..."
                        className="w-full h-12 md:h-14 pl-4 md:pl-6 pr-14 md:pr-16 bg-white border border-slate-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:ring-4 focus:ring-tclens-500/5 focus:border-tclens-500 outline-none shadow-md transition-all placeholder:text-muted-foreground"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-1.5 top-1.5 h-9 w-9 md:h-11 md:w-11 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg md:rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg group"
                    >
                        <Send className="w-4 h-4 text-tclens-400 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="max-w-[1600px] mx-auto p-2 bg-amber-50/30 rounded-lg md:rounded-xl border border-amber-100/30 flex items-center gap-2">
                    <Scale className="w-3 h-3 text-amber-500 shrink-0 opacity-50" />
                    <p className="text-[9px] md:text-[10px] text-amber-800/60 leading-tight italic font-medium">
                        Info only; not legal advice.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AILawyerPage() {
    return (
        <Suspense fallback={
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-tclens-600" />
            </div>
        }>
            <AILawyerContent />
        </Suspense>
    );
}
