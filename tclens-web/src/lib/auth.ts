import { resetAccountUsage } from "./usage";

const AUTH_KEY = "tc_reader_auth";
const USER_KEY = "tc_reader_user";

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    jurisdiction?: string;
    plan: "free" | "pro" | "business" | "unlimited";
    role: "user" | "lawyer" | "admin";
    wordsUsed: number;
    wordsLimit: number;
    createdAt: string;
}

export interface LawyerProfile extends UserProfile {
    role: "lawyer";
    professionalTitle: string;
    licenseNumber: string;
    issuingAuthority: string;
    jurisdictionsOfPractice: string[];
    licenseStatus: string;
    yearOfAdmission: number;
    practiceAreas: string[];
    secondaryExpertise?: string;
    clientTypes: string[];
    consultationTypes: string[];
    availability: string[];
    hourlyRate?: string;
    bio: string;
    lawFirm?: string;
    website?: string;
    languages: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
    attestationName?: string;
    acceptedJurisdiction?: boolean;
    acceptedPlatform?: boolean;
    acceptedCodeOfConduct?: boolean;
    certifiedAccurate?: boolean;
}

export const auth = {
    // Check if the user is currently authenticated
    isAuthenticated: (): boolean => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(AUTH_KEY) === "true";
    },

    // Get current user profile
    getUser: (): UserProfile | LawyerProfile | null => {
        if (typeof window === "undefined") return null;
        const userStr = localStorage.getItem(USER_KEY);

        // If authenticated but no user profile, still return a mock unlimited shell
        if (auth.isAuthenticated() && !userStr) {
            return {
                firstName: "User",
                lastName: "",
                email: "",
                plan: "unlimited",
                role: "user",
                wordsUsed: 0,
                wordsLimit: Infinity as any,
                createdAt: new Date().toISOString()
            } as any;
        }

        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr);
            user.plan = 'unlimited'; // Force unlimited plan
            return user;
        } catch (e) {
            return null;
        }
    },

    // Perform a fake sign up
    signUp: (data: Partial<UserProfile | LawyerProfile>) => {
        if (typeof window !== "undefined") {
            const isLawyer = data.role === "lawyer";
            const newUser: any = {
                ...data,
                plan: "unlimited", // Temporary Dev Override
                role: data.role || "user",
                wordsUsed: 0,
                wordsLimit: isLawyer ? 50000 : 10000,
                createdAt: new Date().toISOString()
            };

            if (isLawyer) {
                newUser.verificationStatus = 'pending';
            }

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
