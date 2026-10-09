# 💖 Soulmate AI — Multimodal Empathetic Companion

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Vision_%26_Audio-Gemini%20Multimodal-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Multilingual](https://img.shields.io/badge/Languages-Bengali_%7C_Hindi_%7C_English-FF69B4?style=for-the-badge)](README.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Soulmate AI** is an empathetic, multimodal AI companion application capable of seeing, hearing, and connecting emotionally across **Bengali, Hindi, and English**. Built with **React 18**, **TypeScript**, and the **Google Gemini Multimodal API**, Soulmate AI combines live camera video streaming, voice transcription, and contextual chat to foster warmth, companionship, and genuine emotional connection.

---

## ✨ Features

* 👁️ **Live Video Perception (`LiveView.tsx`):** Real-time webcam perception allowing the companion to see your expressions, surroundings, and reactions.
* 🎙️ **Voice & Audio Conversation:** Speak naturally; integrated microphone ingestion allows hands-free emotional dialogue.
* 🌐 **Trilingual Empathy:** Seamless natural language understanding across **Bengali (বাংলা)**, **Hindi (हिन्दी)**, and **English**.
* 💬 **Deep Conversational Mode (`DeepChat.tsx`):** Long-form reflective conversations, emotional check-ins, and active listening.

---

## 🛠️ Architecture & Tech Stack

```
+-------------------------------------------------------------+
|                      Soulmate React Client                  |
|         (React 18, TypeScript, Tailwind, Lucide React)      |
+-------------------------------------------------------------+
               |                               |
               v (Live Camera Stream)          v (Microphone Audio)
+-----------------------------+ +-----------------------------+
|     `components/LiveView`   | |     `components/DeepChat`   |
+-----------------------------+ +-----------------------------+
               |                               |
               +---------------+---------------+
                               |
                               v
+-------------------------------------------------------------+
|                Gemini Multimodal Live API                   |
|       Vision + Audio Streaming + Trilingual Prompt Layer    |
+-------------------------------------------------------------+
```

* **Frontend:** React 18, TypeScript, Tailwind CSS.
* **AI Model:** Google Gemini Multimodal API (`@google/genai`).
* **Tooling:** Vite, ESLint.

---

## 📁 Repository Structure

```text
Soulmate-AI---Virtual-Girlfriend/
├── App.tsx             # Main view switcher (Live Video Mode vs. Deep Chat Mode)
├── index.tsx           # React bootstrap entry
├── index.html          # HTML shell with media capture permissions
├── components/
│   ├── LiveView.tsx    # Live camera view & visual perception HUD
│   └── DeepChat.tsx    # Long-form conversational interface
├── types.ts            # Application modes & dialogue type schemas
├── utils/              # Audio / Video streaming helpers
├── metadata.json       # Project manifest
├── package.json        # Dependencies & scripts
├── LICENSE             # MIT License
└── README.md
```

---

## 🚀 Quick Start

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Tarunjit45/Soulmate-AI---Virtual-Girlfriend.git
cd Soulmate-AI---Virtual-Girlfriend

npm install
```

### 2. Configure Environment
Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and allow camera and microphone permissions when prompted.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
