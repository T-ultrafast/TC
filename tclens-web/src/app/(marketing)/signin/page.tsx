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
        <div className="relative flex flex-col items-center justify-center p-6 pt-32 overflow-hidden bg-background flex-1">
            {/* Background Haze Effects - Subtle in light mode */}
            <div className="bg-haze">
                <div className="haze-gradient-1" />
                <div className="haze-gradient-2" />
            </div>

            <div className="max-w-[480px] w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Auth Card */}
                <div className="bg-background rounded-none p-10 shadow-2xl border border-border relative">
                    <div className="text-center space-y-2 mb-10">
                        <h1 className="text-4xl font-black text-foreground font-playfair tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground font-medium text-sm">Sign in to your account to continue analyzing documents</p>
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
                                className="flex items-center justify-center h-14 rounded-none border border-border hover:bg-muted/50 hover:border-emerald-500/30 transition-all duration-300 group"
                            >
                                <provider.icon className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                            </button>
                        ))}
                    </div>

                    <div className="relative mb-8 text-center px-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <span className="relative bg-background px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Or continue with
                        </span>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-12 h-14 rounded-none border-border bg-muted/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-12 h-14 rounded-none border-border bg-muted/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
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
                                    className="w-4 h-4 border-border text-emerald-600 focus:ring-emerald-500 transition-all"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-xs font-bold text-muted-foreground">Remember me</span>
                            </label>
                            <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold text-lg shadow-xl transition-all"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2 animate-pulse">
                                    Verifying...
                                </span>
                            ) : (
                                "Commence Analysis"
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm font-bold text-muted-foreground">
                            Don’t have an account? <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4">Sign up for free</Link>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center px-10">
                    <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-[0.05em]">
                        Protected by industry-standard encryption. <br />
                        We never store or share your data.
                    </p>
                </div>
            </div>
        </div>
    );
}
