# AI Resume Tailor Chrome Extension

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Chrome-orange)

## 🎯 Overview
**AI Resume Tailor** is a powerful, modern Chrome Extension designed to give job seekers an unfair advantage. It automates the tedious process of tailoring resumes and cover letters to match specific job descriptions using state-of-the-art AI models from **Google Gemini** and **Groq**.

With a focus on **visual excellence** and **ATS optimization**, this tool ensures your applications stand out both to recruiters and automated screening systems.

---

## ✨ Key Features

### 🔍 Intelligent Job Extraction
- One-click extraction of job descriptions from **LinkedIn**, **Indeed**, and other major job boards.
- Smart selectors and fallback logic to ensure the right content is captured every time.

### 📄 Comprehensive File Support
- **Upload**: Support for `.pdf`, `.docx`, and `.txt` resume uploads with automated text parsing.
- **Download**: Export your results as professionally formatted **PDFs** or editable **DOCX** files.

### 🤖 Multi-Provider AI Engine
- **Google Gemini**: Integration with Gemini 2.0 Flash and Pro for deep reasoning.
- **Groq Integration**: Ultra-fast tailoring powered by Llama 3.3 70B and Mixtral.
- **Dynamic Model Selection**: Choose the model that best fits your needs and quota.

### 📈 ATS Optimization & Scoring
- Structured prompts designed to "marry" your experience with job requirements.
- Real-time **Match Score** (0-100%) to see how well you align with the role.
- Keywords and transferable skills are highlighted naturally to pass automated filters.

### 🕒 Application History
- Automatically saves your last 5 tailored applications.
- Revisit previous resume versions and cover letters with a single click.

---

## 🎨 Design Philosophy
The extension features a **Premium Glassmorphism UI**:
- **Sleek Dark Mode**: Reduces eye strain and feels like a modern developer tool.
- **Micro-animations**: Smooth transitions between views for a high-end feel.
- **Inter Typography**: Uses clean, professional Google Fonts for ultimate readability.

---

## 🚀 Getting Started

### Installation
1.  **Clone** this repository:
    ```bash
    git clone https://github.com/danieloranye/resume_extension.git
    ```
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** (toggle in the top right).
4.  Click **Load unpacked** and select the `resume_extension` folder.

### Configuration
1.  Click the extension icon in your toolbar.
2.  Go to **Settings** (⚙️).
3.  Select your preferred **AI Provider** (Gemini or Groq).
4.  Enter your **API Key** (links to get keys are provided in the UI).
5.  Click **Save Settings**.

---

## 🛠 Technology Stack
- **Core**: JavaScript (ES6+), HTML5, CSS3
- **AI Integration**: Gemini API, Groq Cloud API
- **Libraries**:
  - `pdf.js` (PDF Parsing)
  - `mammoth.js` (DOCX Parsing)
  - `jspdf` (PDF Generation)
  - `docx.js` (DOCX Generation)
- **Design**: Vanilla CSS with Glassmorphism and Backdrop-filter effects.

---

## 📁 Documentation
For a deep dive into the code organization, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

---

## ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
