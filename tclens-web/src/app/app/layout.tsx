"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        // Simple Auth Guard: Check if authenticated on mount
        if (!auth.isAuthenticated()) {
            router.push("/signin");
        } else {
            setIsVerified(true);
            setUser(auth.getUser());
        }

        // Sync sidebar state from localStorage
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) {
            setIsSidebarCollapsed(saved === "true");
        }

        const handleToggleEvent = () => {
            const current = localStorage.getItem("sidebar-collapsed");
            setIsSidebarCollapsed(current === "true");
        };

        window.addEventListener('sidebar-toggle', handleToggleEvent);
        return () => window.removeEventListener('sidebar-toggle', handleToggleEvent);
    }, [router]);

    // Show loading state while verifying auth
    if (!isVerified) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-legal-navy" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "pl-[72px]" : "pl-72"
                )}
            >
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider font-outfit lg:block hidden">
                        Dashboard Workspace
                    </h2>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex flex-col items-end mr-2 text-right">
                            <span className="text-sm font-bold text-legal-navy font-outfit">
                                {user ? `${user.firstName} ${user.lastName}` : "User"}
                            </span>
                            <span className="text-xs text-slate-500">{user?.plan || "Free"} Tier</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                            {user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
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
