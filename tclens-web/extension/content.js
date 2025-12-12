// TCLens Content Script v4 - T3 Implementation

const API_BASE_URL = 'http://localhost:3000';

// Extract visible text from the page
function extractPageText() {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());
    
    // Get visible text
    const bodyText = document.body.innerText || document.body.textContent || '';
    
    // Limit to reasonable size (first 50000 chars)
    return bodyText.substring(0, 50000);
}

// Show badge notification
function showBadge(detectionResult) {
    // Check if already shown
    if (document.getElementById("tclens-badge")) return;

    const div = document.createElement("div");
    div.id = "tclens-badge";
    div.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
        background: #0f172a; color: white; padding: 16px; border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: 'Segoe UI', sans-serif;
        display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s ease-out;
        cursor: pointer; transition: transform 0.2s; max-width: 320px;
    `;

    const docType = detectionResult.document_type || "Legal Content";
    const confidence = detectionResult.confidence || 0;
    
    div.innerHTML = `
        <div style="font-size: 24px;">🛡️</div>
        <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 14px;">${docType} Detected</div>
            <div style="font-size: 12px; color: #94a3b8;">Confidence: ${confidence}% - Click to analyze.</div>
        </div>
        <button id="tclens-close" style="background:none; border:none; color:#64748b; cursor:pointer; font-size: 16px; margin-left: 8px; padding: 4px;">×</button>
    `;

    div.onclick = (e) => {
        if (e.target.id !== "tclens-close") {
            // Open extension popup by sending message to background
            chrome.runtime.sendMessage({ action: "open_popup" });
        }
    };

    document.body.appendChild(div);

    // Add animation style
    if (!document.getElementById("tclens-style")) {
        const style = document.createElement('style');
        style.id = "tclens-style";
        style.textContent = `
            @keyframes slideIn { 
                from { transform: translateY(20px); opacity: 0; } 
                to { transform: translateY(0); opacity: 1; } 
            }
        `;
        document.head.appendChild(style);
    }

    document.getElementById("tclens-close").onclick = (e) => {
        e.stopPropagation();
        div.remove();
    };
}

// Show full popup overlay
function showPopup(detectionResult) {
    // Check if already shown
    if (document.getElementById("tclens-popup")) return;

    const overlay = document.createElement("div");
    overlay.id = "tclens-popup";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5); z-index: 2147483646;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Segoe UI', sans-serif;
    `;

    const popup = document.createElement("div");
    popup.style.cssText = `
        background: white; border-radius: 16px; padding: 24px;
        max-width: 600px; max-height: 80vh; overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
    `;

    const riskScore = detectionResult.risk_score || 0;
    const riskClass = riskScore >= 75 ? 'high' : riskScore >= 50 ? 'medium' : 'low';
    const riskColor = riskScore >= 75 ? '#dc2626' : riskScore >= 50 ? '#f59e0b' : '#10b981';

    let warningsHtml = '';
    if (detectionResult.critical_warnings) {
        Object.entries(detectionResult.critical_warnings).forEach(([key, warning]) => {
            if (warning.value) {
                warningsHtml += `
                    <div style="padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; margin: 8px 0; border-radius: 4px;">
                        <strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #78350f;">${warning.reason}</p>
                    </div>
                `;
            }
        });
    }

    let takeawaysHtml = '';
    if (detectionResult.key_takeaways && detectionResult.key_takeaways.length > 0) {
        takeawaysHtml = '<ul style="margin: 12px 0; padding-left: 20px;">';
        detectionResult.key_takeaways.forEach(takeaway => {
            takeawaysHtml += `<li style="margin: 6px 0;">${takeaway}</li>`;
        });
        takeawaysHtml += '</ul>';
    }

    popup.innerHTML = `
        <button id="tclens-popup-close" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">×</button>
        <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold;">${detectionResult.document_type || 'Legal Document'}</h2>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
                <div style="font-size: 14px; color: #64748b;">Risk Score:</div>
                <div style="font-size: 32px; font-weight: bold; color: ${riskColor};">${riskScore}</div>
                <div style="font-size: 12px; color: #94a3b8;">/ 100</div>
            </div>
            ${detectionResult.risk_reason ? `<p style="margin: 8px 0; font-size: 14px; color: #64748b;">${detectionResult.risk_reason}</p>` : ''}
        </div>
        
        ${detectionResult.short_summary ? `
            <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Summary</h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6;">${detectionResult.short_summary}</p>
            </div>
        ` : ''}
        
        ${takeawaysHtml ? `
            <div style="margin: 20px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Key Takeaways</h3>
                ${takeawaysHtml}
            </div>
        ` : ''}
        
        ${warningsHtml ? `
            <div style="margin: 20px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #dc2626;">⚠️ Critical Warnings</h3>
                ${warningsHtml}
            </div>
        ` : ''}
        
        ${detectionResult.cta_text ? `
            <div style="margin: 20px 0; padding: 12px; background: #0f172a; color: white; border-radius: 8px; text-align: center; cursor: pointer;" id="tclens-cta">
                ${detectionResult.cta_text}
            </div>
        ` : ''}
        
        ${detectionResult.disclaimer ? `
            <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center;">${detectionResult.disclaimer}</p>
        ` : ''}
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Close handlers
    document.getElementById("tclens-popup-close").onclick = () => overlay.remove();
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    const ctaEl = document.getElementById("tclens-cta");
    if (ctaEl) {
        ctaEl.onclick = () => {
            chrome.runtime.sendMessage({ action: "open_full_report" });
        };
    }
}

// Main detection function
async function detectLegalContent() {
    try {
        const pageText = extractPageText();
        const url = window.location.href;
        const title = document.title;

        // Call detection API
        const response = await fetch(`${API_BASE_URL}/api/extension/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_text: pageText,
                url: url,
                title: title
            })
        });

        if (!response.ok) {
            console.log('TCLens: Detection API not available or error occurred');
            return;
        }

        const detectionResult = await response.json();

        // Handle based on trigger recommendation
        if (detectionResult.trigger_recommendation === 'show_popup') {
            // If popup is recommended, we need to get the full analysis
            // For now, show popup with detection result if it has summary data
            if (detectionResult.short_summary) {
                showPopup(detectionResult);
            } else {
                // Fetch full analysis
                const analyzeResponse = await fetch(`${API_BASE_URL}/api/extension/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page_text: pageText,
                        url: url
                    })
                });
                
                if (analyzeResponse.ok) {
                    const analysisResult = await analyzeResponse.json();
                    showPopup(analysisResult);
                }
            }
        } else if (detectionResult.trigger_recommendation === 'show_badge') {
            showBadge(detectionResult);
        }
        // If trigger_recommendation is 'none', do nothing

        // Notify background script
        chrome.runtime.sendMessage({
            action: "detection_complete",
            result: detectionResult
        });

    } catch (error) {
        console.error('TCLens: Detection error:', error);
        // Fail silently - don't interrupt user experience
    }
}

// Run detection after page load
// Wait a bit for dynamic content to load
setTimeout(() => {
    detectLegalContent();
}, 2000);

// Also run on navigation for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(detectLegalContent, 2000);
    }
}).observe(document, { subtree: true, childList: true });
