"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(auth.isAuthenticated());
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-legal-navy rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xl font-bold text-legal-navy font-outfit">TCLens</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link href="/" className="hover:text-legal-navy transition-colors">Home</Link>
                        <Link href="/upload" className="hover:text-legal-navy transition-colors">Analyze</Link>
                        <Link href="/pricing" className="hover:text-legal-navy transition-colors">Pricing</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Button size="sm" className="bg-legal-navy hover:bg-slate-800 text-white px-5 rounded-xl font-bold" asChild>
                                <Link href="/app/document">Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                                    <Link href="/signin">Sign In</Link>
                                </Button>
                                <Button size="sm" className="bg-legal-navy hover:bg-slate-800 text-white px-5 rounded-xl font-bold" asChild>
                                    <Link href="/signup">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
