import { UploadZone } from "@/components/upload-zone";
import { FileText, History } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-legal-navy rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold font-outfit">TC</span>
                    </div>
                    <span className="text-xl font-bold text-legal-navy font-outfit">TCLens</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-12 px-6">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-legal-navy mb-2 font-outfit">
                        Analyze New Document
                    </h1>
                    <p className="text-slate-500">
                        Upload a contract, terms of service, or privacy policy to get started.
                    </p>
                </div>

                <UploadZone />

                <div className="mt-16">
                    <div className="flex items-center gap-2 mb-6">
                        <History className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold text-legal-navy">Recent Analyses</h2>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500">No documents analyzed yet.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
