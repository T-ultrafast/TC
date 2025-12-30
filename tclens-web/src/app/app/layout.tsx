"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        // Simple Auth Guard: Check if authenticated on mount
        if (!auth.isAuthenticated()) {
            router.push("/signin");
        } else {
            setIsVerified(true);
        }
    }, [router]);

    // Show loading state while verifying auth
    if (!isVerified) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-legal-navy" />
            </div>
        );
    }

    // Note: In a real app, this layout would be wrapped with an AuthProvider or check session.
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider font-outfit lg:block hidden">
                        Dashboard Workspace
                    </h2>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex flex-col items-end mr-2 text-right">
                            <span className="text-sm font-bold text-legal-navy font-outfit">John Doe</span>
                            <span className="text-xs text-slate-500">Free Tier</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                            JD
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
