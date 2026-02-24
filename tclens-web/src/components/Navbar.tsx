"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoggedIn(auth.isAuthenticated());
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-3" : "bg-transparent py-5"
        )}>
            <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 font-outfit tracking-tighter">Terms Analyzer</span>
                </Link>

                <div className="hidden md:flex items-center gap-10">
                    {[
                        { name: "Features", href: "#" },
                        { name: "How It Works", href: "#" },
                        { name: "Pricing", href: "/pricing" },
                        { name: "Install Extension", href: "#install-extension" }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-sm font-semibold transition-colors",
                                pathname === item.href
                                    ? "text-purple-600"
                                    : "text-slate-600 hover:text-purple-600"
                            )}
                            aria-current={pathname === item.href ? "page" : undefined}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/signin" className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors hidden sm:block">
                        Sign In
                    </Link>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 font-bold" asChild>
                        <Link href="/signup">Get Started</Link>
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
                    {[
                        { name: "Features", href: "#" },
                        { name: "How It Works", href: "#" },
                        { name: "Pricing", href: "/pricing" },
                        { name: "Install Extension", href: "#install-extension" }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "block text-lg font-bold transition-colors",
                                pathname === item.href
                                    ? "text-purple-600"
                                    : "text-slate-900 hover:text-purple-600"
                            )}
                            aria-current={pathname === item.href ? "page" : undefined}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-slate-50 flex flex-col gap-4">
                        <Link href="/signin" className="text-lg font-bold text-slate-600" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </div>
                </div>
            )}
        </header>
    );
}
