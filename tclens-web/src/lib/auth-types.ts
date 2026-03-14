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
