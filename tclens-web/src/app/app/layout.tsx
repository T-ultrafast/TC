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
            role: "user"
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
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "md:pl-[72px]" : "md:pl-72"
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
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:bg-muted/50 rounded-none md:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] font-playfair hidden lg:block">
                        Dashboard Workspace
                    </h2>
                    <div className="flex items-center gap-3 md:gap-6 ml-auto">
                        {mounted && (
                            <div className="hidden md:flex">
                                <button
                                    onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
                                    className="w-9 h-9 rounded-none flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all focus:outline-none"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? <Moon className="w-4 h-4" /> : theme === "light" ? <Sun className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                        <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
                        <div className="hidden md:flex flex-col items-end text-right">
                            <span className="text-sm font-bold text-foreground font-playfair tracking-tight">
                                {user ? `${user.firstName} ${user.lastName}` : "User"}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{user?.plan || "Free"} Member</span>
                        </div>
                        <div className="w-10 h-10 rounded-none bg-emerald-600 flex items-center justify-center text-white font-black border border-emerald-500 shadow-lg shadow-emerald-600/10 transition-transform hover:scale-105">
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
