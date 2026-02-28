# AI Resume Tailor Chrome Extension

A modern, AI-powered Chrome Extension built to help job seekers tailor their resumes and cover letters to specific job descriptions with one click.

## 📁 Project Structure

```text
resume_extension/
├── manifest.json         # Extension configuration (permissions, entry points)
├── icons/                # Extension icons (16x16, 48x48, 128x128)
├── src/
│   ├── background/
│   │   └── background.js # Service worker (handles API calls & storage)
│   ├── content/
│   │   └── content.js    # Script that runs on job boards to extract text
│   ├── popup/            # Main UI (the small window when you click the icon)
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── utils/            # Shared logic and AI abstractions
│       ├── aiProvider.js
│       └── geminiProvider.js
├── .gitignore            # Files to exclude from Git (API keys, OS files)
└── README.md             # Project documentation
```

## 🛠 Features

- **Job Extraction**: Automatically identifies job descriptions on LinkedIn and Indeed.
- **AI Tailoring**: Uses Gemini Pro to rewrite resumes for ATS optimization.
- **Match Scoring**: Calculates a keyword match percentage.
- **Application History**: Saves your previous applications locally.

## 🚀 Getting Started

1. Clone this repository.
2. Go to `chrome://extensions/` in your browser.
3. Enable "Developer mode".
4. Click "Load unpacked" and select this folder.
5. Set up your Gemini API key in the extension settings.
