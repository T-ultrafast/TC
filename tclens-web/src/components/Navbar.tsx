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
import { motion, AnimatePresence } from "framer-motion";

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
                    {!isLoggedIn ? null : (
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
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden fixed inset-0 top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-xl z-[60] p-8 flex flex-col space-y-6"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <Logo />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 -mr-2 bg-slate-50 rounded-full text-slate-900 border border-slate-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            {navLinks.map((item, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 + 0.1 }}
                                    key={item.name}
                                >
                                    <Link
                                        href={item.href}
                                        className="text-2xl font-medium text-slate-900 py-3 block border-b border-slate-50 tracking-tight"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-8 flex flex-col gap-4 mt-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <Link
                                    href="/signin"
                                    className="text-lg font-medium text-slate-500 px-2 py-4 block hover:text-tclens-500 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login to Account
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Button size="lg" className="w-full h-16 bg-tclens-500 text-white rounded-card font-bold text-lg shadow-none" asChild>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Create Free Account</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
