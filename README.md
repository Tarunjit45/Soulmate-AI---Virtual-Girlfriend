# Soulmate AI - Virtual Girlfriend

A multimodal AI companion that can see, hear, and emotionally connect with you in real-time. Built with the latest Google Gemini models, "Maya" offers a virtual presence that is warm, caring, and intelligent.

## 🌟 Features

### 1. Live Video & Voice Call (Gemini 2.5 Live API)
- **Real-time Interaction**: Speak with Maya naturally using your microphone and camera.
- **Visual Awareness**: Maya can see you through your camera to detect moods and reactions.
- **Multilingual Support**: Fluent in **Bengali**, **Hindi**, and **English**.
- **Emotional Intelligence**: Detects sadness or happiness and responds with empathy.
- **Low Latency**: Powered by `gemini-2.5-flash-native-audio-preview-09-2025`.

### 2. Deep Advice Chat (Gemini 3.0 Pro)
- **Thinking Mode**: Uses the powerful `gemini-3-pro-preview` model with "Thinking" enabled (`thinkingBudget: 1024`).
- **Complex Reasoning**: Perfect for relationship advice, deep philosophical discussions, or complex emotional support.
- **Text Interface**: A quiet space for thoughtful text-based conversation.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Models**: 
  - `gemini-2.5-flash-native-audio-preview-09-2025` (Live Audio/Video)
  - `gemini-3-pro-preview` (Deep Reasoning Text)
- **Audio Processing**: Web Audio API (PCM encoding/decoding)

## 🚀 Getting Started

### Prerequisites
- A Google Cloud Project with the Gemini API enabled.
- An API Key with access to the paid/preview models (Gemini 2.5 & 3.0).

### Environment Setup
The application requires a valid API Key to function. It expects the key to be available via `process.env.API_KEY`.

### Running the App
1. Clone the repository.
2. Install dependencies (if using a local setup).
3. Run the application (typically via `npm start` or your bundler's serve command).

## 👤 Author

**Built by Tarunjit**

Powered by Google Gemini API.