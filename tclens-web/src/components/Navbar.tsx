"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, ArrowRight, Sun, Moon, Laptop } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isLoggedIn = !!session;
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "/#features" },
        { name: "How it works", href: "/#workflow" },
        { name: "Pricing", href: "/pricing" },
        { name: "Support", href: "#" }
    ];

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
            scrolled ? "bg-white/95 border-b border-tclens-100/50 py-1.5 shadow-sm shadow-tclens-500/5" : "py-2 bg-tclens-50/80 backdrop-blur-md"
        )}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Logo />

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-[13px] font-bold transition-colors hover:text-tclens-500",
                                pathname === item.href ? "text-tclens-500" : "text-slate-500"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    {!isLoggedIn ? (
                        <>
                            <Link href="/signin" className="text-[13px] font-bold text-slate-500 hover:text-tclens-500 transition-colors hidden sm:block">
                                Login
                            </Link>
                            <Button
                                className="bg-tclens-500 hover:bg-tclens-600 text-white rounded-card px-5 h-10 font-bold text-sm transition-all border border-tclens-400"
                                asChild
                            >
                                <Link href="/signup">
                                    Sign Up
                                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="bg-tclens-500 hover:bg-tclens-600 text-white rounded-card px-6 font-bold text-sm"
                            asChild
                        >
                            <Link href="/app/document">
                                Dashboard
                            </Link>
                        </Button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-0 left-0 w-full h-screen bg-white z-[60] p-8 flex flex-col space-y-6 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <Logo />
                        <button onClick={() => setMobileMenuOpen(false)}>
                            <X className="w-8 h-8 text-slate-600" />
                        </button>
                    </div>

                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-2xl font-bold text-slate-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}

                    <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                        <Link href="/signin" className="text-lg font-bold text-slate-600" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        <Button size="lg" className="w-full bg-tclens-500 text-white rounded-card font-bold" asChild>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
