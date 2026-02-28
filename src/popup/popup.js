document.addEventListener('DOMContentLoaded', async () => {
    // Views
    const views = {
        setup: document.getElementById('setupView'),
        main: document.getElementById('mainView'),
        settings: document.getElementById('settingsView'),
        results: document.getElementById('resultsView')
    };

    // Buttons & Inputs
    const extractBtn = document.getElementById('extractBtn');
    const tailorBtn = document.getElementById('tailorBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const backToMainBtn = document.getElementById('backToMain');
    const backFromResultsBtn = document.getElementById('backFromResults');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const providerSelect = document.getElementById('providerSelect');
    const jobStatus = document.getElementById('jobStatus');
    const uploadBtn = document.getElementById('uploadResume');
    const resultContent = document.getElementById('resultContent');
    const matchScoreBadge = document.getElementById('matchScore');

    let currentResults = null;

    // Load initial state
    const settings = await chrome.storage.local.get(['apiKey', 'provider', 'resumeText', 'lastJobDescription']);

    if (!settings.apiKey) {
        showView('setup');
    } else {
        apiKeyInput.value = settings.apiKey;
        providerSelect.value = settings.provider || 'gemini';
        showView('main');
        updateMainUI(settings);
    }

    // Navigation
    function showView(viewName) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
    }

    function updateMainUI(data) {
        if (data.resumeText) {
            uploadBtn.textContent = 'Change Resume';
        }
        if (data.lastJobDescription) {
            jobStatus.textContent = "Job description ready.";
            if (data.resumeText) tailorBtn.disabled = false;
        }
    }

    settingsBtn.addEventListener('click', () => showView('settings'));
    backToMainBtn.addEventListener('click', () => showView('main'));
    backFromResultsBtn.addEventListener('click', () => showView('main'));
    document.getElementById('startSetup').addEventListener('click', () => showView('settings'));

    // Settings Logic
    saveSettingsBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const provider = providerSelect.value;
        if (!apiKey) return alert("Please enter an API Key");

        await chrome.storage.local.set({ apiKey, provider });
        showView('main');
    });

    // Extraction Logic
    extractBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        extractBtn.textContent = "Extracting...";

        try {
            const response = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const selectors = ['.jobs-description__content', '#jobDescriptionText', '[data-testid="jobDescriptionText"]', '.description'];
                    for (const s of selectors) {
                        const el = document.querySelector(s);
                        if (el) return el.innerText;
                    }
                    return "";
                }
            });

            const description = response[0].result;
            if (description) {
                jobStatus.textContent = "Job description extracted!";
                await chrome.storage.local.set({ lastJobDescription: description });
                const { resumeText } = await chrome.storage.local.get('resumeText');
                if (resumeText) tailorBtn.disabled = false;
            } else {
                jobStatus.textContent = "Could not find job description.";
            }
        } catch (err) {
            jobStatus.textContent = "Error: Use on a job page.";
        } finally {
            extractBtn.textContent = "Extract from Page";
        }
    });

    // Resume Upload (Text-based for now)
    uploadBtn.addEventListener('click', async () => {
        const resumeText = prompt("Paste your resume text:");
        if (resumeText) {
            await chrome.storage.local.set({ resumeText });
            uploadBtn.textContent = 'Change Resume';
            const { lastJobDescription } = await chrome.storage.local.get('lastJobDescription');
            if (lastJobDescription) tailorBtn.disabled = false;
        }
    });

    // Tailoring Logic
    tailorBtn.addEventListener('click', async () => {
        const data = await chrome.storage.local.get(['resumeText', 'lastJobDescription', 'apiKey', 'provider']);

        tailorBtn.disabled = true;
        tailorBtn.textContent = "Tailoring...";

        chrome.runtime.sendMessage({
            action: "tailorResume",
            data: {
                resumeText: data.resumeText,
                jobDescription: data.lastJobDescription,
                config: { apiKey: data.apiKey, provider: data.provider }
            }
        }, (response) => {
            tailorBtn.disabled = false;
            tailorBtn.textContent = "Tailor Resume";

            if (response && response.success) {
                currentResults = response;
                resultContent.textContent = response.tailoredResume;
                matchScoreBadge.textContent = `Match: ${response.score}%`;
                loadHistory(); // Refresh history list
                showView('results');
            } else {
                alert("Error: " + (response?.error || "Unknown error"));
            }
        });
    });

    // Tab Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-tab');
            resultContent.textContent = type === 'resume' ? currentResults.tailoredResume : currentResults.coverLetter;
        });
    });

    // Copy Logic
    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(resultContent.textContent);
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = originalText, 2000);
    });

    // History Logic
    async function loadHistory() {
        const { history = [] } = await chrome.storage.local.get('history');
        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-msg">No history yet.</li>';
            return;
        }

        historyList.innerHTML = history.slice(0, 5).map(item => `
            <li class="history-item" data-id="${item.id}">
                <div class="history-info">
                    <span class="history-date">${new Date(item.date).toLocaleDateString()}</span>
                    <span class="history-score">${item.score}%</span>
                </div>
                <div class="history-title">Resume Tailored</div>
            </li>
        `).join('');

        document.querySelectorAll('.history-item').forEach(li => {
            li.addEventListener('click', () => {
                const item = history.find(h => h.id == li.dataset.id);
                currentResults = item;
                resultContent.textContent = item.tailoredResume;
                matchScoreBadge.textContent = `Match: ${item.score}%`;
                showView('results');
            });
        });
    }

    loadHistory();
});
