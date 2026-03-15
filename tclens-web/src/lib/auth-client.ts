import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Legacy auth compatibility layer for design mode
export const auth = {
    isAuthenticated: () => true,
    getUser: () => ({
        firstName: "Demo",
        lastName: "User",
        email: "demo@tclens.com",
        role: "admin" as const,
        plan: "pro" as const,
        wordsLimit: 10000,
        wordsUsed: 1200,
        createdAt: new Date().toISOString(),
        jurisdiction: "California, USA"
    }),
    updateUser: (data: any) => {
        console.log("[Mock Auth] Update User:", data);
    },
    signOut: () => {
        console.log("[Mock Auth] Signing out...");
    },
    clearAll: () => {
        console.log("[Mock Auth] Clearing all data...");
    }
};
