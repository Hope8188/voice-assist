# AI Voice Assistant

A modern, low-latency AI voice chatbot with speech-to-text, LLM processing, and text-to-speech capabilities.

## Features

- **Speech-to-Text**: Browser-native Web Speech API for voice input
- **LLM Integration**: Google Gemini 2.5 Flash with automatic fallback to OpenRouter
- **Text-to-Speech**: Browser-native speech synthesis for voice output
- **Anti-Hallucination**: System prompt constraints with validation and retry
- **Low Latency**: Optimized for fast response times (<1.5s target)
- **Modern UI**: Responsive design with mobile support
- **Text Fallback**: Type messages if voice input unavailable

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Hope8188/voice-assist.git
cd voice-assist
```

### 2. Configure API Keys

**Option A: Using config.js (Recommended for local development)**

```bash
cp config.example.js config.js
```

Edit `config.js` and add your API keys:

```javascript
window.GEMINI_API_KEY = 'your_gemini_api_key_here';
window.OPENROUTER_API_KEY = 'your_openrouter_api_key_here';
```

**Option B: Using environment variables (For deployment)**

Set `window.GEMINI_API_KEY` before loading the page, or directly in `index.html`.

### 3. Get API Keys

**Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your config file

**OpenRouter API Key (Optional fallback):**
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Create an account and get an API key
3. Add it to your config file

### 4. Run locally

Simply open `index.html` in Chrome or Edge:

```bash
# On Windows
start index.html

# On Mac
open index.html

# On Linux
xdg-open index.html
```

Or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000
```

## Usage

1. **Voice Input**: Click the microphone button to start speaking
2. **Text Input**: Type a message and press Enter or click Send
3. **Listen**: The AI will respond via text and speech

## Browser Requirements

- Chrome or Edge (for Web Speech API support)
- Internet connection (for speech recognition and LLM API)
- Microphone permission (for voice input)

## Deployment

### Recommended Platforms

**1. GitHub Pages (Free)**
- Static hosting
- Add API keys via environment variables or client-side config
- Good for demos and testing

**2. Vercel (Free tier)**
- Fast deployment
- Edge functions for API key protection
- Automatic HTTPS

**3. Netlify (Free tier)**
- Easy deployment
- Environment variable support
- CDN acceleration

**4. Cloudflare Pages (Free)**
- Global CDN
- Workers for API proxy
- Fast performance

### Deployment Steps (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard:
- `GEMINI_API_KEY`: Your Gemini API key

### Security Note

For production, consider:
- Using a backend proxy to hide API keys
- Implementing rate limiting
- Adding authentication
- Using environment variables instead of client-side config

## Architecture

- **STT**: `webkitSpeechRecognition` / `SpeechRecognition`
- **LLM**: Gemini 2.5 Flash → OpenRouter GPT-4o-mini (fallback)
- **TTS**: `window.speechSynthesis`
- **State Machine**: Idle → Listening → Processing → Speaking

## Performance Targets

- LLM Latency: <800ms
- Total Turn Latency: <1.5s
- Anti-hallucination validation on all responses

## License

MIT
