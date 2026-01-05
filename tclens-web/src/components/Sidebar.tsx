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
    Settings
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

const navItems = [
    { icon: FileText, label: "Documents", href: "/app/document" },
    { icon: Briefcase, label: "Cases", href: "/app/case" },
    { icon: Search, label: "Find Lawyer", href: "/app/lawyers" },
    { icon: Zap, label: "Templates", href: "/app/templates" },
    { icon: Shield, label: "AI Lawyer", href: "/app/ai-lawyer" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) {
            setIsCollapsed(saved === "true");
        }
        setIsLoaded(true);
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar-collapsed", String(newState));
        // Dispatch custom event for layout sync
        window.dispatchEvent(new Event("sidebar-toggle"));
    };

    const handleSignOut = () => {
        auth.signOut();
        router.push("/");
    };

    if (!isLoaded) return null;

    return (
        <aside
            className={cn(
                "border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[72px]" : "w-72"
            )}
        >
            {/* Logo & Toggle */}
            <div className={cn(
                "p-4 border-b border-slate-50 flex items-center justify-between",
                isCollapsed ? "flex-col gap-4 py-6" : "p-6"
            )}>
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-10 h-10 bg-legal-navy rounded-xl flex items-center justify-center shadow-lg shadow-legal-navy/20 group-hover:scale-105 transition-transform">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-2xl font-black text-legal-navy font-outfit tracking-tighter">TCLens</span>
                    )}
                </Link>
                <button
                    onClick={toggleCollapse}
                    className={cn(
                        "p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors",
                        isCollapsed ? "mt-2" : ""
                    )}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : ""}
                        className={cn(
                            "flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-bold transition-all group",
                            pathname === item.href
                                ? "bg-legal-navy text-white shadow-xl shadow-legal-navy/10"
                                : "text-slate-500 hover:bg-slate-50 hover:text-legal-navy"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 shrink-0",
                            pathname === item.href ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"
                        )} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-slate-50 space-y-1">
                <Link
                    href="/app/settings"
                    title={isCollapsed ? "Settings" : ""}
                    className={cn(
                        "flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-bold transition-all group",
                        pathname === "/app/settings"
                            ? "bg-legal-navy text-white shadow-xl shadow-legal-navy/10"
                            : "text-slate-500 hover:bg-slate-50 hover:text-legal-navy"
                    )}
                >
                    <Settings className={cn(
                        "w-5 h-5 shrink-0",
                        pathname === "/app/settings" ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"
                    )} />
                    {!isCollapsed && <span>Settings</span>}
                </Link>

                <button
                    onClick={handleSignOut}
                    title={isCollapsed ? "Sign Out" : ""}
                    className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
