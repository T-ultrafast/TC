/**
 * Enforces a word limit on a string by counting whitespace-separated tokens.
 * Trims the string if it exceeds the limit.
 */
export function enforceWordLimit(text: string, limit: number): string {
    if (!text) return "";

    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text;

    return words.slice(0, limit).join(" ") + "...";
}

/**
 * Counts the number of words in a string.
 */
export function countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
}
