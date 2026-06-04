# Zhenva — Fact-Check Backend

AI-powered fact-checking API for Indian users. Paste a WhatsApp message, upload a screenshot, or drop a video link — get a verdict in your language.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Express.js (CommonJS) |
| Database | MongoDB Atlas |
| Cache / Queue | Redis + Bull |
| AI Brain | Groq (LLaMA 3.3 70B + Whisper) |
| Web Search | Tavily |
| Image OCR | Groq Vision (LLaMA 3.2 11B) |
| Video Transcription | YouTube Transcript API + yt-dlp |

---

## Project Structure

```
factcheck-backend/
│
├── src/
│   ├── index.js                        # Express app, DB connection, middleware
│   ├── config.js                       # All env vars in one place
│   │
│   ├── routes/
│   │   ├── text.routes.js              # POST /api/check/text
│   │   ├── image.routes.js             # POST /api/check/image
│   │   └── video.routes.js             # POST /api/check/video + GET /api/check/video/job/:jobId
│   │
│   ├── controllers/
│   │   ├── text.controller.js
│   │   ├── image.controller.js
│   │   └── video.controller.js
│   │
│   ├── pipeline/
│   │   ├── claimDetector.js            # two-pass claim extraction (full text + sentence-by-sentence)
│   │   ├── verifier.js                 # claims + search results → verdict
│   │   └── formatter.js               # verdict → final response shape
│   │
│   ├── adapters/
│   │   ├── imageAdapter.js             # screenshot → text via Groq Vision
│   │   └── videoAdapter.js             # URL → transcript via yt-dlp / YouTube API
│   │
│   ├── services/
│   │   ├── groqService.js              # claim extraction, verdict generation, OCR, transcription
│   │   └── searchService.js            # Tavily search with trusted domain filtering
│   │
│   ├── workers/
│   │   └── jobQueue.js                 # Bull queue for async video processing
│   │
│   └── models/
│       ├── Result.model.js             # cached verdicts (TTL 24hrs)
│       └── Job.model.js                # async job status tracking
│
├── uploads/                            # temp storage for uploaded images (auto-cleaned)
├── .env
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Redis running locally or via Upstash (free tier)
- yt-dlp installed globally

Install yt-dlp on Windows:
```bash
winget install yt-dlp
```

### Installation

```bash
git clone https://github.com/yourusername/zhenva-backend
cd zhenva-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_atlas_connection_string
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
```

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) → Connect → Drivers |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `TAVILY_API_KEY` | [app.tavily.com](https://app.tavily.com) → API Keys |

### Run

```bash
# development
npm run dev

# production
npm start
```

---

## API Reference

### POST `/api/check/text`

Fact-check a WhatsApp message or any text.

**Request:**
```json
{
  "text": "Drinking hot water every hour kills all viruses.",
  "language": "hindi"
}
```

**Response:**
```json
{
  "source": "fresh",
  "overallVerdict": "FALSE",
  "emoji": "❌",
  "color": "red",
  "language": "hindi",
  "inputType": "text",
  "claims": [
    {
      "claim": "Drinking hot water kills all viruses",
      "verdict": "FALSE",
      "emoji": "❌",
      "explanation": "Garam paani peene se sharir ke andar ke virus nahi marte.",
      "confidence": "HIGH",
      "sources": ["https://who.int/..."]
    }
  ],
  "checkedAt": "2025-06-03T12:00:00.000Z"
}
```

---

### POST `/api/check/image`

Fact-check a screenshot. Accepts `multipart/form-data`.

**Request:**
```
Content-Type: multipart/form-data

image: <file>           (JPG, PNG, WEBP — max 5MB)
language: "tamil"
```

**Response:** Same shape as text response.

---

### POST `/api/check/video`

Fact-check a YouTube, Instagram, or Facebook video.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=xxxxx",
  "language": "telugu"
}
```

**Response (immediate):**
```json
{
  "jobId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "status": "pending",
  "message": "Video is being processed. Poll /api/check/video/job/:jobId for result."
}
```

---

### GET `/api/check/video/job/:jobId`

Poll for video job status.

**Response (processing):**
```json
{ "status": "processing" }
```

