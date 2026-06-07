# Zhenva — AI-Powered Fact Checking Platform

A fact-checking web app built for non-tech-savvy Indian users. Paste a WhatsApp forward, upload a screenshot, or drop a video link — get a clear verdict in your language, with audio playback.

---

## The Problem

Every day, millions of Indians receive misinformation through WhatsApp forwards, Instagram reels, and Facebook posts. While younger users can verify claims using AI tools, older and less tech-savvy users have no easy way to do so.

Zhenva solves this with a one-step solution — paste content, get a verified answer, understand it in your language.

---

## Features

- **Text fact-checking** — paste any WhatsApp message or news headline
- **Image fact-checking** — upload a screenshot, AI extracts and verifies the text
- **Video fact-checking** — paste a YouTube, Instagram, or Facebook link
- **6 Indian languages** — English, Hindi, Bengali, Tamil, Telugu, Marathi
- **Audio playback** — listen to the explanation instead of reading
- **Trusted sources only** — WHO, PIB, BBC, NDTV, BoomLive, and more
- **Two-pass claim detection** — catches claims that single-pass AI misses
- **Smart caching** — same viral forward checked once, served instantly to everyone after

---

## Tech Stack

### Backend
| Layer | Tool |
|---|---|
| Framework | Express.js (Node.js, CommonJS) |
| Database | MongoDB Atlas |
| Cache / Queue | Redis (Upstash) + Bull |
| AI Brain | Groq (LLaMA 3.3 70B + Whisper Large V3) |
| Image OCR | Groq Vision (LLaMA 4 Scout) |
| Web Search | Tavily API |
| Video Transcription | YouTube Transcript API + yt-dlp |

### Frontend
| Layer | Tool |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP | Axios |
| Audio | Web Speech API (browser built-in) |

---

## Project Structure

```
zhenva/
│
├── backend/
│   ├── src/
│   │   ├── index.js                  # Express app, MongoDB connection, middleware
│   │   ├── config.js                 # All env vars in one place
│   │   │
│   │   ├── routes/
│   │   │   ├── text.routes.js        # POST /api/check/text
│   │   │   ├── image.routes.js       # POST /api/check/image
│   │   │   └── video.routes.js       # POST /api/check/video
│   │   │
│   │   ├── controllers/
│   │   │   ├── text.controller.js
│   │   │   ├── image.controller.js
│   │   │   └── video.controller.js
│   │   │
│   │   ├── pipeline/
│   │   │   ├── claimDetector.js      # two-pass claim extraction
│   │   │   ├── verifier.js           # search + verdict generation
│   │   │   └── formatter.js          # shapes final response
│   │   │
│   │   ├── adapters/
│   │   │   ├── imageAdapter.js       # image → text via Groq Vision
│   │   │   └── videoAdapter.js       # URL → transcript
│   │   │
│   │   ├── services/
│   │   │   ├── groqService.js        # all Groq API calls
│   │   │   └── searchService.js      # Tavily search + domain filtering
│   │   │
│   │   ├── workers/
│   │   │   └── jobQueue.js           # Bull queue for async video jobs
│   │   │
│   │   └── models/
│   │       ├── Result.model.js       # cached verdicts (TTL 24hrs)
│   │       └── Job.model.js          # async job status
│   │
│   ├── uploads/                      # temp image/audio storage
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx           # language selection
    │   │   ├── Home.jsx              # main input page
    │   │   └── Result.jsx            # verdict display
    │   │
    │   ├── components/
    │   │   ├── InputTabs.jsx         # text/image/video tab switcher
    │   │   ├── TextInput.jsx
    │   │   ├── ImageInput.jsx
    │   │   ├── VideoInput.jsx
    │   │   ├── AudioPlayer.jsx       # Web Speech API player
    │   │   ├── SourceList.jsx
    │   │   ├── VerdictCard.jsx
    │   │   ├── ClaimList.jsx
    │   │   └── Loader.jsx
    │   │
    │   ├── hooks/
    │   │   ├── useLanguage.js        # localStorage language persistence
    │   │   └── useJobPoller.js       # polls job status every 3s
    │   │
    │   ├── services/
    │   │   └── api.js                # all axios calls
    │   │
    │   └── utils/
    │       ├── translations.js       # all UI strings in 6 languages
    │       └── speech.js             # Web Speech API wrapper
    │
    ├── .env
    └── package.json
```

---

## How It Works

```
User input (text / image / video)
              ↓
         [ Adapter ]
  image → Groq Vision extracts text
  video → YouTube API or yt-dlp + Whisper gets transcript
  text  → passes through directly
              ↓
     [ Claim Detector — 2 passes ]
  Pass 1: full text → Groq extracts all claims
  Pass 2: sentence by sentence → Groq classifies each
  Merge + deduplicate → final claim list
              ↓
        [ Verifier ]
  For each claim (parallel):
    → Tavily searches trusted sources (last 30 days)
    → Groq reads evidence → verdict + explanation in user's language
              ↓
       [ Formatter ]
  Combines all explanations into one paragraph
  Determines overall verdict (FALSE > MISLEADING > UNVERIFIED > TRUE)
  Collects all unique sources
              ↓
  Saved to MongoDB (TTL 24hrs) → cached for next user
              ↓
     Returned to frontend
```

Video jobs run asynchronously via Bull + Redis. Frontend polls every 3 seconds.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Upstash Redis account (free tier)
- Groq API key (free)
- Tavily API key (free tier)
- yt-dlp installed globally

