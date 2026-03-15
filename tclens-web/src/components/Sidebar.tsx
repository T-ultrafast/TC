"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    LogOut,
    Shield,
    Zap,
    Search,
    Globe,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Settings,
    LayoutDashboard,
    X,
    Sun,
    Moon,
    Laptop,
    User
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useTheme } from "next-themes";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/app/document" },
    { icon: Briefcase, label: "Matters", href: "/app/case" },
    { icon: Search, label: "Counsel", href: "/app/lawyers" },
    { icon: Zap, label: "Templates", href: "/app/templates" },
    { icon: Shield, label: "Assistant", href: "/app/ai-lawyer" },
];

export function Sidebar({
    isMobileOpen,
    setIsMobileOpen
}: {
    isMobileOpen?: boolean;
    setIsMobileOpen?: (open: boolean) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Bypassing auth for design
        const currentUser = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
        setUser(currentUser);
        setIsLoaded(true);
    }, []);

    const handleSignOut = () => {
        // Bypassing auth for design
        router.push("/");
    };

    if (!isLoaded) return null;

    return (
        <aside
            className={cn(
                "border-r border-border bg-background flex flex-col h-screen fixed left-0 top-0 z-[60] transition-all duration-300 ease-in-out",
                // Mobile behavior: Full-screen slide-out drawer
                "w-full md:w-48 -translate-x-full md:translate-x-0 shadow-2xl md:shadow-none",
                isMobileOpen && "translate-x-0"
            )}
        >
            {/* Logo area */}
            <div className="p-6 flex items-center justify-between min-h-[80px]">
                <Logo iconOnly={false} className="scale-95 origin-left" />

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen?.(false)}
                    className="p-2 -mr-2 md:hidden text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-10 space-y-1 overflow-y-auto no-scrollbar flex flex-col items-center md:items-stretch">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={""}
                            onClick={() => setIsMobileOpen?.(false)}
                            className={cn(
                                "flex items-center gap-3.5 px-10 md:px-6 py-4 md:py-3 text-lg md:text-sm font-medium transition-all group w-full",
                                isActive
                                    ? "bg-tclens-500 text-white"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-6 h-6 md:w-5 md:h-5 shrink-0 transition-transform group-hover:scale-105",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-tclens-500"
                            )} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 md:p-4 border-t border-border/50 space-y-1 bg-slate-50/50 flex flex-col items-center md:items-stretch">
                <Link
                    href="/app/settings"
                    onClick={() => setIsMobileOpen?.(false)}
                    className={cn(
                        "flex items-center gap-3 px-10 md:px-6 py-4 md:py-3 text-lg md:text-sm font-medium transition-all group w-full",
                        pathname === "/app/settings"
                            ? "bg-tclens-500 text-white"
                            : "text-slate-500 hover:bg-white hover:text-slate-900 border-y border-r border-transparent hover:border-slate-200"
                    )}
                >
                    <Settings className={cn(
                        "w-6 h-6 md:w-5 md:h-5 shrink-0",
                        pathname === "/app/settings" ? "text-white" : "text-slate-400 group-hover:text-tclens-500"
                    )} />
                    <span>Settings</span>
                </Link>

                <button
                    onClick={() => {
                        setIsMobileOpen?.(false);
                        handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-10 md:px-6 py-4 md:py-3 text-lg md:text-sm font-medium text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-6 h-6 md:w-5 md:h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
