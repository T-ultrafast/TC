// TCLens Service Worker
// Handles background tasks and API proxying if needed in the future.

chrome.runtime.onInstalled.addListener(() => {
    console.log("TCLens extension installed.");
});

// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "open_popup") {
        console.log("Open popup requested");
    }

    if (request.action === "analyze" || request.action === "detect") {
        // Handle API calls via background script to bypass CSP
        (async () => {
            try {
                // Use config from global scope (injected via manifest) or fallback
                const API_BASE_URL = (typeof TCLENS_CONFIG !== 'undefined') ? TCLENS_CONFIG.getApiUrl() : 'http://localhost:3000';
                const endpoint = request.action === "detect" ? "/api/extension/detect" : "/api/extension/analyze";

                // Add default report_id to payload if missing for analyze
                if (request.action === "analyze" && !request.payload.report_id) {
                    request.payload.report_id = 'new';
                }

                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request.payload)
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                sendResponse({ success: true, data });
            } catch (error) {
                console.error("Background API Error:", error);
                sendResponse({ success: false, error: error.toString() });
            }
        })();
        return true; // Keep the message channel open for async response
    }
});
