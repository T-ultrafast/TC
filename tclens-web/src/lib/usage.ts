/**
 * Usage and Word Count Utility
 * Handles counting words and tracking user quotas.
 */

export const LIMITS = {
    ANONYMOUS: 5000,
    FREE_ACCOUNT: 10000,
    PRO: 100000,
    BUSINESS: 500000,
    UNLIMITED: Infinity
};

export const UNLIMITED_MODE = true; // Global Dev Toggle

const STORAGE_KEYS = {
    ANON_USAGE: "tc_reader_anon_word_count",
    ACCOUNT_USAGE: "tc_reader_account_word_count"
};

/**
 * Robust word count based on whitespace and line breaks
 */
export const countWords = (text: string): number => {
    if (!text) return 0;
    // Normalize: remove extra whitespace, convert line breaks to spaces
    const normalized = text
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!normalized) return 0;
    return normalized.split(' ').length;
};

/**
 * Get the current usage from localStorage
 */
export const getUsage = (isLoggedIn: boolean): number => {
    if (typeof window === "undefined") return 0;
    const key = isLoggedIn ? STORAGE_KEYS.ACCOUNT_USAGE : STORAGE_KEYS.ANON_USAGE;
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : 0;
};

/**
 * Track new usage
 */
export const trackUsage = (words: number, isLoggedIn: boolean): number => {
    if (typeof window === "undefined") return 0;
    const current = getUsage(isLoggedIn);
    const updated = current + words;
    const key = isLoggedIn ? STORAGE_KEYS.ACCOUNT_USAGE : STORAGE_KEYS.ANON_USAGE;
    localStorage.setItem(key, updated.toString());
    return updated;
};

/**
 * Get remaining quota based on a specific limit
 */
export const getRemainingQuota = (isLoggedIn: boolean, limit: number): number => {
    const usage = getUsage(isLoggedIn);
    return Math.max(0, limit - usage);
};

/**
 * Check if the user has reached their limit
 */
export const hasReachedLimit = (isLoggedIn: boolean, incomingText: string, limit: number): boolean => {
    const remaining = getRemainingQuota(isLoggedIn, limit);
    const wordCount = countWords(incomingText);
    return wordCount > remaining;
};

/**
 * Reset usage for a new free account (as per T2)
 */
export const resetAccountUsage = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_USAGE, "0");
};
