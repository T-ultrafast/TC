// TCLens Configuration
// Change this to your production URL when deploying
const TCLENS_CONFIG = {
    // Default to localhost for development
    // For production, you could auto-detect or hardcode the deployed URL
    // e.g., 'https://terms-analyzer-app.netlify.app'
    API_BASE_URL: 'https://api.tclens.net',

    // Helper to get the correct URL (expandable for future logic)
    getApiUrl: function () {
        return this.API_BASE_URL;
    }
};

// Prevent errors if loaded effectively multiple times or in different contexts
if (typeof window !== 'undefined') {
    window.TCLENS_CONFIG = TCLENS_CONFIG;
}
