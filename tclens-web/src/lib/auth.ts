import { resetAccountUsage } from "./usage";

const AUTH_KEY = "tc_reader_auth";
const USER_KEY = "tc_reader_user";

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    jurisdiction?: string;
    plan: "free" | "pro" | "business";
    wordsUsed: number;
    wordsLimit: number;
    createdAt: string;
}

export const auth = {
    // Check if the user is currently authenticated
    isAuthenticated: (): boolean => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(AUTH_KEY) === "true";
    },

    // Get current user profile
    getUser: (): UserProfile | null => {
        if (typeof window === "undefined") return null;
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    },

    // Perform a fake sign up
    signUp: (data: Pick<UserProfile, 'firstName' | 'lastName' | 'email' | 'jurisdiction'>) => {
        if (typeof window !== "undefined") {
            const newUser: UserProfile = {
                ...data,
                plan: "free",
                wordsUsed: 0,
                wordsLimit: 10000,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
            localStorage.setItem(AUTH_KEY, "true");
            resetAccountUsage();
        }
    },

    // Perform a fake sign in
    signIn: (email: string) => {
        if (typeof window !== "undefined") {
            // In a fake system, we just set auth to true. 
            // If user exists in storage, we keep it. If not, we'd typically error or create a mock.
            localStorage.setItem(AUTH_KEY, "true");
        }
    },

    // Update profile (e.g., from settings)
    updateUser: (updates: Partial<UserProfile>) => {
        if (typeof window === "undefined") return;
        const current = auth.getUser();
        if (current) {
            const updated = { ...current, ...updates };
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
        }
    },

    // Perform a fake sign out
    signOut: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_KEY);
            // We usually keep USER_KEY for remembered sessions in real apps, 
            // but for this MVP sign out clears the flag.
        }
    },

    // Clear everything (Delete account)
    clearAll: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(USER_KEY);
        }
    }
};
