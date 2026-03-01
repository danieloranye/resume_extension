# Project Structure - AI Resume Tailor

This document provides a comprehensive overview of the file structure and the purpose of each component in the AI Resume Tailor Chrome Extension.

## 📁 Root Directory
```text
resume_extension/
├── manifest.json         # Extension configuration (permissions, entry points)
├── package.json          # Node.js dependencies (mainly for dev scripts)
├── README.md             # Project overview and introduction
├── PROJECT_STRUCTURE.md  # Detailed folder and file documentation
├── .gitignore            # Files and folders to exclude from Git
├── LICENSE               # Project license information
├── list_models.mjs       # Diagnostic script for Gemini models
└── list_groq_models.mjs  # Diagnostic script for Groq models
```

## 📂 `src/` - Source Code
The core logic of the extension is contained within the `src` directory, organized by functional area.

### 📂 `src/background/`
- **`background.js`**: The extension's service worker. It acts as an orchestrator, handling messages from the popup, managing long-running tasks like AI API calls, and interacting with `chrome.storage.local`.

### 📂 `src/content/`
- **`content.js`**: This script is injected into specific job board websites (LinkedIn, Indeed, etc.). It contains the logic to scrape and extract the job description text from the page.

### 📂 `src/popup/`
This directory contains the files for the extension's user interface—the window that appears when you click the extension icon.
- **`popup.html`**: Defines the structure of the UI using semantic HTML5.
- **`popup.css`**: Styles the UI with a modern, glassmorphism-inspired dark mode theme.
- **`popup.js`**: Handles user interactions within the popup, manages UI state (switching between "Main", "Settings", and "Results" views), and communicates with the background script.

### 📂 `src/utils/`
Contains shared helper classes and abstractions.
- **`aiProvider.js`**: An abstract base class defining the interface for AI service providers.
- **`geminiProvider.js`**: Implementation of the `AIProvider` for Google Gemini.
- **`groqProvider.js`**: Implementation of the `AIProvider` for Groq (supporting Llama 3.3 and Mixtral).

### 📂 `src/libs/`
Third-party libraries used for file handling, included locally to ensure reliability and security.
- **`pdf.min.js`** & **`pdf.worker.min.js`**: Mozilla's PDF.js for extracting text from PDF resumes.
- **`mammoth.browser.min.js`**: For parsing and extracting text from `.docx` files.
- **`jspdf.umd.min.js`**: For generating professional PDF versions of tailored resumes and cover letters.
- **`docx.iife.js`**: For generating editable `.docx` files.

---

## 📂 `icons/`
Stores the static assets for the extension's appearance in the browser toolbar and extension menu.
- **`icon16.png`**, **`icon48.png`**, **`icon128.png`**: Icons in standard required sizes.
