'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Mail,
    Lock,
    User as UserIcon,
    ArrowRight,
    Loader2,
    ChevronLeft,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { AuthAnimation } from '@/components/AuthAnimation';

function SignUpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const urlError = searchParams.get("error");

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = "Enter your first name";
        if (!formData.lastName.trim()) newErrors.lastName = "Enter your last name";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.includes('@')) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Use at least 8 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsLoading(true);
        // Bypassing auth for design
        setTimeout(() => {
            router.push("/app/document");
        }, 500);
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        // Bypassing auth for design
        setTimeout(() => {
            router.push("/app/document");
        }, 500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
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
                    <div className="orb-2 opacity-10 -bottom-40 -right-40 scale-150 bg-tclens-100" />

                    <AuthAnimation title="Join the, revolution." />
                </motion.div>

                {/* Right Side: Modern Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-20 lg:px-24 bg-white relative"
                >
                    <div className="max-w-md w-full mx-auto space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center lg:text-left">Create your account</h2>
                            <div className="flex items-center gap-3">
                                <div className={cn("h-1.5 flex-1 rounded-full bg-slate-100 transition-colors", step >= 1 && "bg-tclens-500")} />
                                <div className={cn("h-1.5 flex-1 rounded-full bg-slate-100 transition-colors", step >= 2 && "bg-tclens-500")} />
                            </div>
                        </div>

                        {(formError || urlError) && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-sm font-semibold text-red-700">{formError || urlError}</p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGoogleSignUp}
                                        disabled={isLoading}
                                        className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign Up with Google
                                    </Button>

                                    <div className="relative py-2 flex items-center justify-center">
                                        <span className="absolute w-full h-[1px] bg-slate-100"></span>
                                        <span className="relative bg-white px-4 text-xs font-bold text-slate-400">OR ENTER DETAILS</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-tclens-500 transition-colors" />
                                                <input
                                                    name="firstName"
                                                    placeholder="Alex"
                                                    className={cn(
                                                        "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400",
                                                        errors.firstName && "border-red-400"
                                                    )}
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-tclens-500 transition-colors" />
                                                <input
                                                    name="lastName"
                                                    placeholder="Hamilton"
                                                    className={cn(
                                                        "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400",
                                                        errors.lastName && "border-red-400"
                                                    )}
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleNext}
                                        className="w-full h-12 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Continue
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex items-center gap-2 text-sm font-bold text-tclens-500 hover:text-tclens-600 transition-all mb-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back
                                    </button>

                                    <form onSubmit={handleSignUp} className="space-y-6">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-tclens-500 transition-colors" />
                                                    <input
                                                        name="email"
                                                        type="email"
                                                        placeholder="alex@example.com"
                                                        className={cn(
                                                            "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400",
                                                            errors.email && "border-red-400"
                                                        )}
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Create Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-tclens-500 transition-colors" />
                                                    <input
                                                        name="password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="At least 8 characters"
                                                        className={cn(
                                                            "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 focus:ring-4 focus:ring-tclens-500/10 focus:border-tclens-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400",
                                                            errors.password && "border-red-400"
                                                        )}
                                                        value={formData.password}
                                                        onChange={handleChange}
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
                                                    Sign Up
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-center pt-4">
                            <p className="text-sm font-medium text-slate-500">
                                Already have an account? <Link href="/signin" className="text-tclens-500 font-bold hover:text-tclens-600 transition-colors ml-1">Login here</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-tclens-600 text-white font-bold animate-pulse">Loading...</div>}>
            <SignUpForm />
        </Suspense>
    );
}
