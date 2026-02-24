"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth, LawyerProfile } from "@/lib/auth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
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

    useEffect(() => {
        const currentUser = auth.getUser();
        if (currentUser?.role === 'lawyer') {
            const lawyer = currentUser as LawyerProfile;
            if (lawyer.verificationStatus !== 'verified' && pathname === '/app/lawyers') {
                router.push('/app/document');
            }
        }
    }, [pathname, router]);

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
                {user?.role === 'lawyer' && user?.verificationStatus === 'pending' && (
                    <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-between animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-bold font-outfit uppercase tracking-wider">
                                Account Pending Verification
                            </span>
                            <span className="text-xs opacity-90 hidden md:inline">
                                — Your professional profile is under review. Some features remain restricted.
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 font-bold text-xs"
                            onClick={() => router.push('/app/admin')}
                        >
                            Review Details
                        </Button>
                    </div>
                )}
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
