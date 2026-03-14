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
import { auth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { useTheme } from "next-themes";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/app/document" },
    { icon: Briefcase, label: "Matters", href: "/app/case" },
    { icon: Search, label: "Counsel Search", href: "/app/lawyers" },
    { icon: Zap, label: "AI Templates", href: "/app/templates" },
    { icon: Shield, label: "Neural Assistant", href: "/app/ai-lawyer" },
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Bypassing auth for design
        const currentUser = { email: "demo@tclens.com", firstName: "Demo", lastName: "User", plan: "premium" };
        setUser(currentUser);

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
        // Bypassing auth for design
        router.push("/");
    };

    if (!isLoaded) return null;

    return (
        <aside
            className={cn(
                "border-r border-border bg-background flex flex-col h-screen fixed left-0 top-0 z-[60] transition-all duration-300 ease-in-out",
                // Mobile behavior: Slide-out drawer
                "w-72 -translate-x-full shadow-2xl md:shadow-none md:translate-x-0",
                isMobileOpen && "translate-x-0 shadow-2xl",
                // Desktop behavior: Collapsible fixed sidebar
                isCollapsed ? "md:w-[72px]" : "md:w-72"
            )}
        >
            {/* Logo & Toggle */}
            <div className={cn(
                "p-4 border-b border-border flex items-center justify-between min-h-[80px]",
                !isMobileOpen && isCollapsed ? "md:flex-col md:gap-6 md:py-8" : "p-8"
            )}>
                <Logo iconOnly={isCollapsed && !isMobileOpen} className="scale-95 origin-left" />

                <button
                    onClick={toggleCollapse}
                    className={cn(
                        "p-2 rounded-none border border-border hover:bg-muted/50 text-muted-foreground transition-all hidden md:block",
                        isCollapsed ? "mt-4" : ""
                    )}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Mobile Close Button - Standard Position */}
                <button
                    onClick={() => setIsMobileOpen?.(false)}
                    className="p-2 -mr-2 md:hidden text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Theme Toggle & User Info */}
            <div className="p-4 border-t border-border space-y-4">
                {/* Theme Toggle */}
                <div className={cn(
                    "flex bg-muted/30 p-1 rounded-none",
                    isCollapsed ? "flex-col" : "flex-row"
                )}>
                    {[
                        { id: "light", icon: Sun },
                        { id: "dark", icon: Moon },
                        { id: "system", icon: Laptop }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setTheme(mode.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center p-2 rounded-none transition-all",
                                theme === mode.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            title={mode.id.charAt(0).toUpperCase() + mode.id.slice(1) + " Mode"}
                        >
                            <mode.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                {/* User Info Summary */}
                {!isCollapsed && user && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/50 rounded-none">
                        <div className="w-8 h-8 rounded-none bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{user.plan || "Free"} Member</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        title={(isCollapsed && !isMobileOpen) ? item.label : ""}
                        className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-none text-[11px] font-bold uppercase tracking-widest transition-all group",
                            pathname === item.href
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                            pathname === item.href ? "text-white" : "text-muted-foreground group-hover:text-emerald-500"
                        )} />
                        {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-border space-y-1">
                <Link
                    href="/app/settings"
                    title={isCollapsed ? "Settings" : ""}
                    className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-none text-[11px] font-bold uppercase tracking-widest transition-all group",
                        pathname === "/app/settings"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                >
                    <Settings className={cn(
                        "w-5 h-5 shrink-0",
                        pathname === "/app/settings" ? "text-white" : "text-muted-foreground group-hover:text-emerald-500"
                    )} />
                    {!isCollapsed && <span>Settings</span>}
                </Link>

                <button
                    onClick={handleSignOut}
                    title={isCollapsed ? "Sign Out" : ""}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-none text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50/50 transition-all group mt-2"
                >
                    <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span>De-authenticate</span>}
                </button>
            </div>
        </aside>
    );
}
