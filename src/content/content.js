function extractJobDescription() {
    // Selectors for common job boards
    const selectors = [
        '.jobs-description__content', // LinkedIn
        '#jobDescriptionText',        // Indeed
        '[data-testid="jobDescriptionText"]', // Indeed Alternative
        '.job-description',           // Generic
        '.description'                // Generic
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.innerText.trim();
        }
    }

    // Fallback: Get all text if nothing specific found (less ideal)
    return "";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractJob") {
        const description = extractJobDescription();
        sendResponse({ description });
    }
});
