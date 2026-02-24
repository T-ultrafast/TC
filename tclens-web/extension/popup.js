document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const initialDiv = document.getElementById('initial');
    const viewReportBtn = document.getElementById('viewReportBtn');

    let currentFullReportUrl = null;

    scanBtn.addEventListener('click', async () => {
        // UI State: Loading
        initialDiv.style.display = 'none';
        loadingDiv.style.display = 'block';

        try {
            // 1. Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.id) throw new Error("No active tab");

            // 2. Execute script to get text
            const [{ result }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // Inline smart extraction
                    function getSmartText() {
                        const clone = document.body.cloneNode(true);
                        const unwanted = ['nav', 'footer', 'header', 'aside', 'script', 'style', 'noscript', '[role="navigation"]'];
                        unwanted.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

                        const main = clone.querySelector('main, article, #content') || clone;
                        return main.innerText.replace(/\s+/g, ' ').trim().substring(0, 50000);
                    }

                    return {
                        text: getSmartText(),
                        url: window.location.href
                    };
                },
            });

            // 3. Call API via Background Script
            chrome.runtime.sendMessage({
                action: "analyze",
                payload: {
                    page_text: result.text,
                    url: result.url
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    showError("Extension connection failed.");
                    loadingDiv.style.display = 'none';
                    initialDiv.style.display = 'block';
                    return;
                }

                if (response && response.success) {
                    renderResults(response.data);
                } else {
                    console.error("Analysis error:", response?.error);
                    loadingDiv.style.display = 'none';
                    initialDiv.style.display = 'block';
                    showError(response?.error || "Analysis failed.");
                }
            });

        } catch (error) {
            console.error(error);
            loadingDiv.style.display = 'none';
            initialDiv.style.display = 'block';
            showError("Analysis failed. Please try again.");
        }
    });

    function showError(message) {
        const errorMsg = document.createElement('div');
        errorMsg.style.color = 'red';
        errorMsg.style.marginTop = '10px';
        errorMsg.style.fontSize = '12px';
        errorMsg.innerText = message.includes("Failed to fetch")
            ? "Server unreachable. Please check your internet connection."
            : message;

        const existing = initialDiv.querySelector('.error-msg');
        if (existing) existing.remove();

        errorMsg.className = 'error-msg';
        initialDiv.appendChild(errorMsg);

        setTimeout(() => errorMsg.remove(), 5000);
    }

    function renderResults(data) {
        loadingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';

        // Risk Score
        const scoreEl = document.getElementById('riskScore');
        scoreEl.textContent = data.risk_score;
        scoreEl.className = `score ${getScoreClass(data.risk_score)}`;

        // Risk Level
        let levelEl = document.getElementById('riskLevel');
        if (!levelEl) {
            levelEl = document.createElement('div');
            levelEl.id = 'riskLevel';
            levelEl.style.fontSize = '12px';
            levelEl.style.fontWeight = 'bold';
            levelEl.style.textTransform = 'uppercase';
            levelEl.style.marginTop = '4px';
            scoreEl.parentNode.appendChild(levelEl);
        }
        const riskLevel = data.risk_level || (data.risk_score > 80 ? 'Severe' : data.risk_score > 60 ? 'High' : data.risk_score > 30 ? 'Moderate' : 'Low');
        levelEl.textContent = riskLevel;
        levelEl.style.color = data.risk_score >= 75 ? '#ef4444' : data.risk_score >= 50 ? '#f59e0b' : '#10b981';

        // Document Type
        document.getElementById('docType').textContent = data.document_type || "Legal Document";

        // Summary
        document.getElementById('summary').textContent = data.short_summary || data.summary || "No summary available.";

        // Key Takeaways
        const bulletsList = document.getElementById('bullets');
        bulletsList.innerHTML = '';
        const items = data.key_takeaways || data.nextSteps || [];
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            bulletsList.appendChild(li);
        });

        // Critical Warnings
        const flagsContainer = document.getElementById('flags');
        flagsContainer.innerHTML = '';

        if (data.breakdown && data.breakdown.length > 0) {
            data.breakdown.forEach(risk => {
                const div = document.createElement('div');
                div.className = 'flag-item';
                div.innerHTML = `
                    <span class="flag-icon">🚩</span>
                    <div class="flag-content">
                        <strong>${risk.label} (+${risk.weight})</strong>
                        <p>${risk.evidence}</p>
                    </div>
                `;
                flagsContainer.appendChild(div);
            });
        }

        // Show View Full Report button
        if (data.full_report_url) {
            currentFullReportUrl = data.full_report_url;
            viewReportBtn.style.display = 'block';
        }
    }

    viewReportBtn.addEventListener('click', () => {
        if (currentFullReportUrl) {
            chrome.tabs.create({ url: currentFullReportUrl });
        }
    });

    function getScoreClass(score) {
        if (score >= 80) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    }
});
