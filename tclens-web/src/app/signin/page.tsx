'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 600));
            // FUTURE: Replace with real user lookup and auth call
            auth.signIn(email);
            router.push("/app/document");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold mb-4 hover:gap-3 transition-all">
                        ← Back to Home
                    </Link>
                    <div className="w-16 h-16 bg-legal-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-legal-navy/20">
                        <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-black text-legal-navy font-outfit">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to access your analyzed documents.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-100">
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-14 rounded-xl focus-visible:ring-legal-navy transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-14 rounded-xl focus-visible:ring-legal-navy transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-legal-navy hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-legal-navy/10 transition-all group"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                            {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account? <Link href="/signup" className="text-legal-navy font-bold hover:underline">Create one for free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
