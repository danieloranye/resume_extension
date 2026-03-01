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
    const modelSelect = document.getElementById('modelSelect');
    const jobStatus = document.getElementById('jobStatus');
    const uploadBtn = document.getElementById('uploadResume');
    const resumeFileInput = document.getElementById('resumeFileInput');
    const resultContent = document.getElementById('resultContent');
    const matchScoreBadge = document.getElementById('matchScore');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadDocxBtn = document.getElementById('downloadDocxBtn');

    let currentResults = null;
    let currentTab = 'resume';

    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../libs/pdf.worker.min.js';
    }

    // Load initial state
    const settings = await chrome.storage.local.get(['apiKey', 'provider', 'modelName', 'resumeText', 'lastJobDescription']);

    if (!settings.apiKey) {
        showView('setup');
    } else {
        apiKeyInput.value = settings.apiKey;
        providerSelect.value = settings.provider || 'gemini';
        modelSelect.value = settings.modelName || 'gemini-2.0-flash-lite';
        updateModelVisibility(providerSelect.value);
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

    settingsBtn.addEventListener('click', () => {
        updateModelVisibility(providerSelect.value);
        showView('settings');
    });
    backToMainBtn.addEventListener('click', () => showView('main'));
    backFromResultsBtn.addEventListener('click', () => showView('main'));
    document.getElementById('startSetup').addEventListener('click', () => showView('settings'));

    // UI Logic: Model visibility
    function updateModelVisibility(provider) {
        const geminiGroup = document.getElementById('geminiModels');
        const groqGroup = document.getElementById('groqModels');

        if (provider === 'groq') {
            geminiGroup.classList.add('hidden');
            groqGroup.classList.remove('hidden');
            if (modelSelect.value && modelSelect.value.includes('gemini')) {
                modelSelect.value = 'llama-3.3-70b-versatile';
            }
        } else {
            geminiGroup.classList.remove('hidden');
            groqGroup.classList.add('hidden');
            if (modelSelect.value && (modelSelect.value.includes('llama') || modelSelect.value.includes('mixtral'))) {
                modelSelect.value = 'gemini-2.0-flash-lite';
            }
        }
    }

    providerSelect.addEventListener('change', (e) => updateModelVisibility(e.target.value));

    // Settings Logic
    saveSettingsBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const provider = providerSelect.value;
        const modelName = modelSelect.value;
        if (!apiKey) return alert("Please enter an API Key");

        await chrome.storage.local.set({ apiKey, provider, modelName });
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

    // File Upload Logic
    uploadBtn.addEventListener('click', () => {
        resumeFileInput.click();
    });

    resumeFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadBtn.textContent = "Reading file...";
        tailorBtn.disabled = true;

        try {
            const text = await extractTextFromFile(file);
            if (text) {
                await chrome.storage.local.set({ resumeText: text });
                uploadBtn.textContent = 'Change Resume';
                const { lastJobDescription } = await chrome.storage.local.get('lastJobDescription');
                if (lastJobDescription) tailorBtn.disabled = false;
                alert("Resume uploaded and parsed successfully!");
            }
        } catch (err) {
            console.error("File upload error:", err);
            alert("Error reading file: " + err.message);
            uploadBtn.textContent = 'Upload Resume (PDF/DOCX)';
        }
    });

    async function extractTextFromFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();

        if (extension === 'pdf') {
            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        const text = await parsePDF(reader.result);
                        resolve(text);
                    } catch (e) { reject(e); }
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        } else if (extension === 'docx') {
            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
                        resolve(result.value);
                    } catch (e) { reject(e); }
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        } else {
            return new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }
    }

    async function parsePDF(data) {
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(" ") + "\n";
        }
        return fullText;
    }

    // Tailoring Logic
    tailorBtn.addEventListener('click', async () => {
        const data = await chrome.storage.local.get(['resumeText', 'lastJobDescription', 'apiKey', 'provider', 'modelName']);

        tailorBtn.disabled = true;
        tailorBtn.textContent = "Tailoring...";

        chrome.runtime.sendMessage({
            action: "tailorResume",
            data: {
                resumeText: data.resumeText,
                jobDescription: data.lastJobDescription,
                config: {
                    apiKey: data.apiKey,
                    provider: data.provider,
                    modelName: data.modelName
                }
            }
        }, (response) => {
            tailorBtn.disabled = false;
            tailorBtn.textContent = "Tailor Resume";

            if (response && response.success) {
                currentResults = response;
                currentTab = 'resume';
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
            currentTab = btn.getAttribute('data-tab');
            resultContent.textContent = currentTab === 'resume' ? currentResults.tailoredResume : currentResults.coverLetter;
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

    // Download Logic
    downloadPdfBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const text = resultContent.textContent;
        const filename = currentTab === 'resume' ? 'tailored_resume.pdf' : 'cover_letter.pdf';

        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 15, 15);
        doc.save(filename);
    });

    downloadDocxBtn.addEventListener('click', async () => {
        const text = resultContent.textContent;
        const filename = currentTab === 'resume' ? 'tailored_resume.docx' : 'cover_letter.docx';

        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: text.split('\n').map(line => new docx.Paragraph({
                    children: [new docx.TextRun(line)],
                })),
            }],
        });

        const blob = await docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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
                currentTab = 'resume';
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-tab="resume"]').classList.add('active');
                resultContent.textContent = item.tailoredResume;
                matchScoreBadge.textContent = `Match: ${item.score}%`;
                showView('results');
            });
        });
    }

    loadHistory();
});