**Install yt-dlp on Windows:**
```bash
winget install yt-dlp
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_atlas_connection_string
REDIS_URL=rediss://default:xxxxx@xxxx.upstash.io:6379
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
```

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) → Connect → Drivers |
| `REDIS_URL` | [upstash.com](https://upstash.com) → Create Database → REST URL |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `TAVILY_API_KEY` | [app.tavily.com](https://app.tavily.com) → API Keys |

```bash
npm run dev
```

Should see:
```
MongoDB connected
Server running on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Opens on `http://localhost:5173`

To open on phone (same WiFi):
```bash
# vite.config.js already has host: true
# use the Network URL shown in terminal
```

---

## API Reference

### POST `/api/check/text`
```json
{
  "text": "Drinking hot water kills all viruses.",
  "language": "hindi"
}
```

### POST `/api/check/image`
```
Content-Type: multipart/form-data
image: <file>        (JPG, PNG, WEBP — max 5MB)
language: "tamil"
```

### POST `/api/check/video`
```json
{
  "url": "https://www.youtube.com/watch?v=xxxxx",
  "language": "telugu"
}
```

Returns immediately with `jobId`. Poll for result:

### GET `/api/check/video/job/:jobId`
```json
{ "status": "pending" | "processing" | "done" | "failed" }
```

### GET `/health`
```json
{ "status": "ok", "mongo": "connected" }
```

---

## Response Shape

All three input types return the same structure:

```json
{
  "overallVerdict": "FALSE",
  "language": "hindi",
  "inputType": "text",
  "overallExplanation": "गर्म पानी पीने से शरीर के अंदर के वायरस नहीं मरते...",
  "sources": [
    "https://www.who.int/...",
    "https://www.bbc.com/hindi/..."
  ],
  "checkedAt": "2026-06-07T12:00:00.000Z"
}
```

---

## Supported Languages

| Code | Language | Script |
|---|---|---|
| `english` | English | Latin |
| `hindi` | हिंदी | Devanagari |
| `bengali` | বাংলা | Bengali |
| `tamil` | தமிழ் | Tamil |
| `telugu` | తెలుగు | Telugu |
| `marathi` | मराठी | Devanagari |

---

## Two-Pass Claim Detection

Single-pass LLM extraction misses claims in long or multi-topic messages.

**Example input:**
```
"The government announced ₹5000 for every citizen 
and drinking hot water kills all viruses."
```

**Single pass might return:**
```json
["Drinking hot water kills all viruses"]
```

**Two-pass returns:**
```json
[
  "The government announced ₹5000 for every citizen",
  "Drinking hot water kills all viruses"
]
```

Pass 1 sends the full text to Groq. Pass 2 splits into sentences and classifies each individually. Both run in parallel, results are merged and deduplicated.

---

## Trusted Sources

Search results are filtered to trusted domains only:

**Indian Fact-Checkers:** boomlive.in, altnews.in, factchecker.in, vishvasnews.com, thequint.com

**Indian Government:** pib.gov.in, mohfw.gov.in, india.gov.in, mygov.in

**Indian News:** thehindu.com, ndtv.com, indianexpress.com, pti.in

**International Health:** who.int, nih.gov, cdc.gov, pubmed.ncbi.nlm.nih.gov

**International News:** bbc.com, reuters.com, apnews.com

Tavily search is biased toward the last 30 days to catch recently viral misinformation.

---

## Caching

Results cached in MongoDB for 24 hours using MD5 hash of input text. Same viral forward sent by 100 users = pipeline runs once, everyone else gets instant cached result.

For images, hash is computed on extracted text — two different screenshots of the same claim return the same cached result.

---

## Audio Playback

Text-to-speech handled by the browser's built-in Web Speech API. Zero cost, zero backend storage. Works on Android for all 6 languages via Google TTS engine. On Windows, Hindi and English work reliably; other languages show "Audio not available" if voice not installed.

---

## Known Limitations

- Instagram/Facebook Reels may fail — Meta actively blocks scrapers. yt-dlp works but breaks periodically. Run `winget upgrade yt-dlp` to fix.
- YouTube videos without captions (CC) cannot be transcribed.
- Groq free tier has rate limits (12k tokens/minute). Long video transcripts may hit limits — handled with automatic retry logic.
- Audio for Bengali, Tamil, Telugu, Marathi requires Google TTS voices installed on device — works on Android, limited on Windows.

---

## Deployment

### Backend → Render
1. Push backend to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Add all `.env` variables in Render dashboard
4. Build command: `npm install`
5. Start command: `node src/index.js`

### Frontend → Vercel
1. Push frontend to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy

---

## Built With

This project was built as a solution to the real problem of misinformation spreading through WhatsApp and social media in India, targeting users who lack the technical knowledge to verify claims themselves.

**Key architectural decisions:**
- Single pipeline for all input types — adapters normalize inputs to text, then the same claimDetector → verifier → formatter runs for everyone
- Async video processing via Bull — HTTP requests don't hang waiting for slow yt-dlp downloads
- Language passed through the entire pipeline — Groq generates the explanation directly in the user's language, no separate translation step
- Trusted domain filtering in Tavily — prevents AI from citing unreliable sources
- MD5 caching — viral misinformation is repetitive by nature; caching makes the system faster and cheaper at scale