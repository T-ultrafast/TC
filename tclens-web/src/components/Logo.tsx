"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
    return (
        <Link href="/" className={cn("flex items-center gap-3 group cursor-pointer", className)}>
            <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform duration-500 relative">
                <Shield className="w-6 h-6 text-emerald-600 relative z-10" />
            </div>
            {!iconOnly && (
                <span className="text-2xl font-black text-foreground font-playfair tracking-tight">
                    TC<span className="text-emerald-600">Lens</span>
                </span>
            )}
        </Link>
    );
}
