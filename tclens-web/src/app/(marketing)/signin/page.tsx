'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Lock,
    ArrowRight,
    FileText,
    Github,
    Chrome,
    Apple
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            auth.signIn(email);
            router.push("/app/document");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-6 pt-32 overflow-hidden bg-white flex-1">
            {/* Background Gradient / Wash */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-purple-50 via-white to-white blur-3xl opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-50/40 via-white to-white blur-3xl opacity-40" />
            </div>

            <div className="max-w-[480px] w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Auth Card */}
                <div className="bg-white rounded-[1.5rem] p-10 shadow-2xl shadow-purple-500/5 border border-slate-100 relative">
                    <div className="text-center space-y-2 mb-10">
                        <h1 className="text-3xl font-black text-slate-900 font-outfit">Welcome back</h1>
                        <p className="text-slate-500 font-medium">Sign in to your account to continue analyzing documents</p>
                    </div>

                    {/* Social Sign-In Row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { icon: Chrome, label: 'Google' },
                            { icon: Github, label: 'GitHub' },
                            { icon: Apple, label: 'Apple' }
                        ].map((provider) => (
                            <button
                                key={provider.label}
                                className="flex items-center justify-center h-14 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-purple-200 hover:shadow-sm transition-all duration-200 group"
                            >
                                <provider.icon className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors" />
                            </button>
                        ))}
                    </div>

                    <div className="relative mb-8 text-center px-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <span className="relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Or continue with
                        </span>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-purple-600/20 focus:border-purple-600 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-purple-600/20 focus:border-purple-600 transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600 transition-all"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me for 30 days</span>
                            </label>
                            <button type="button" className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-15 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2 animate-pulse">
                                    Verifying...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm font-bold text-slate-500">
                            Don’t have an account? <Link href="/signup" className="text-purple-600 hover:text-purple-700 transition-colors">Sign up for free</Link>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center px-10">
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-[0.05em]">
                        Protected by industry-standard encryption. <br />
                        We never store or share your data.
                    </p>
                </div>
            </div>
        </div>
    );
}
