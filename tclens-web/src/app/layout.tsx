import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Terms Analyzer - Smart Legal Document Analysis",
    description: "Actually understand what you're agreeing to with AI-powered legal document summaries.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn("min-h-screen bg-white font-sans antialiased", "font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Arial,sans-serif]")}>
                {children}
            </body>
        </html>
    );
}
