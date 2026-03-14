'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { AuthAnimation } from '@/components/AuthAnimation';

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Detect errors from social login redirects
    const urlError = searchParams.get("error");

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Bypassing auth for design
        setTimeout(() => {
            router.push("/app/document");
        }, 500);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        // Bypassing auth for design
        setTimeout(() => {
            router.push("/app/document");
        }, 500);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-jakarta pt-14">
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Friendly Brand Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col justify-center p-12 border-r border-slate-100/50"
                >
                    <div className="orb-1 opacity-10 -top-40 -left-40 scale-150 bg-tclens-100" />

                    <AuthAnimation title="Your legal assistant, reimagined." />
                </motion.div>

                {/* Right Side: Modern Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-20 lg:px-24 bg-white"
                >
                    <div className="max-w-md w-full mx-auto space-y-8">

                        {(error || urlError) && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-sm font-semibold text-red-700">{error || urlError}</p>
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Login with Google
                            </Button>

                            <div className="relative py-2 flex items-center justify-center">
                                <span className="absolute w-full h-[1px] bg-slate-100"></span>
                                <span className="relative bg-white px-4 text-xs font-bold text-slate-400">OR EMAIL</span>
                            </div>

                            <form onSubmit={handleSignIn} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-tclens-500 transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-bold text-slate-700">Password</label>
                                        <button type="button" className="text-xs font-bold text-tclens-500 hover:text-tclens-600 transition-colors">Forgot?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-tclens-500 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tclens-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Login
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-sm font-medium text-slate-500">
                                Don't have an account? <Link href="/signup" className="text-tclens-500 font-bold hover:text-tclens-600 transition-colors ml-1">Sign Up Free</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-tclens-600 text-white font-bold animate-pulse">Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}
