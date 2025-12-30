import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "TCLens - Terms & Conditions Intelligence",
    description: "AI-powered legal document analysis and lawyer marketplace.",
};

import { Navbar } from "@/components/Navbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.variable, outfit.variable, "min-h-screen bg-white font-sans antialiased")}>
                {/* Navbar is handled conditionally or only on landing pages */}
                {children}
            </body>
        </html>
    );
}
