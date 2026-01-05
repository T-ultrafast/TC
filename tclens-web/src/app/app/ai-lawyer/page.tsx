"use client";

import { useState, useRef, useEffect } from "react";
import {
    Bot,
    Send,
    User,
    Shield,
    Scale,
    Info,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AILawyerPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your TCLens AI Legal Assistant. I can help you understand legal terms, explain complex clauses, or provide general legal information. How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    messages: [...messages, { role: "user", content: userMsg }]
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
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-legal-navy rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-legal-navy font-outfit">AI Legal Assistant</h1>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            GDRP Compliant
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                            msg.role === "user" ? "bg-legal-navy" : "bg-white border border-slate-100"
                        )}>
                            {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div className={cn(
                            "p-4 rounded-[1.5rem] text-sm leading-relaxed whitespace-pre-wrap",
                            msg.role === "user"
                                ? "bg-legal-navy text-white rounded-tr-none"
                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                        )}>
                            {msg.role === "assistant" ? (
                                <div className="markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-4 max-w-[85%] mr-auto animate-pulse">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="p-4 rounded-[1.5rem] rounded-tl-none bg-white border border-slate-200 text-slate-400 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            AI is thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 space-y-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-4 px-4 pb-4 mt-auto">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask anything about legal terms, contracts, or your rights..."
                        className="w-full h-14 pl-6 pr-16 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-legal-navy focus:border-transparent outline-none shadow-xl shadow-slate-200/50 transition-all placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 h-10 w-10 bg-legal-navy hover:bg-slate-800 disabled:bg-slate-300 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                    <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-800 leading-tight italic font-medium">
                        <strong>Disclaimer:</strong> This assistant provides general legal information using AI. It is <strong>NOT</strong> a substitute for professional legal advice from a qualified attorney.
                    </p>
                </div>
            </div>
        </div>
    );
}
