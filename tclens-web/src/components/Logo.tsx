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
        <Link href="/" className={cn("flex items-center gap-2 group cursor-pointer", className)}>
            <div className="w-9 h-9 bg-tclens-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                <Shield className="w-5 h-5 text-white" />
            </div>
            {!iconOnly && (
                <span className="text-xl font-bold text-foreground font-jakarta tracking-tight">
                    Tc<span className="text-tclens-500">Lens</span>
                </span>
            )}
        </Link>
    );
}