**Response (done):**
```json
{
  "status": "done",
  "result": { ...same shape as text response... }
}
```

**Response (failed):**
```json
{
  "status": "failed",
  "error": "Could not extract any text from this video."
}
```

---

### GET `/health`

Check server and database status.

```json
{
  "status": "ok",
  "mongo": "connected"
}
```

---

## Supported Languages

| Code | Language |
|---|---|
| `english` | English |
| `hindi` | हिंदी |
| `bengali` | বাংলা |
| `tamil` | தமிழ் |
| `telugu` | తెలుగు |
| `marathi` | मराठी |

Pass any of these as the `language` field in your request. The explanation will be returned in that language. Audio playback is handled on the frontend via the Web Speech API — no backend audio generation needed.

---

## How It Works

Every input type goes through the same three-step pipeline:

```
Input (text / image / video)
        ↓
   [ Adapter ]
   image → extract text via Groq Vision
   video → get transcript via yt-dlp / YouTube API
   text  → pass through directly
        ↓
   [ claimDetector — two passes ]
   Pass 1: send full text to Groq → extract all claims
   Pass 2: split into sentences → classify each sentence individually
   Merge both passes, deduplicate → final claim list
        ↓
   [ verifier ]
   for each claim (in parallel):
     → search Tavily (trusted sources, last 30 days)
     → send claim + evidence to Groq
     → get verdict + explanation in user's language
        ↓
   [ formatter ]
   shapes everything into final response
   determines overall verdict across all claims
   (FALSE > MISLEADING > UNVERIFIED > TRUE)
        ↓
   saved to MongoDB (TTL 24hrs)
   same viral message = served from cache instantly
```

Video jobs run asynchronously via Bull + Redis. All other inputs are synchronous.

---

## Claim Detection — Two Pass System

Single-pass LLM extraction misses claims when messages are long or contain multiple unrelated facts crammed into one sentence.

Example input:
```
"The government announced ₹5000 for every citizen and drinking hot water kills all viruses."
```

Single pass might return:
```json
["Drinking hot water kills all viruses"]
```

Two pass returns:
```json
[
  "The government announced ₹5000 for every citizen",
  "Drinking hot water kills all viruses"
]
```

**Pass 1** — sends full text to Groq, asks for all verifiable claims.

**Pass 2** — splits text into sentences, asks Groq to classify each sentence individually. When a sentence is isolated, Groq can't skip it.

Both results are merged and deduplicated. Maximum 5 claims per input.

---

## Trusted Sources

Search results are filtered to these domains only. No random blogs, no social media, no SEO spam.

**Indian Fact-Checkers:** boomlive.in, altnews.in, factchecker.in, vishvasnews.com, thequint.com

**Indian Government:** pib.gov.in, mohfw.gov.in, india.gov.in, mygov.in

**Indian News:** thehindu.com, ndtv.com, indianexpress.com, pti.in

**International Health & Science:** who.int, nih.gov, cdc.gov, pubmed.ncbi.nlm.nih.gov, nature.com

**International News:** bbc.com, reuters.com, apnews.com

Search is biased toward the last 30 days to catch recently viral misinformation.

---

## Caching

Results are cached in MongoDB for 24 hours using an MD5 hash of the input text. If the same viral message is submitted by multiple users, the pipeline runs once and everyone after gets the cached result instantly.

For images, the hash is computed on the **extracted text** not the image file — so two different screenshots of the same claim return the same cached result.

---

## Audio Playback

Text-to-speech is handled entirely on the frontend using the browser's built-in **Web Speech API** — no backend audio generation, no storage, no cost. The backend returns the `explanation` field in the user's language. The frontend reads it aloud on button press.

This works well for Indian languages. Android devices have high quality Hindi, Tamil, Telugu, Marathi, and Bengali voices built in via Google's TTS engine.

---

## Notes

- yt-dlp may break periodically when Instagram/Facebook update their systems. Run `winget upgrade yt-dlp` to fix.
- Groq free tier has rate limits. For high traffic, add retry logic with exponential backoff in `groqService.js`.
- Tavily free tier allows 1000 searches/month — enough for development and early users.
- Always whitelist your IP in MongoDB Atlas Network Access or the server will hang on connection silently.