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

### Netlify (Recommended)

Netlify is recommended for this project as it provides built-in serverless functions to hide API keys and reliable speech recognition.

**Step 1: Get API Keys**

**Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key

**AssemblyAI API Key (for speech recognition):**
1. Go to [AssemblyAI](https://www.assemblyai.com/app)
2. Create a free account
3. Get your API key from the dashboard

**Step 2: Connect repository to Netlify**
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository: `Hope8188/voice-assist`

**Step 3: Configure environment variables**
In Netlify dashboard → Site settings → Environment variables:
- `GEMINI_API_KEY`: Your Gemini API key
- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key (required for speech recognition)
- `OPENROUTER_API_KEY`: (Optional) Your OpenRouter API key for fallback

**Step 4: Deploy**
Netlify will automatically deploy. The proxy functions at `/.netlify/functions/gemini`, `/.netlify/functions/openrouter`, and `/.netlify/functions/speech` will hide your API keys.

**Step 5: Test**
Visit your Netlify URL (e.g., `https://your-site.netlify.app`) and test the voice assistant.

### Local Development (without proxy)

For local development without Netlify functions:

1. Copy `config.example.js` to `config.js`:
```bash
cp config.example.js config.js
```

2. Edit `config.js` and add your API keys:
```javascript
window.GEMINI_API_KEY = 'your_gemini_api_key_here';
window.OPENROUTER_API_KEY = 'your_openrouter_api_key_here';
```

3. Set `USE_PROXY = false` at the top of `index.html`:
```javascript
const USE_PROXY = false;
```

4. Open `index.html` in Chrome or Edge directly.

### Security Note

**Netlify deployment includes API key protection:**
- Serverless functions at `/.netlify/functions/gemini` and `/.netlify/functions/openrouter` proxy all API calls
- API keys are stored in Netlify environment variables (never exposed to client)
- No API keys are hardcoded in the client-side code

**Additional security recommendations:**
- Implement rate limiting (can be added to Netlify functions)
- Add authentication for production use
- Monitor API usage and costs

## Architecture

- **STT**: AssemblyAI API via Netlify function (reliable, no browser limitations)
- **LLM**: Gemini 2.5 Flash → OpenRouter GPT-4o-mini (fallback) via Netlify functions
- **TTS**: `window.speechSynthesis`
- **State Machine**: Idle → Listening → Processing → Speaking
- **Audio Recording**: MediaRecorder API with base64 encoding

## Performance Targets

- LLM Latency: <800ms
- Total Turn Latency: <1.5s
- Anti-hallucination validation on all responses

## License

MIT
