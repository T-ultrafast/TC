'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    User,
    Briefcase,
    Scale,
    Globe,
    FileText,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Calendar,
    DollarSign,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = [
    { id: 'identity', title: 'Identity & License', icon: User },
    { id: 'expertise', title: 'Practice & Expertise', icon: Briefcase },
    { id: 'consultation', title: 'Consultation', icon: Calendar },
    { id: 'profile', title: 'Professional Profile', icon: FileText },
    { id: 'compliance', title: 'Compliance', icon: Scale },
];

const PRACTICE_AREAS = [
    'Contract Law', 'Corporate / Commercial Law', 'Employment & Labor',
    'Intellectual Property', 'Privacy & Data Protection', 'Technology / SaaS Law',
    'Arbitration & Dispute Resolution', 'Real Estate', 'Consumer Protection', 'Financial / Banking Law'
];

const CLIENT_TYPES = ['Individuals', 'Startups', 'SMEs', 'Enterprises', 'International Clients'];
const CONSULTATION_TYPES = ['Chat (async)', 'Video Call', 'Document Review'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Yoruba', 'Mandarin', 'Arabic', 'Portuguese'];

export default function LawyerSignUpPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        professionalTitle: 'Attorney',
        licenseNumber: '',
        issuingAuthority: '',
        jurisdictionsOfPractice: [] as string[],
        licenseStatus: 'Active',
        yearOfAdmission: new Date().getFullYear() - 5,
        practiceAreas: [] as string[],
        secondaryExpertise: '',
        clientTypes: [] as string[],
        consultationTypes: [] as string[],
        availability: [] as string[],
        hourlyRate: '',
        bio: '',
        lawFirm: '',
        website: '',
        languages: [] as string[],
        email: '',
        password: '',
        attestationName: '',
        acceptedJurisdiction: false,
        acceptedAdviceLimit: false,
        acceptedPlatform: false,
        acceptedNoSolicit: false,
        acceptedCodeOfConduct: false,
        certifiedAccurate: false
    });
    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleToggle = (field: string, value: string) => {
        const current = (formData as any)[field] as string[];
        if (current.includes(value)) {
            setFormData({ ...formData, [field]: current.filter(item => item !== value) });
        } else {
            setFormData({ ...formData, [field]: [...current, value] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const response = await fetch('/api/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: `${formData.firstName} ${formData.lastName}`,
                    data: {
                        role: 'lawyer',
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                    }
                })
            });
            
            if (response.ok) {
                router.push('/app/document');
            } else {
                const error = await response.json();
                console.error('Signup failed:', error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center py-12 pt-32 px-6 overflow-hidden bg-background flex-1">
            {/* Background Haze Effects */}
            <div className="bg-haze">
                <div className="haze-gradient-1" />
                <div className="haze-gradient-2" />
            </div>

            <div className="max-w-3xl w-full">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-foreground font-playfair tracking-tight uppercase">Lawyer Onboarding</h1>
                        <p className="text-muted-foreground font-medium text-sm mt-2">Join the network of verified legal practitioners.</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-12 relative flex justify-between">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted/50 -translate-y-1/2 -z-10" />
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4",
                                index <= currentStep
                                    ? "bg-emerald-600 border-background text-white shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10"
                                    : "bg-background border-border text-slate-300"
                            )}>
                                {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest hidden md:block",
                                index <= currentStep ? "text-emerald-600" : "text-slate-300"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-background rounded-none p-8 md:p-12 shadow-2xl shadow-sm border border-border relative overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {currentStep === 0 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">First Name</label>
                                            <Input
                                                className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="Jane" required
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Last Name</label>
                                            <Input
                                                className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="Doe" required
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Professional Title</label>
                                            <select
                                                className="w-full h-12 rounded-none border border-border px-4 bg-background font-medium text-muted-foreground focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all"
                                                value={formData.professionalTitle}
                                                onChange={e => setFormData({ ...formData, professionalTitle: e.target.value })}
                                            >
                                                <option>Attorney</option>
                                                <option>Barrister</option>
                                                <option>Solicitor</option>
                                                <option>Advocate</option>
                                                <option>Counsel</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">License/Bar Number</label>
                                            <Input
                                                className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="e.g. 123456" required
                                                value={formData.licenseNumber}
                                                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Issuing Authority</label>
                                        <Input
                                            className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="e.g. State Bar of California" required
                                            value={formData.issuingAuthority}
                                            onChange={e => setFormData({ ...formData, issuingAuthority: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Jurisdictions of Practice</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['California, US', 'New York, US', 'London, UK', 'Lagos, NG'].map(j => (
                                                    <button
                                                        key={j} type="button"
                                                        onClick={() => handleToggle('jurisdictionsOfPractice', j)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                                            formData.jurisdictionsOfPractice.includes(j)
                                                                ? "bg-emerald-600 text-foreground border-emerald-600"
                                                                : "bg-background text-muted-foreground border-border hover:border-border"
                                                        )}
                                                    >
                                                        {j}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Year of Admission</label>
                                            <Input
                                                type="number" className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="2015" required
                                                value={formData.yearOfAdmission}
                                                onChange={e => setFormData({ ...formData, yearOfAdmission: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Proof of License (Required)</label>
                                        <div
                                            className={cn(
                                                "border-2 border-dashed rounded-none p-8 text-center transition-colors cursor-pointer",
                                                licenseFile ? "border-blue-400 bg-muted/30/30" : "border-border hover:border-blue-400"
                                            )}
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            <Upload className={cn("w-8 h-8 mx-auto mb-2", licenseFile ? "text-emerald-600" : "text-slate-300")} />
                                            <p className={cn("text-sm font-bold", licenseFile ? "text-foreground" : "text-muted-foreground")}>
                                                {licenseFile ? licenseFile.name : "Click to upload your license certificate (PDF or JPG)"}
                                            </p>
                                            <input
                                                id="file-upload" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={e => setLicenseFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Email</label>
                                            <Input
                                                type="email" className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="jane.doe@firm.com" required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Password</label>
                                            <Input
                                                type="password" className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="••••••••" required
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 1 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Primary Practice Areas</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {PRACTICE_AREAS.map(area => (
                                                <button
                                                    key={area} type="button"
                                                    onClick={() => handleToggle('practiceAreas', area)}
                                                    className={cn(
                                                        "px-4 py-3 rounded-none text-xs font-bold transition-all border text-left",
                                                        formData.practiceAreas.includes(area)
                                                            ? "bg-emerald-600 text-foreground border-emerald-600 shadow-lg shadow-blue-600/10"
                                                            : "bg-background text-muted-foreground border-border hover:border-blue-400"
                                                    )}
                                                >
                                                    {area}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Who do you primarily serve?</label>
                                        <div className="flex flex-wrap gap-3">
                                            {CLIENT_TYPES.map(type => (
                                                <button
                                                    key={type} type="button"
                                                    onClick={() => handleToggle('clientTypes', type)}
                                                    className={cn(
                                                        "px-4 py-3 rounded-none text-xs font-bold transition-all border",
                                                        formData.clientTypes.includes(type)
                                                            ? "bg-emerald-600 text-foreground border-indigo-600 shadow-lg shadow-indigo-600/10"
                                                            : "bg-background text-muted-foreground border-border hover:border-indigo-400"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Secondary Expertise (Optional)</label>
                                        <Input
                                            className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium" placeholder="e.g. Maritime Law, Crypto Assets"
                                            value={formData.secondaryExpertise}
                                            onChange={e => setFormData({ ...formData, secondaryExpertise: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Consultation Methods</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {CONSULTATION_TYPES.map(type => (
                                                <button
                                                    key={type} type="button"
                                                    onClick={() => handleToggle('consultationTypes', type)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-3 p-6 rounded-none border transition-all",
                                                        formData.consultationTypes.includes(type)
                                                            ? "bg-emerald-600 text-foreground border-emerald-600 shadow-inner scale-[0.98]"
                                                            : "bg-muted/50 text-muted-foreground border-border hover:bg-background hover:border-blue-400 shadow-sm"
                                                    )}
                                                >
                                                    <span className="text-sm font-black uppercase tracking-tight">{type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Expected Hourly Rate (USD)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                                <Input
                                                    className="h-14 pl-10 rounded-none bg-muted/30 border-none font-black text-xl focus:bg-background focus:ring-emerald-600/20 transition-all text-foreground"
                                                    placeholder="250"
                                                    value={formData.hourlyRate}
                                                    onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground ml-2 font-bold uppercase tracking-wider">You can change this anytime or leave blank.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Typical Availability</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Weekdays', 'Weekends', 'Evening Only', 'Anytime'].map(time => (
                                                    <button
                                                        key={time} type="button"
                                                        onClick={() => handleToggle('availability', time)}
                                                        className={cn(
                                                            "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border text-center transition-all",
                                                            formData.availability.includes(time)
                                                                ? "bg-muted/30 text-muted-foreground border-border shadow-sm"
                                                                : "bg-background text-muted-foreground border-border"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Professional Bio (100-500 words)</label>
                                        <textarea
                                            className="w-full min-h-[160px] p-6 rounded-none border border-border focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none text-muted-foreground leading-relaxed font-medium bg-muted/50 transition-all"
                                            placeholder="Introduce yourself to potential clients. Highlight your experience, notable cases, and approach to law..."
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Firm Name (Optional)</label>
                                            <Input
                                                className="h-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium" placeholder="Doe & Partners LLP"
                                                value={formData.lawFirm}
                                                onChange={e => setFormData({ ...formData, lawFirm: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">LinkedIn / Website</label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                                <Input
                                                    className="h-12 pl-12 rounded-none focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium" placeholder="linkedin.com/in/janedoe"
                                                    value={formData.website}
                                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Languages Spoken</label>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map(lang => (
                                                <button
                                                    key={lang} type="button"
                                                    onClick={() => handleToggle('languages', lang)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        formData.languages.includes(lang)
                                                            ? "bg-emerald-900 text-foreground border-blue-900"
                                                            : "bg-background text-muted-foreground border-border hover:border-blue-400"
                                                    )}
                                                >
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 4 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-muted/30/50 border border-border rounded-none p-8 space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-none bg-emerald-600 flex items-center justify-center shrink-0">
                                                <AlertCircle className="w-6 h-6 text-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-foreground font-playfair uppercase tracking-tight">Legal Compliance Check</h3>
                                                <p className="text-sm text-muted-foreground font-bold">Please confirm your adherence to TCLens standards.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { id: 'acceptedJurisdiction', label: 'I am licensed to practice law in the jurisdictions listed.' },
                                                { id: 'acceptedAdviceLimit', label: 'I will not provide legal advice outside my licensed jurisdictions.' },
                                                { id: 'acceptedPlatform', label: 'I acknowledge TCLens is a technology platform and not a law firm.' },
                                                { id: 'acceptedNoSolicit', label: 'I agree not to solicit or transact with clients outside the platform.' },
                                                { id: 'acceptedCodeOfConduct', label: 'I agree to the Lawyer Code of Conduct.' },
                                                { id: 'certifiedAccurate', label: 'I certify that all information provided is accurate and complete.' }
                                            ].map(item => (
                                                <label key={item.id} className="flex items-start gap-4 cursor-pointer group">
                                                    <input
                                                        type="checkbox" className="mt-1 w-5 h-5 rounded border-blue-300 text-emerald-600 focus:ring-emerald-500/100 transition-all"
                                                        checked={(formData as any)[item.id]}
                                                        onChange={e => setFormData({ ...formData, [item.id]: e.target.checked })}
                                                    />
                                                    <span className="text-sm font-bold text-foreground group-hover:text-blue-950 transition-colors leading-snug">
                                                        {item.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Final Attestation (Type your full legal name)</label>
                                        <Input
                                            className="h-14 rounded-none border-2 border-border focus:border-emerald-600 transition-all text-xl font-black font-playfair uppercase tracking-widest placeholder:opacity-20 bg-muted/50 focus:bg-background"
                                            placeholder="JANET MARIE DOE"
                                            value={formData.attestationName}
                                            onChange={e => setFormData({ ...formData, attestationName: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic ml-2">This serves as your digital signature.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Buttons */}
                        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-emerald-600 transition-colors",
                                    currentStep === 0 && "invisible"
                                )}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            {currentStep === STEPS.length - 1 ? (
                                <Button
                                    type="submit"
                                    disabled={isLoading || !formData.attestationName || !formData.certifiedAccurate}
                                    className="h-15 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none px-12 font-bold text-lg shadow-xl shadow-emerald-600/10 transition-all group"
                                >
                                    {isLoading ? 'Processing...' : 'Complete Onboarding'}
                                    <CheckCircle2 className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-15 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none px-12 font-bold text-lg shadow-xl shadow-emerald-500/10 transition-all group"
                                >
                                    Next Step
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
                    Questions? Contact licensing@tclens.io. <br />
                    Already signed up? <Link href="/signin" className="text-emerald-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
