// TCLens Content Script v5 - Shadow DOM Implementation
// TCLens Content Script v5 - Shadow DOM Implementation

// Global reference for the shadow root
let tclensShadowRoot = null;

// Initialize Shadow DOM root
function initShadow() {
    if (tclensShadowRoot) return tclensShadowRoot;

    const host = document.createElement("div");
    host.id = "tclens-root";
    // Ensure the host itself doesn't affect layout
    host.style.cssText = "position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;";
    document.body.appendChild(host);

    tclensShadowRoot = host.attachShadow({ mode: 'open' });

    // Inject Shared Styles
    const style = document.createElement('style');
    style.textContent = `
        :host {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
        }

        .tclens-badge {
            position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
            background: #0f172a; color: white; padding: 12px 16px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s ease-out;
            cursor: pointer; transition: transform 0.2s; max-width: 320px;
            pointer-events: auto;
        }

        .tclens-badge:hover { transform: scale(1.02); }

        /* Compact Panel - Top Right */
        .tclens-panel {
            position: fixed; top: 20px; right: 20px; z-index: 2147483647;
            background: white; border-radius: 16px; width: 320px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            display: flex; flex-direction: column; overflow: hidden;
            border: 1px solid #e2e8f0; animation: slideInTop 0.3s ease-out;
            max-height: 80vh;
            pointer-events: auto;
        }

        .panel-header {
            padding: 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
            display: flex; justify-content: space-between; align-items: flex-start;
        }

        .risk-score-container {
            display: flex; align-items: baseline; gap: 4px;
        }

        .panel-body {
            padding: 16px; overflow-y: auto; flex: 1;
        }

        .tclens-close-btn {
            background: none; border: none; color: #64748b; cursor: pointer;
            font-size: 20px; padding: 4px; border-radius: 6px; line-height: 1;
            transition: background 0.2s;
        }

        .tclens-close-btn:hover { background: #f1f5f9; color: #334155; }

        .flag-item {
            padding: 12px; background: #fff1f2; border: 1px solid #fecdd3;
            border-radius: 8px; margin-bottom: 10px; display: flex; gap: 10px;
        }
        
        .flag-icon { font-size: 16px; flex-shrink: 0; margin-top: 2px; }

        .flag-content strong {
            display: block; font-size: 13px; color: #9f1239; margin-bottom: 2px;
            text-transform: capitalize;
        }
        
        .flag-content p {
            margin: 0; font-size: 12px; line-height: 1.4; color: #881337;
        }

        .cta-button {
            display: block; width: 100%; padding: 12px; margin-top: 16px;
            background: #0f172a; color: white; text-align: center;
            border: none; border-radius: 10px; font-weight: 600; font-size: 13px;
            cursor: pointer; transition: background 0.2s; text-decoration: none;
        }
        
        .cta-button:hover { background: #1e293b; }

        .no-flags {
            padding: 20px; text-align: center; color: #64748b; font-size: 13px;
            background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;
        }

        @keyframes slideIn { 
            from { transform: translateY(20px); opacity: 0; } 
            to { transform: translateY(0); opacity: 1; } 
        }
        
        @keyframes slideInTop { 
            from { transform: translateY(-20px); opacity: 0; } 
            to { transform: translateY(0); opacity: 1; } 
        }
    `;
    tclensShadowRoot.appendChild(style);

    return tclensShadowRoot;
}

// Extract text intelligently: Prefer main content, skip nav/footer
function extractPageText() {
    // Clone body to avoid modifying the live page
    const clone = document.body.cloneNode(true);

    // Remove unwanted elements
    const unwantedSelectors = [
        'nav', 'footer', 'header', 'aside', 'script', 'style', 'noscript',
        '.nav', '.footer', '.header', '.sidebar', '.menu', '#menu',
        '[role="navigation"]', '[role="contentinfo"]', '[aria-hidden="true"]'
    ];

    unwantedSelectors.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });

    // Try to find the "main" content container
    const mainSelectors = ['main', 'article', '#content', '#main', '.content', '.main'];
    let mainContent = null;

    for (const selector of mainSelectors) {
        const el = clone.querySelector(selector);
        if (el && el.innerText.length > 500) { // arbitrary threshold for "substantial" content
            mainContent = el;
            break;
        }
    }

    // Default to the cleaned body if no main container found
    const target = mainContent || clone;

    // Get text and clean up whitespace
    let text = target.innerText || "";
    text = text.replace(/\s+/g, ' ').trim(); // Collapsing multiple spaces/newlines

    return text.substring(0, 50000);
}

// Helper to send message to background script
function callBackgroundApi(action, payload) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action, payload }, (response) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            if (response && response.success) {
                resolve(response.data);
            } else {
                reject(response?.error || "Unknown error");
            }
        });
    });
}

function showBadge(detectionResult) {
    const root = initShadow();
    if (root.getElementById("tclens-badge")) return;

    const badge = document.createElement("div");
    badge.id = "tclens-badge";
    badge.className = "tclens-badge";

    const docType = detectionResult.document_type || "Legal Content";
    const confidence = detectionResult.confidence || 0;

    badge.innerHTML = `
        <div style="font-size: 20px;">🛡️</div>
        <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 13px; letter-spacing: -0.01em;">${docType}</div>
            <div style="font-size: 11px; color: #94a3b8;">${confidence}% confidence</div>
        </div>
        <button id="tclens-close" class="tclens-close-btn">×</button>
    `;

    badge.onclick = (e) => {
        if (e.target.id !== "tclens-close") {
            // Trigger analysis popup
            performAnalysis();
        }
    };

    root.appendChild(badge);

    root.getElementById("tclens-close").onclick = (e) => {
        e.stopPropagation();
        badge.remove();
    };
}

