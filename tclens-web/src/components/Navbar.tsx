"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, ArrowRight, Sun, Moon, Laptop } from "lucide-react";
import { auth } from "@/lib/auth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

export function Navbar() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsLoggedIn(auth.isAuthenticated());
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Intelligence", href: "/#features" },
        { name: "Workflow", href: "/#workflow" },
        { name: "Pricing", href: "/pricing" },
        { name: "Extension", href: "#" }
    ];

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
            scrolled ? "py-4" : "py-8"
        )}>
            <div className="max-w-[1800px] mx-auto px-6">
                <nav className={cn(
                    "relative flex items-center justify-between transition-all duration-500",
                    scrolled ? "bg-background/80 backdrop-blur-2xl border border-border rounded-[2rem] px-8 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]" : "px-0"
                )}>
                    <Logo />

                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-xs font-black uppercase tracking-[0.2em] transition-all relative group/link",
                                    pathname === item.href || (item.href.startsWith("/#") && pathname === "/")
                                        ? "text-emerald-500"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.name}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300",
                                    "group-hover/link:w-full"
                                )} />
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
                                className="w-10 h-10 rounded-none flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all focus:outline-none"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? <Moon className="w-4 h-4" /> : theme === "light" ? <Sun className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                            </button>
                        )}
                        <Link href="/signin" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                            Auth
                        </Link>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-none px-6 font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl"
                            asChild
                        >
                            <Link href="/signup">
                                Initialize
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-0 left-0 w-full h-screen bg-background/95 backdrop-blur-3xl z-40 p-12 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <button
                        className="absolute top-8 right-6 p-2 text-muted-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-3xl font-black font-playfair transition-all tracking-tighter",
                                pathname === item.href
                                    ? "text-emerald-500"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-8 border-t border-border w-full flex flex-col items-center gap-6">
                        <Link href="/signin" className="text-xl font-bold text-muted-foreground hover:text-foreground font-playfair" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                        <Button size="xl" className="w-full bg-emerald-600 text-white hover:bg-emerald-500 rounded-none font-bold" asChild>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
