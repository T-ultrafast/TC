import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'src/lib/db.json');

export interface AnalysisRecord {
    id: string;
    userId: string;
    createdAt: string;
    inputType: "file" | "text" | "link";
    sourceName: string;
    jurisdiction: string;
    wordCount: number;
    summaryTitle: string;
    rawInputReference: string | { preview: string; hash: string };
    analysisResult: any;
}

export interface AnalysisChatMessage {
    id: string;
    analysisId: string;
    userId: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

export interface Case {
    id: string;
    userId: string;
    title: string;
    description?: string;
    status: "Active" | "Pending" | "Completed";
    createdAt: string;
    updatedAt: string;
}

export interface Attachment {
    id: string;
    caseId: string;
    userId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string; // Relative path in public/uploads
    uploadedAt: string;
}

export interface Lawyer {
    id: string;
    userId: string;
    name: string;
    title: string; // e.g. "Senior Partner"
    avatarUrl?: string;
    licenseNumber: string;
    barAssociation: string;
    specialties: string[];
    city: string;
    state: string;
    country: string;
    hourlyRate: number;
    bio?: string;
    rating?: number;
    reviewsCount?: number;
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'approved';
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}


interface DB {
    analyses: AnalysisRecord[];
    messages: AnalysisChatMessage[];
    cases: Case[];
    attachments: Attachment[];
    lawyers: Lawyer[];
}

function ensureDB() {
    if (!fs.existsSync(DB_PATH)) {
        const initialDB: DB = { analyses: [], messages: [], cases: [], attachments: [], lawyers: [] };
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    }
}

function getDB(): DB {
    ensureDB();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure new arrays exist for legacy DBs
    if (!parsed.cases) parsed.cases = [];
    if (!parsed.attachments) parsed.attachments = [];
    if (!parsed.lawyers) parsed.lawyers = [];
    return parsed;
}

function saveToDB(db: DB) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const storage = {
    // Analysis History
    saveAnalysis: async (record: Omit<AnalysisRecord, 'id'>): Promise<AnalysisRecord> => {
        const db = getDB();
        const newRecord = {
            ...record,
            id: record.userId === 'anonymous' ? crypto.randomUUID() : Math.random().toString(36).substring(7)
        };
        db.analyses.push(newRecord);
        saveToDB(db);
        return newRecord;
    },

    getAnalysisByIdOnly: async (id: string): Promise<AnalysisRecord | null> => {
        const db = getDB();
        const record = db.analyses.find(a => a.id === id);
        return record || null;
    },

    getAnalysisHistory: async (userId: string): Promise<AnalysisRecord[]> => {
        const db = getDB();
        return db.analyses
            .filter(a => a.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getAnalysisById: async (id: string, userId: string): Promise<AnalysisRecord | null> => {
        const db = getDB();
        const record = db.analyses.find(a => a.id === id);
        if (!record || record.userId !== userId) return null;
        return record;
    },

    deleteAnalysis: async (id: string, userId: string): Promise<boolean> => {
        const db = getDB();
        const index = db.analyses.findIndex(a => a.id === id && a.userId === userId);
        if (index === -1) return false;
        db.analyses.splice(index, 1);
        // Also delete associated messages
        db.messages = db.messages.filter(m => m.analysisId !== id);
        saveToDB(db);
        return true;
    },

    // Chat History
    saveChatMessage: async (message: Omit<AnalysisChatMessage, 'id'>): Promise<AnalysisChatMessage> => {
        const db = getDB();
        const newMessage = { ...message, id: Math.random().toString(36).substring(7) };
        db.messages.push(newMessage);
        saveToDB(db);
        return newMessage;
    },

    getChatHistory: async (analysisId: string, userId: string): Promise<AnalysisChatMessage[]> => {
        const db = getDB();
        // Verify ownership through the analysis record first
        const analysis = db.analyses.find(a => a.id === analysisId);
        if (!analysis || analysis.userId !== userId) return [];

        return db.messages
            .filter(m => m.analysisId === analysisId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },

    // Case Management
    createCase: async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Case> => {
        const db = getDB();
        const newCase: Case = {
            ...caseData,
            id: Math.random().toString(36).substring(7),
            status: "Active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        db.cases.push(newCase);
        saveToDB(db);
        return newCase;
    },

    getCases: async (userId: string): Promise<(Case & { attachmentCount: number })[]> => {
        const db = getDB();
        const userCases = db.cases
            .filter(c => c.userId === userId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return userCases.map(c => ({
            ...c,
            attachmentCount: db.attachments.filter(a => a.caseId === c.id).length
        }));
    },

    getCaseById: async (id: string, userId: string): Promise<Case | null> => {
        const db = getDB();
        const record = db.cases.find(c => c.id === id && c.userId === userId);
        return record || null;
    },

    addAttachment: async (attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>): Promise<Attachment> => {
        const db = getDB();
        const newAttachment: Attachment = {
            ...attachmentData,
            id: Math.random().toString(36).substring(7),
            uploadedAt: new Date().toISOString()
        };
        db.attachments.push(newAttachment);

        // Update case timestamp
        const caseIndex = db.cases.findIndex(c => c.id === attachmentData.caseId);
        if (caseIndex !== -1) {
            db.cases[caseIndex].updatedAt = new Date().toISOString();
        }

        saveToDB(db);
        return newAttachment;
    },

    getAttachments: async (caseId: string, userId: string): Promise<Attachment[]> => {
        const db = getDB();
        // Verify case ownership
        const caseRecord = db.cases.find(c => c.id === caseId && c.userId === userId);
        if (!caseRecord) return [];

        return db.attachments
            .filter(a => a.caseId === caseId)
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    },

    deleteAttachment: async (id: string, userId: string): Promise<boolean> => {
        const db = getDB();
        const attachment = db.attachments.find(a => a.id === id);
        if (!attachment || attachment.userId !== userId) return false;

        db.attachments = db.attachments.filter(a => a.id !== id);
        saveToDB(db);
        return true;
    },

    // Lawyer Directory
    createLawyerProfile: async (profile: Omit<Lawyer, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>): Promise<Lawyer> => {
        const db = getDB();
        // Check if profile already exists for user
        const existing = db.lawyers.find(l => l.userId === profile.userId);
        if (existing) throw new Error("Lawyer profile already exists");

        const newLawyer: Lawyer = {
            ...profile,
            id: Math.random().toString(36).substring(7),
            verificationStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        db.lawyers.push(newLawyer);
        saveToDB(db);
        return newLawyer;
    },

    updateLawyerProfile: async (userId: string, updates: Partial<Lawyer>): Promise<Lawyer | null> => {
        const db = getDB();
        const index = db.lawyers.findIndex(l => l.userId === userId);
        if (index === -1) return null;

        const updatedLawyer = { ...db.lawyers[index], ...updates, updatedAt: new Date().toISOString() };
        db.lawyers[index] = updatedLawyer;
        saveToDB(db);
        return updatedLawyer;
    },

    getLawyerProfile: async (userId: string): Promise<Lawyer | null> => {
        const db = getDB();
        return db.lawyers.find(l => l.userId === userId) || null;
    },

    searchLawyers: async (query: string, location: string): Promise<Lawyer[]> => {
        const db = getDB();
        // Filter by verified status first
        let results = db.lawyers.filter(l => l.verificationStatus === 'verified' || l.verificationStatus === 'approved');

        if (location) {
            const locLower = location.toLowerCase();
            results = results.filter(l =>
                (l.city && l.city.toLowerCase().includes(locLower)) ||
                (l.state && l.state.toLowerCase().includes(locLower)) ||
                (l.country && l.country.toLowerCase().includes(locLower))
            );
        }

        if (query) {
            const qLower = query.toLowerCase();
            results = results.filter(l =>
                l.name.toLowerCase().includes(qLower) ||
                (l.title && l.title.toLowerCase().includes(qLower)) ||
                (l.specialties && l.specialties.some(s => s.toLowerCase().includes(qLower))) ||
                (l.bio && l.bio.toLowerCase().includes(qLower))
            );
        }

        return results;
    }
};

