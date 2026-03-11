'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, ArrowRight, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        jurisdiction: ''
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.includes('@')) {
            newErrors.email = "Invalid email address";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        return newErrors;
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 800));

            auth.signUp({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                jurisdiction: formData.jurisdiction || undefined
            });

            router.push("/app/document");
        } catch (err) {
            setErrors({ form: "Registration failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-6 pt-32 overflow-hidden bg-background flex-1">
            {/* Background Haze Effects */}
            <div className="bg-haze">
                <div className="haze-gradient-1" />
                <div className="haze-gradient-2" />
            </div>

            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2 mb-4">
                    <h1 className="text-4xl font-black text-foreground font-playfair tracking-tight mt-6">Create Free Account</h1>
                    <p className="text-muted-foreground font-medium text-sm">Join 20,000+ users protecting their legal rights.</p>
                    <div className="pt-2">
                        <Link href="/signup/lawyer" className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:text-emerald-500 flex items-center justify-center gap-2 group transition-colors">
                            Professional? Sign up as a Lawyer
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="bg-background rounded-none p-10 shadow-2xl border border-border">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        name="firstName"
                                        placeholder="Jane"
                                        className={`pl-10 h-12 rounded-none transition-all ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.firstName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.firstName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        name="lastName"
                                        placeholder="Doe"
                                        className={`pl-10 h-12 rounded-none transition-all ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.lastName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Jurisdiction (Optional)</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="jurisdiction"
                                    placeholder="e.g. London, UK"
                                    className="pl-10 h-12 rounded-none focus:ring-emerald-500/20 focus:border-emerald-500 bg-muted/50 transition-all font-medium text-sm"
                                    value={formData.jurisdiction}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="jane@example.com"
                                    className={`pl-10 h-12 rounded-none transition-all ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 ml-1 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={`pl-10 h-12 rounded-none transition-all ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 ml-1 font-medium">{errors.password}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold text-lg shadow-xl transition-all transform hover:translate-y-[-2px] active:translate-y-0 mt-4"
                        >
                            {isLoading ? "Provisioning..." : "Commence Free Analysis"}
                            {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </Button>

                        {errors.form && <p className="text-sm text-red-500 text-center font-bold">{errors.form}</p>}
                    </form>

                    <div className="mt-8 pt-6 border-t border-border space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-xs text-muted-foreground font-bold italic">10,000 Free words included</span>
                        </div>
                        <p className="text-center text-sm font-bold text-muted-foreground">
                            Already have an account? <Link href="/signin" className="text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
