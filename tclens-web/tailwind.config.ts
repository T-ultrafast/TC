import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1600px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Custom Legal Palette
                legal: {
                    navy: "#0f172a", // Deep Navy
                    slate: "#64748b", // Slate
                    emerald: "#10b981", // Safe
                    amber: "#f59e0b", // Warning
                    red: "#ef4444", // Danger
                },
                // Redesign Colors
                brand: {
                    lavender: {
                        base: "#FBFAFF",
                        glow1: "#F3E8FF",
                        glow2: "#FBE7F2",
                        text: "#7C3AED", // Accent Purple
                    },
                    teal: {
                        base: "#F6FDFF",
                        tint: "#E9FBFF",
                        ctaTop: "#0A9F86",
                        ctaBottom: "#078A76",
                    },
                    cream: {
                        base: "#FFF8ED",
                        tint: "#FFF2DE",
                    },
                    navy: {
                        primary: "#081427",
                        secondary: "#0A1B33",
                    }
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                jakarta: ["var(--font-jakarta)"],
            },
            keyframes: {
                gradient: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
            },
            animation: {
                gradient: "gradient 6s ease infinite",
            },
        },
    },
    plugins: [],
};
export default config;
