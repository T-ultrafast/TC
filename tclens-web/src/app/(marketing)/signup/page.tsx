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
        <div className="relative flex flex-col items-center justify-center p-6 pt-32 overflow-hidden bg-white flex-1">
            {/* Background Gradient / Wash */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-purple-50 via-white to-white blur-3xl opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-50/40 via-white to-white blur-3xl opacity-40" />
            </div>

            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 font-outfit mt-6">Create Free Account</h1>
                    <p className="text-slate-500 font-medium">Join 20,000+ users protecting their legal rights.</p>
                    <div className="pt-2">
                        <Link href="/signup/lawyer" className="text-xs font-black text-purple-600 uppercase tracking-widest hover:text-purple-700 flex items-center justify-center gap-1 group">
                            Professional? Sign up as a Lawyer
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-purple-500/5 border border-slate-100">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        name="firstName"
                                        placeholder="Jane"
                                        className={`pl-10 h-12 rounded-xl transition-all ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-purple-600/20 focus:border-purple-600'}`}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.firstName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.firstName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        name="lastName"
                                        placeholder="Doe"
                                        className={`pl-10 h-12 rounded-xl transition-all ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-purple-600/20 focus:border-purple-600'}`}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.lastName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Jurisdiction (Optional)</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    name="jurisdiction"
                                    placeholder="e.g. California, USA"
                                    className="pl-10 h-12 rounded-xl focus:ring-purple-600/20 focus:border-purple-600 transition-all font-medium"
                                    value={formData.jurisdiction}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="jane@example.com"
                                    className={`pl-10 h-12 rounded-xl transition-all ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-purple-600/20 focus:border-purple-600'}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 ml-1 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={`pl-10 h-12 rounded-xl transition-all ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'focus:ring-purple-600/20 focus:border-purple-600'}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 ml-1 font-medium">{errors.password}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
                        >
                            {isLoading ? "Creating Account..." : "Start Free Analysis"}
                            {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </Button>

                        {errors.form && <p className="text-sm text-red-500 text-center font-bold">{errors.form}</p>}
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
                                <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="text-xs text-slate-500 font-bold">10,000 Free words included</span>
                        </div>
                        <p className="text-center text-sm font-bold text-slate-500">
                            Already have an account? <Link href="/signin" className="text-purple-600 hover:text-purple-700 transition-colors">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
