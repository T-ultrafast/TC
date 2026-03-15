"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { LawyerProfile } from "@/lib/auth-types";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Loader2, AlertCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    // For design purposes, we're mocking the session and user
    const mockSession = {
        user: {
            id: "demo-id",
            firstName: "Demo",
            lastName: "User",
            email: "demo@tclens.com",
            plan: "Premium",
            role: "user",
            verificationStatus: "verified"
        }
    };
    const session = mockSession;
    const isPending = false;

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const user = session?.user;

    // Auto-close sidebar on mobile navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Simple Auth Guard: Disabled for design
        /*
        if (!isPending && !session) {
            router.push("/signin");
        }
        */

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
    }, [router, session, isPending]);

    useEffect(() => {
        if (user?.role === 'lawyer') {
            // In a real app, you'd fetch the lawyer profile from the DB
            // For now, we'll assume the user object carries the verification status
            if ((user as any).verificationStatus !== 'verified' && pathname === '/app/lawyers') {
                router.push('/app/document');
            }
        }
    }, [pathname, router, user]);

    // Show loading state while verifying auth
    if (isPending) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
            {/* Sidebar with mobile state */}
            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                setIsMobileOpen={setIsMobileMenuOpen}
            />

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out md:pl-48"
                )}
            >
                {user?.role === 'lawyer' && user?.verificationStatus === 'pending' && (
                    <div className="bg-emerald-600 text-white px-6 py-2 flex items-center justify-between animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                Account Pending Verification
                            </span>
                            <span className="text-[10px] opacity-80 uppercase tracking-widest hidden md:inline ml-2">
                                — Your professional profile is under review.
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-background/10 font-bold text-xs"
                            onClick={() => router.push('/app/admin')}
                        >
                            Review Details
                        </Button>
                    </div>
                )}
                <header className="h-20 border-b border-border bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-6 md:px-10 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl md:hidden transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col hidden lg:block">
                        <h2 className="text-lg font-bold text-slate-900 leading-none tracking-tight">
                            Welcome back, <span className="text-tclens-600">{user?.firstName || 'Counsel'}</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-[0.2em] flex items-center gap-2">
                            Workspace <span className="text-slate-200">/</span> Overview
                        </p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 ml-auto">
                        <div className="hidden md:flex flex-col items-end text-right">
                            <span className="text-sm font-bold text-slate-900 leading-none">
                                {user ? `${user.firstName} ${user.lastName}` : "TCLens User"}
                            </span>
                            <span className="text-[11px] font-bold text-tclens-600 mt-1 uppercase tracking-wide">
                                {user?.plan || "Free"} Account
                            </span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-tclens-500 flex items-center justify-center text-white text-xs font-bold border border-tclens-400 shadow-xl shadow-tclens-500/10 transition-transform hover:scale-105 cursor-pointer">
                            {user ? `${user.firstName[0]}${user.lastName[0]}` : "TL"}
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
