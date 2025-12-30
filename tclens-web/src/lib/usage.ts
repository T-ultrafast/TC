/**
 * Usage and Word Count Utility
 * Handles counting words and tracking user quotas.
 */

export const LIMITS = {
    ANONYMOUS: 5000,
    FREE_ACCOUNT: 10000,
    PRO: 100000,
    BUSINESS: 500000
};

const STORAGE_KEYS = {
    ANON_USAGE: "tc_reader_anon_word_count",
    ACCOUNT_USAGE: "tc_reader_account_word_count"
};

/**
 * Simple word count based on whitespace
 */
export const countWords = (text: string): number => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
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
 * Get remaining quota
 */
export const getRemainingQuota = (isLoggedIn: boolean): number => {
    const usage = getUsage(isLoggedIn);
    const limit = isLoggedIn ? LIMITS.FREE_ACCOUNT : LIMITS.ANONYMOUS;
    return Math.max(0, limit - usage);
};

/**
 * Check if the user has reached their limit
 */
export const hasReachedLimit = (isLoggedIn: boolean, incomingText: string): boolean => {
    const remaining = getRemainingQuota(isLoggedIn);
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
