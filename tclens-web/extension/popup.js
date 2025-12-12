document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const initialDiv = document.getElementById('initial');

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
                    return {
                        text: document.body.innerText,
                        url: window.location.href
                    };
                },
            });

            // 3. Call API
            const response = await fetch('http://localhost:3000/api/extension/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page_text: result.text,
                    url: result.url
                })
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();

            // 4. Render Results
            renderResults(data);

        } catch (error) {
            console.error(error);
            loadingDiv.style.display = 'none';
            initialDiv.style.display = 'block';
            alert("Failed to analyze page. Ensure localhost:3000 is running.");
        }
    });

    function renderResults(data) {
        loadingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';

        // Risk Score
        const scoreEl = document.getElementById('riskScore');
        scoreEl.textContent = data.risk_score;
        scoreEl.className = `score ${getScoreClass(data.risk_score)}`;

        // Document Type
        document.getElementById('docType').textContent = data.document_type;

        // Summary (mapped from short_summary)
        document.getElementById('summary').textContent = data.short_summary;

        // Key Takeaways (mapped from key_takeaways)
        const bulletsList = document.getElementById('bullets');
        bulletsList.innerHTML = '';
        if (data.key_takeaways && Array.isArray(data.key_takeaways)) {
            data.key_takeaways.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                bulletsList.appendChild(li);
            });
        }

        // Critical Warnings
        const flagsContainer = document.getElementById('flags');
        flagsContainer.innerHTML = '';

        if (data.critical_warnings) {
            Object.entries(data.critical_warnings).forEach(([key, flag]) => {
                if (flag.value) {
                    const div = document.createElement('div');
                    div.className = 'flag-item';
                    div.innerHTML = `
            <span class="flag-icon">⚠️</span>
            <div class="flag-content">
              <strong>${formatFlagName(key)}</strong>
              <p>${flag.reason}</p>
            </div>
          `;
                    flagsContainer.appendChild(div);
                }
            });
        }
    }

    function getScoreClass(score) {
        if (score >= 80) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    }

    function formatFlagName(key) {
        // Replace underscores with spaces and capitalize
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
});
