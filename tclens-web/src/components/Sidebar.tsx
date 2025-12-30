"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Upload,
    LogOut,
    Shield,
    Zap,
    Scale,
    Search,
    Globe,
    LayoutDashboard,
    Briefcase
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth, UserProfile } from "@/lib/auth";

const navItems = [
    { icon: FileText, label: "Documents", href: "/app/document" },
    { icon: Briefcase, label: "Cases", href: "/app/case" },
    { icon: Search, label: "Find Lawyer", href: "/app/lawyers" },
    { icon: Zap, label: "Templates", href: "/app/templates" },
    { icon: Shield, label: "AI Lawyer", href: "/app/ai-lawyer" },
    { icon: Globe, label: "Settings", href: "/app/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        setUser(auth.getUser());
    }, []);

    const handleSignOut = () => {
        auth.signOut();
        router.push("/");
    };

    return (
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="p-8 border-b border-slate-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-legal-navy rounded-xl flex items-center justify-center shadow-lg shadow-legal-navy/20 group-hover:scale-105 transition-transform">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-black text-legal-navy font-outfit tracking-tighter">TCLens</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                            pathname === item.href
                                ? "bg-legal-navy text-white shadow-xl shadow-legal-navy/10"
                                : "text-slate-500 hover:bg-slate-50 hover:text-legal-navy"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5",
                            pathname === item.href ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"
                        )} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-50">
                <div className="bg-slate-50 rounded-3xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase">
                            {user ? `${user.firstName[0]}${user.lastName[0]}` : "JD"}
                        </div>
                        <div>
                            <p className="text-sm font-black text-legal-navy truncate max-w-[120px]">
                                {user ? `${user.firstName} ${user.lastName}` : "Jane Doe"}
                            </p>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{user?.plan || "Free"} Plan</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
