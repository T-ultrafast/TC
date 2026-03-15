"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Zap,
    Check,
    CheckCircle,
    ChevronRight,
    CreditCard,
    Plus,
    Loader2,
    Sparkles,
    Image,
    PenTool,
    Trash2,
    Lock
} from 'lucide-react';
import { Country, State } from 'country-state-city';

interface DocumentBuilderProps {
    wizardStep: number;
    setWizardStep: (step: number) => void;
    genType: string;
    setGenType: (val: string) => void;
    genJurisdiction: string;
    setGenJurisdiction: (val: string) => void;
    genState: string;
    setGenState: (val: string) => void;
    currentFields: any[];
    customParams: Record<string, string>;
    handleParamChange: (key: string, val: string) => void;
    generationLoading: boolean;
    handleGenerate: () => void;
    logoFile: File | null;
    setLogoFile: (file: File | null) => void;
    signatureFile: File | null;
    setSignatureFile: (file: File | null) => void;
    useWatermark: boolean;
    setUseWatermark: (val: boolean) => void;
    documentOptions: Record<string, string[]>;
}

export const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
    wizardStep,
    setWizardStep,
    genType,
    setGenType,
    genJurisdiction,
    setGenJurisdiction,
    genState,
    setGenState,
    currentFields,
    customParams,
    handleParamChange,
    generationLoading,
    handleGenerate,
    logoFile,
    setLogoFile,
    signatureFile,
    setSignatureFile,
    useWatermark,
    setUseWatermark,
    documentOptions
}) => {
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState(1);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (generationLoading) {
            setProgress(0);
            setProgressStep(1);

            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 20) {
                        setProgressStep(1);
                        return prev + 2;
                    }
                    if (prev < 45) {
                        setProgressStep(2);
                        return prev + 1.5;
                    }
                    if (prev < 90) {
                        setProgressStep(3);
                        return prev + 0.8;
                    }
                    return prev;
                });
            }, 150);
        } else {
            setProgress(0);
            setProgressStep(0);
        }
        return () => clearInterval(interval);
    }, [generationLoading]);
    const countries = Country.getAllCountries();
    const states = genJurisdiction ? State.getStatesOfCountry(genJurisdiction) : [];

    return (
        <div className="flex flex-col h-full">
            {/* Wizard Header / Progress Tracker */}
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-white">
                <div>
                    <h2 className="text-lg font-extrabold text-tclens-500 tracking-tight">Document Configuration</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Tactical phase logic</p>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(step => (
                        <div key={step} className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                            wizardStep === step ? "bg-tclens-500 text-white" :
                                wizardStep > step ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            {wizardStep > step ? <Check className="w-3.5 h-3.5" /> : step}
                        </div>
                    ))}
                </div>
            </div>

            {/* Wizard Body */}
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                {/* STEP 1: Basic Information */}
                {wizardStep === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-tclens-50 p-6 rounded-xl border border-tclens-100 text-[11px] text-tclens-700 flex items-start gap-4">
                            <Zap className="w-5 h-5 shrink-0 text-tclens-500" />
                            <p className="leading-relaxed font-bold tracking-wider">Select the <strong>document type</strong> and its governing <strong>jurisdiction</strong>. Our neural engine will automatically load the strategic templates required for these variables.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="group space-y-3">
                                <label className="text-[11px] font-bold text-[var(--label-color)] uppercase tracking-wider flex items-center justify-between ml-1">
                                    <span>Document Architecture <span className="text-red-500">*</span></span>
                                    {genType && <CheckCircle className="w-4 h-4 text-emerald-500 shadow-sm" />}
                                </label>
                                <select
                                    value={genType}
                                    onChange={(e) => setGenType(e.target.value)}
                                    className={cn(
                                        "w-full h-14 px-5 rounded-xl border appearance-none outline-none font-medium text-sm transition-all cursor-pointer",
                                        !genType ? "border-slate-200 bg-slate-50/50 text-slate-400" : "border-slate-200 bg-white text-slate-900 focus:border-tclens-500"
                                    )}
                                >
                                    <option value="" disabled>Select document type...</option>
                                    {Object.entries(documentOptions).map(([category, documents]) => (
                                        <optgroup key={category} label={category}>
                                            {documents.map((doc) => (
                                                <option key={doc} value={doc}>{doc}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="group space-y-3">
                                <label className="text-[11px] font-bold text-[var(--label-color)] uppercase tracking-wider flex items-center justify-between ml-1">
                                    <span>Governing Country <span className="text-red-500">*</span></span>
                                    {genJurisdiction && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                </label>
                                <select
                                    value={genJurisdiction}
                                    onChange={(e) => {
                                        setGenJurisdiction(e.target.value);
                                        setGenState(""); // Reset state when country changes
                                    }}
                                    className={cn(
                                        "w-full h-14 px-5 rounded-xl border appearance-none outline-none font-medium text-sm transition-all cursor-pointer",
                                        !genJurisdiction ? "border-slate-200 bg-slate-50/50 text-slate-400" : "border-slate-200 bg-white text-slate-900 focus:border-tclens-500"
                                    )}
                                >
                                    <option value="" disabled>Select country...</option>
                                    {countries.map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {genJurisdiction && states.length > 0 && (
                                <div className="group space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[11px] font-bold text-[var(--label-color)] uppercase tracking-wider flex items-center justify-between ml-1">
                                        <span>Governing State / Province <span className="text-slate-400 text-[10px] font-normal lowercase">(Optional)</span></span>
                                        {genState && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                    </label>
                                    <select
                                        value={genState}
                                        onChange={(e) => setGenState(e.target.value)}
                                        className={cn(
                                            "w-full h-14 px-5 rounded-xl border appearance-none outline-none font-medium text-sm transition-all cursor-pointer",
                                            !genState ? "border-slate-200 bg-slate-50/50 text-slate-400" : "border-slate-200 bg-white text-slate-900 focus:border-tclens-500"
                                        )}
                                    >
                                        <option value="">Select state/province...</option>
                                        {states.map((state) => (
                                            <option key={state.isoCode} value={state.isoCode}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <Button
                            disabled={!genType || !genJurisdiction}
                            onClick={() => setWizardStep(2)}
                            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
                        >
                            Configure Inputs <ChevronRight className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                )}

                {/* STEP 2: Parameters */}
                {wizardStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid gap-8">
                            {currentFields.map((field) => (
                                <div key={field.id} className="space-y-3">
                                    <label className="text-[11px] font-bold text-[var(--label-color)] uppercase tracking-wider flex items-center justify-between ml-1">
                                        <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                                        {customParams[field.id] && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            id={`field-${field.id}`}
                                            value={customParams[field.id] || ''}
                                            onChange={(e) => handleParamChange(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full min-h-[140px] p-5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none focus:border-tclens-500 transition-all resize-none"
                                        />
                                    ) : (
                                        <input
                                            id={`field-${field.id}`}
                                            type={field.type === 'date' ? 'date' : 'text'}
                                            value={customParams[field.id] || ''}
                                            onChange={(e) => handleParamChange(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none focus:border-tclens-500 transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setWizardStep(1)} className="h-16 flex-1 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">Go Back</Button>
                            <Button
                                onClick={() => {
                                    const missingField = currentFields.find(f => f.required && !customParams[f.id]);
                                    if (missingField) {
                                        const element = document.getElementById(`field-${missingField.id}`);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            element.focus();
                                        }
                                        return;
                                    }
                                    setWizardStep(3);
                                }}
                                className={cn(
                                    "h-16 flex-1 rounded-xl font-bold transition-all active:scale-[0.98]",
                                    currentFields.some(f => f.required && !customParams[f.id])
                                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed hover:bg-slate-200"
                                        : "bg-tclens-500 hover:bg-tclens-600 text-white"
                                )}
                            >
                                {currentFields.some(f => f.required && !customParams[f.id])
                                    ? "Please complete the fields"
                                    : "Finalize Block"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Assets & Branding */}
                {wizardStep === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Status Bar */}
                        <div className="bg-tclens-50 p-6 rounded-xl border border-tclens-100 text-[11px] text-tclens-700 flex items-start gap-4">
                            <Sparkles className="w-5 h-5 shrink-0 text-tclens-500" />
                            <p className="leading-relaxed font-bold tracking-wider">Finalize your document with professional branding. Upload your <strong>business logo</strong> and <strong>digital signature</strong> for a ready-to-execute draft.</p>
                        </div>

                        {/* Rendering Progress (shows during generation) */}
                        {generationLoading && (
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-900">Neural synthesis in progress</h4>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-tclens-500 animate-spin" />
                                        <span className="text-xs font-bold text-tclens-600">{Math.round(progress)}%</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-tclens-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className={cn("h-1 rounded-full transition-colors", progress >= 33 ? "bg-emerald-500" : "bg-slate-200")} />
                                    <div className={cn("h-1 rounded-full transition-colors", progress >= 66 ? "bg-emerald-500" : "bg-slate-200")} />
                                    <div className={cn("h-1 rounded-full transition-colors", progress >= 95 ? "bg-emerald-500" : "bg-slate-200")} />
                                </div>
                            </div>
                        )}

                        {!generationLoading && (
                            <>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Logo Upload */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold text-[var(--label-color)] uppercase tracking-wider flex items-center justify-between ml-1">
                                            <span>Business Logo</span>
                                        </label>
                                        <div className={cn(
                                            "relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center group overflow-hidden",
                                            logoFile ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-tclens-300 hover:bg-slate-50/50"
                                        )}>
                                            {logoFile ? (
                                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                    <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="max-w-[120px] max-h-[80px] object-contain mb-4 rounded-lg" />
                                                    <p className="text-[10px] font-bold text-emerald-600 truncate max-w-full px-4">{logoFile.name}</p>
                                                    <button onClick={() => setLogoFile(null)} className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-sm text-red-500 hover:scale-110 transition-transform z-10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                        <Image className="w-6 h-6 text-slate-400 group-hover:text-tclens-500 transition-colors" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-[var(--label-color)] uppercase tracking-wider mb-1">Click To Upload Logo</p>
                                                    <p className="text-[9px] text-slate-300">PNG, JPG or SVG (Max 2MB)</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => e.target.files?.[0] && setLogoFile(e.target.files[0])}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Signature Upload */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold text-[var(--label-color)] uppercase tracking-wider flex items-center justify-between ml-1">
                                            <span>Execution Signature</span>
                                        </label>
                                        <div className={cn(
                                            "relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center group overflow-hidden",
                                            signatureFile ? "border-tclens-200 bg-tclens-50/30" : "border-slate-200 hover:border-tclens-300 hover:bg-slate-50/50"
                                        )}>
                                            {signatureFile ? (
                                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                    <img src={URL.createObjectURL(signatureFile)} alt="Signature Preview" className="max-w-[150px] max-h-[100px] object-contain mb-4" />
                                                    <p className="text-[10px] font-bold text-tclens-600 truncate max-w-full px-4">{signatureFile.name}</p>
                                                    <button onClick={() => setSignatureFile(null)} className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-sm text-red-500 hover:scale-110 transition-transform z-10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                        <PenTool className="w-6 h-6 text-slate-400 group-hover:text-tclens-500 transition-colors" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-[var(--label-color)] uppercase tracking-wider mb-1">Upload Digital Signature</p>
                                                    <p className="text-[9px] text-slate-300">Sign on white paper & upload</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => e.target.files?.[0] && setSignatureFile(e.target.files[0])}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Watermark Toggle */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-slate-700">Apply brand watermark</h4>
                                            <p className="text-[10px] text-slate-400">Add a subtle background logo for protection</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUseWatermark(!useWatermark)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            useWatermark ? "bg-tclens-500" : "bg-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            useWatermark ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 w-full">
                            <Button variant="outline" onClick={() => setWizardStep(2)} className="h-16 flex-1 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">Go Back</Button>
                            <Button
                                onClick={() => setWizardStep(4)}
                                className="h-16 flex-1 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Continue to Review <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Final Review & Generation */}
                {wizardStep === 4 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Configuration Complete</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed px-10">All tactical parameters and assets have been verified. Ready to initiate neural drafting.</p>
                            </div>
                        </div>

                        {/* Rendering Progress (shows during generation) */}
                        {generationLoading && (
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-900">Neural synthesis in progress</h4>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-tclens-500 animate-spin" />
                                        <span className="text-xs font-bold text-tclens-600">{Math.round(progress)}%</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-tclens-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className={cn("h-1 rounded-full transition-colors", progress >= 33 ? "bg-emerald-500" : "bg-slate-200")} />
                                    <div className={cn("h-1 rounded-full transition-colors", progress >= 66 ? "bg-emerald-500" : "bg-slate-200")} />
                                    <div className={cn("h-1 rounded-full transition-colors", progress >= 95 ? "bg-emerald-500" : "bg-slate-200")} />
                                </div>
                                <p className="text-[10px] text-center text-[var(--label-color)] font-bold uppercase tracking-tight">Synchronizing Jurisdiction Context And Branding Markers...</p>
                            </div>
                        )}

                        {!generationLoading && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document Type</p>
                                    <p className="text-xs font-bold text-slate-800 truncate">{genType}</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Branding Status</p>
                                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                        <Check className="w-3 h-3" /> {logoFile ? 'Custom Logo' : 'Default'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 w-full">
                            <Button variant="outline" onClick={() => setWizardStep(3)} disabled={generationLoading} className="h-16 flex-1 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">Modify Assets</Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={generationLoading}
                                className="h-16 flex-2 bg-tclens-500 hover:bg-tclens-600 text-white rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {generationLoading ? (
                                    <> <Loader2 className="w-5 h-5 animate-spin" /> Sequencing... </>
                                ) : (
                                    <> Initiate Draft <Plus className="w-5 h-5" /> </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
