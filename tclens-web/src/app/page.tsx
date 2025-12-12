import { Button } from "@/components/ui/button";
import { Shield, Scale, Search, FileText, CheckCircle, AlertTriangle } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center">
            {/* Hero Section */}
            <section className="w-full bg-gradient-to-b from-legal-navy to-slate-900 text-white py-24 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
                <div className="max-w-4xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-emerald-400 mb-4">
                        <Shield className="w-4 h-4" />
                        <span>AI-Powered Legal Protection</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-outfit">
                        Understand What You Sign. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Instantly.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        TCLens analyzes Terms & Conditions, Privacy Policies, and Contracts in seconds. Identify risks, hidden clauses, and unfair terms with lawyer-grade precision.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button size="lg" variant="secondary" className="text-legal-navy font-bold text-lg px-8" asChild>
                            <a href="/upload">Analyze Document</a>
                        </Button>
                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8">
                            Download Extension
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-20 px-6 md:px-12 lg:px-24 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-legal-navy mb-4 font-outfit">
                            Enterprise-Grade Legal Intelligence
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Our AI engine is trained on thousands of contracts to provide the most accurate legal analysis available to consumers and professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                                <Search className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-legal-navy mb-3">Deep Clause Analysis</h3>
                            <p className="text-slate-600">
                                Instantly detect and classify clauses like Indemnification, Arbitration, and Data Usage. We highlight what matters.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-6">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-legal-navy mb-3">Risk Scoring</h3>
                            <p className="text-slate-600">
                                Get a 0-100 safety score for every document. We flag dangerous terms and unfair obligations automatically.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6">
                                <Scale className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-legal-navy mb-3">Lawyer Marketplace</h3>
                            <p className="text-slate-600">
                                Need a human review? Connect with licensed attorneys directly through the platform for expert consultation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo/Preview Section */}
            <section className="w-full py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-legal-navy font-outfit">
                            See What You're Signing
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Most people agree to terms without reading. TCLens reads them for you.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Instant Plain-English Summaries",
                                "GDPR & CCPA Compliance Checks",
                                "Hidden Fee Detection",
                                "Data Sale Warnings"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-legal-navy font-medium">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-2xl p-6 w-full shadow-inner border border-slate-200">
                        {/* Mock UI for Analysis */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                            <div className="flex justify-between items-center border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                    <div>
                                        <h4 className="font-bold text-legal-navy">Service_Agreement_v2.pdf</h4>
                                        <p className="text-xs text-slate-500">Processed in 2.4s</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                                    Risk Score: 65/100
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                                    <p className="text-xs font-bold text-red-600 uppercase mb-1">Critical Alert</p>
                                    <p className="text-sm text-slate-800 font-medium">Mandatory Binding Arbitration</p>
                                    <p className="text-xs text-slate-600 mt-1">You waive your right to sue in court or join a class action.</p>
                                </div>
                                <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
                                    <p className="text-xs font-bold text-amber-600 uppercase mb-1">Warning</p>
                                    <p className="text-sm text-slate-800 font-medium">Automatic Renewal</p>
                                    <p className="text-xs text-slate-600 mt-1">Subscription renews automatically unless cancelled 30 days prior.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
