'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    ShieldAlert,
    User,
    Check,
    X,
    ExternalLink,
    Search,
    Filter,
    MoreVertical,
    Scale,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, LawyerProfile } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'lawyer')) {
            // For this mock demo, we allow lawyers to see the admin view to "verify themselves"
            // In a real app, this would be admin-only.
        }
        setUser(currentUser);
        setIsLoading(false);
    }, [router]);

    const handleVerify = () => {
        if (user && user.role === 'lawyer') {
            auth.updateUser({ verificationStatus: 'verified' } as Partial<LawyerProfile>);
            setUser({ ...user, verificationStatus: 'verified' });
            // Show success and redirect
            alert("Lawyer status updated to VERIFIED!");
            router.push('/app/document');
        }
    };

    const handleReject = () => {
        if (user && user.role === 'lawyer') {
            auth.updateUser({ verificationStatus: 'rejected' } as Partial<LawyerProfile>);
            setUser({ ...user, verificationStatus: 'rejected' });
            alert("Lawyer status updated to REJECTED.");
        }
    };

    if (isLoading) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-legal-navy font-outfit uppercase tracking-tight">
                        Compliance Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Review and verify legal practitioner applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input className="pl-10 w-[240px] h-11 rounded-xl bg-white border-slate-200" placeholder="Search professionals..." />
                    </div>
                    <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold text-slate-600 gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Review', value: '1', color: 'bg-amber-500', icon: ShieldAlert },
                    { label: 'Verified Lawyers', value: '1,248', color: 'bg-emerald-500', icon: ShieldCheck },
                    { label: 'Blocked Accounts', value: '14', color: 'bg-red-500', icon: X },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-legal-navy font-outfit">{stat.value}</p>
                        </div>
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-opacity-20", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Lawyer Detail View (Mocking the one pending application) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-legal-navy font-outfit uppercase tracking-tight">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">
                                    {user?.verificationStatus || 'Pending'}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">Applied 2 minutes ago</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleReject}
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-slate-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-100"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            onClick={handleVerify}
                            className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Verify Credentials
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8 border-r border-slate-50 space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identity & Professional Details</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Title</p>
                                    <p className="text-sm font-bold text-legal-navy">{(user as any)?.professionalTitle || 'Attorney'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">License Number</p>
                                    <p className="text-sm font-bold text-legal-navy">{(user as any)?.licenseNumber || '987654'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Issuing Authority</p>
                                    <p className="text-sm font-bold text-legal-navy">{(user as any)?.issuingAuthority || 'California State Bar'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Admission Year</p>
                                    <p className="text-sm font-bold text-legal-navy">{(user as any)?.yearOfAdmission || '2015'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Jurisdictions</p>
                                    <div className="flex flex-wrap gap-1">
                                        {((user as any)?.jurisdictionsOfPractice || ['California, US']).map((j: string) => (
                                            <span key={j} className="px-2 py-0.5 bg-legal-navy/5 text-legal-navy rounded-md text-[10px] font-bold border border-legal-navy/10">
                                                {j}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Practice Focus</h4>
                            <div className="flex flex-wrap gap-2">
                                {((user as any)?.practiceAreas || ['Contract Law', 'IP']).map((area: string) => (
                                    <span key={area} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License Document Proof</h4>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-legal-navy p-0 hover:bg-transparent">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View Original
                                </Button>
                            </div>
                            <div className="aspect-[4/3] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden">
                                <Scale className="w-12 h-12 text-slate-100 absolute" />
                                <div className="z-10 text-center">
                                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">license_cert_v2.pdf</p>
                                </div>
                                <div className="absolute inset-0 bg-legal-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white text-xs font-black uppercase tracking-widest">Click to Expand</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Professional Biography</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-serif italic">
                                "{((user as any)?.bio || 'No bio provided.')}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Availability</h4>
                                <div className="flex flex-wrap gap-1">
                                    {((user as any)?.availability || ['Weekdays']).map((t: string) => (
                                        <span key={t} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hourly Rate</h4>
                                <div className="text-xl font-black text-legal-navy font-outfit">
                                    ${(user as any)?.hourlyRate || '0'}<span className="text-[10px] text-slate-400 font-medium">/hr</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Attestation</h4>
                            <div className="space-y-2">
                                {[
                                    { label: 'Licensed in Jurisdictions', key: 'acceptedJurisdiction' },
                                    { label: 'Advice within Jurisdiction', key: 'acceptedAdviceLimit' },
                                    { label: 'Acknowledged Tech Platform Role', key: 'acceptedPlatform' },
                                    { label: 'No Off-Platform Solicitation', key: 'acceptedNoSolicit' },
                                    { label: 'Agreed to Code of Conduct', key: 'acceptedCodeOfConduct' },
                                    { label: 'Certified Accuracy', key: 'certifiedAccurate' }
                                ].map(cert => (
                                    <div key={cert.key} className={cn(
                                        "flex items-center gap-2 text-[10px] font-bold",
                                        (user as any)?.[cert.key] ? "text-emerald-600" : "text-slate-300"
                                    )}>
                                        <Check className="w-3 h-3" />
                                        {cert.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
