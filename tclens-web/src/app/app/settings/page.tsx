'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Globe,
    Shield,
    CreditCard,
    Zap,
    LogOut,
    Trash2,
    Save,
    CheckCircle,
    Info,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, UserProfile } from '@/lib/auth';
import { getUsage, LIMITS } from '@/lib/usage';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [usage, setUsage] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        jurisdiction: ''
    });

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/signin');
            return;
        }
        setUser(currentUser);
        setUsage(getUsage(true));
        setFormData({
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            jurisdiction: currentUser.jurisdiction || ''
        });
    }, [router]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        // Fake delay
        await new Promise(resolve => setTimeout(resolve, 600));

        auth.updateUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            jurisdiction: formData.jurisdiction
        });

        setUser(auth.getUser());
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleSignOut = () => {
        auth.signOut();
        router.push('/');
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            auth.clearAll();
            router.push('/');
        }
    };

    if (!user) return null;

    const currentLimit = user.wordsLimit;
    const usagePercentage = Math.min(100, (usage / currentLimit) * 100);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-8">
                <h1 className="text-3xl font-black text-legal-navy font-outfit mb-2">Account Settings</h1>
                <p className="text-slate-500">Manage your profile, preferences, and billing information.</p>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Left: Main Settings */}
                <div className="md:col-span-8 space-y-8">
                    {/* Profile Section */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-legal-navy font-outfit">Personal Profile</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="h-12 rounded-xl focus-visible:ring-legal-navy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="h-12 rounded-xl focus-visible:ring-legal-navy"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={user.email}
                                    disabled
                                    className="pl-10 h-12 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 ml-1 italic">* Email cannot be changed in this beta version.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Jurisdiction Preference</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="e.g. California, USA"
                                    value={formData.jurisdiction}
                                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                                    className="pl-10 h-12 rounded-xl focus-visible:ring-legal-navy"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between gap-4">
                            {saveSuccess && (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Profile Updated Successfully
                                </div>
                            )}
                            <div className="flex-1" />
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="h-12 px-8 bg-legal-navy hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all min-w-[160px]"
                            >
                                {isSaving ? "Saving..." : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </section>

                    {/* Usage Section */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-legal-navy font-outfit">Usage Tracking</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                                    <span>Plan Quota: {usage.toLocaleString()} / {currentLimit.toLocaleString()} Words Used</span>
                                    <span>{Math.round(usagePercentage)}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                                    <div
                                        className={`h-full transition-all duration-1000 rounded-full ${usagePercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${usagePercentage}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 items-start border border-blue-100">
                                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                    Your 10,000 word quota is part of your Free Account package.
                                    Upgrade to Pro for 100,000 words and priority AI analysis.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Sidebar Settings */}
                <div className="md:col-span-4 space-y-6">
                    {/* Billing Card (Placeholder) */}
                    <section className="bg-legal-navy rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Current Plan</p>
                                <h3 className="text-2xl font-black font-outfit capitalize">{user.plan}</h3>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Next Reset</span>
                                    <span className="font-bold">Jan 29, 2026</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Billing Cycle</span>
                                    <span className="font-bold">Monthly</span>
                                </div>
                            </div>

                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 rounded-xl group" asChild>
                                <Link href="/pricing">
                                    Upgrade to Pro
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>

                            <p className="text-[10px] text-center text-slate-400 italic">Payments coming soon • Beta access</p>
                        </div>
                    </section>

                    {/* Invoices (Mock) */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-legal-navy uppercase tracking-tighter">Billing History</h3>
                        </div>
                        <div className="text-center py-8 space-y-2">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <FileText className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-400 font-medium">No invoices yet.</p>
                        </div>
                    </section>

                    {/* Dangerous Zone */}
                    <div className="space-y-3 pt-4 px-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full h-12 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full h-12 rounded-xl border border-red-100 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple FileText and File icons for the mock UI
function FileText({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
}
