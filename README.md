
# 🌟 Study Assistant — AI-Powered Notes Summarizer  
A smart and powerful web application that helps students summarize notes, extract text from PDFs, read scanned documents using OCR, and export clean summaries — all in a beautiful, responsive interface.

Built using **React + Vite**, powered by **Google Gemini AI**, **pdf.js**, and **Tesseract.js**.

---

# 🚀 Features

### 📄 PDF Text Extraction  
- Supports normal PDFs  
- Extracts text accurately using `pdfjs-dist`

### 🔍 OCR (Optical Character Recognition)  
- Reads scanned PDFs or images  
- Extracts text using **Tesseract.js**

### ✍️ AI Summarization  
- Uses **Gemini API** for smart and high-quality summaries  
- Works with pasted text, PDFs, or OCR text

### 📤 File Upload Support  
Supports:
- `.pdf`
- `.txt`
- `.md`
- Copy-paste text  

### ⚡ Drag & Drop Upload  
Upload files instantly by dropping them in the upload area.

### 📑 Export to PDF  
Export summarized content directly as a clean PDF.

### 📋 One-Click Copy  
Copy summaries with a single button.

### 🎨 Modern UI  
Beautiful, responsive, dark-mode enabled interface with icons and animations.

---

# 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React (Vite)** | Frontend UI & fast development |
| **TypeScript** | Safer, scalable code |
| **pdf.js (pdfjs-dist)** | PDF text extraction |
| **Tesseract.js** | OCR scanning |
| **Gemini API (@google/genai)** | AI text generation & summarization |
| **jsPDF + AutoTable** | Export summaries to PDF |

---

# 📦 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/abhay288/Study-Assistant.git
cd Study-Assistant
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Add your Gemini API Key  
Create a `.env` file:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

### 4️⃣ Run locally
```bash
npm run dev
```

App runs on:  
👉 http://localhost:5173/

### 5️⃣ Build for production
```bash
npm run build
npm run preview
```

---

# 🧠 Using the App
- Upload or paste notes  
- Extract text using PDF/OCR  
- Summarize using AI  
- Export as PDF  
- Copy summary with one click  

---

# 🌐 Deployment
Deploy on **Vercel**  
Add env variable:  
```
VITE_GEMINI_API_KEY=your_api_key
```


# 🤝 Contribution  
Pull requests are welcome!

---

# 📜 License  
MIT License

---

# ❤️ Author  
**Abhay Kushwaha**  
GitHub: https://github.com/abhay288  
LinkedIn: https://linkedin.com/in/abhay-kushwaha-a2a1b21b3