function showCompactPanel(data) {
    const root = initShadow();

    // Remove existing badge or panel if present
    const existingBadge = root.getElementById("tclens-badge");
    if (existingBadge) existingBadge.remove();

    const existingPanel = root.getElementById("tclens-panel");
    if (existingPanel) return; // Already showing

    const panel = document.createElement("div");
    panel.id = "tclens-panel";
    panel.className = "tclens-panel";

    const riskScore = data.risk_score || 0;
    const riskColor = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : '#10b981';
    const riskLevel = data.risk_level || (riskScore >= 81 ? 'Severe' : riskScore >= 61 ? 'High' : riskScore >= 31 ? 'Moderate' : 'Low');

    // Build flags HTML
    let flagsHtml = '';
    let flagCount = 0;

    // Use breakdown if available for "Explainability"
    if (data.breakdown && data.breakdown.length > 0) {
        data.breakdown.forEach((risk) => {
            if (flagCount < 5) {
                flagCount++;
                flagsHtml += `
                    <div class="flag-item">
                        <span class="flag-icon">🚩</span>
                        <div class="flag-content">
                            <strong>${risk.label} (+${risk.weight})</strong>
                            <p>${risk.evidence}</p>
                        </div>
                    </div>
                `;
            }
        });
    } else if (data.critical_warnings) {
        // Fallback to critical_warnings if breakdown is missing
        Object.entries(data.critical_warnings).forEach(([key, warning]) => {
            if (warning.value && flagCount < 5) {
                flagCount++;
                const title = key.replace(/_/g, ' ');
                flagsHtml += `
                    <div class="flag-item">
                        <span class="flag-icon">⚠️</span>
                        <div class="flag-content">
                            <strong>${title}</strong>
                            <p>${warning.reason}</p>
                        </div>
                    </div>
                `;
            }
        });
    }

    if (!flagsHtml) {
        flagsHtml = `
            <div class="no-flags">
                <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                No major red flags detected<br>in this summary.
            </div>
        `;
    }

    panel.innerHTML = `
        <div class="panel-header">
            <div>
                <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${data.document_type || 'Legal Analysis'}</h2>
                <div class="risk-score-container" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <span style="font-size: 32px; font-weight: 900; color: ${riskColor}; line-height: 1;">${riskScore}</span>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">/ 100 Risk</span>
                        <span style="font-size: 12px; color: ${riskColor}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${riskLevel}</span>
                    </div>
                </div>
            </div>
            <button id="tclens-panel-close" class="tclens-close-btn">×</button>
        </div>
        
        <div class="panel-body">
            <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                ${flagCount > 0 ? 'Why this score?' : 'Analysis Result'}
            </h3>
            
            <div style="max-height: 300px; overflow-y: auto; padding-right: 4px;">
                ${flagsHtml}
            </div>
            
            <button id="tclens-full-report" class="cta-button" style="margin-top: 16px;">
                Open Full Report ↗
            </button>
        </div>
    `;

    root.appendChild(panel);

    root.getElementById("tclens-panel-close").onclick = () => panel.remove();

    root.getElementById("tclens-full-report").onclick = () => {
        // Here you would typically open your web app with the text payload
        // For now, let's just alert or log, or open the base URL
        const appUrl = (typeof TCLENS_CONFIG !== 'undefined') ? TCLENS_CONFIG.getApiUrl() : 'http://localhost:3000';
        window.open(`${appUrl}/dashboard`, '_blank');
    };
}

async function performAnalysis() {
    try {
        const pageText = extractPageText();

        // Use background script to analyze
        const result = await callBackgroundApi("analyze", {
            page_text: pageText,
            url: window.location.href
        });

        if (result) {
            showCompactPanel(result);
        }
    } catch (error) {
        console.error('TCLens: Analysis failed', error);
        alert("Analysis failed. Please check the extension connection.");
    }
}

async function detectLegalContent() {
    try {
        // Skip auto-detection if we are on the TCLens web app itself
        const appDomains = ["localhost", "tclens-web.vercel.app", "tclens.net"];
        if (appDomains.some(domain => window.location.hostname.includes(domain))) {
            console.log('TCLens: Auto-detection skipped on app domain');
            return;
        }

        const pageText = extractPageText();

        // Use background script to detect
        const result = await callBackgroundApi("detect", {
            page_text: pageText,
            url: window.location.href,
            title: document.title
        });

        if (result.trigger_recommendation === 'show_popup') {
            if (result.short_summary) {
                showCompactPanel(result);
            } else {
                performAnalysis();
            }
        } else if (result.trigger_recommendation === 'show_badge') {
            showBadge(result);
        }

    } catch (error) {
        console.error('TCLens: Detection failed', error);
    }
}

// Handshake for TCLens web app
function sendHandshake() {
    const appDomains = ["localhost", "tclens-web.vercel.app", "tclens.net"];
    if (appDomains.some(domain => window.location.hostname.includes(domain))) {
        console.log('TCLens: Sending handshake to web app');
        window.postMessage({ type: "TCLENS_HANDSHAKE" }, "*");
    }
}

// Startup
sendHandshake();
setTimeout(detectLegalContent, 2000);

let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(detectLegalContent, 2000);
    }
}).observe(document, { subtree: true, childList: true });

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "open_popup") {
        performAnalysis();
    }
});
