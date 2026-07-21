# Willow AI

A personal memory and knowledge base: upload PDFs, images, voice notes, and
notes, and ask questions about them in natural language.

This runs on your own OpenAI API key — there is no Google AI Studio / Gemini
dependency anywhere in the stack. The pipeline is real, not mocked:

- **Uploads** are stored in Firebase Storage.
- **Analysis** (text extraction from PDFs, Whisper transcription for audio,
  GPT-4o-mini vision for images, summary + tag generation) happens in a small
  Express backend (`server/index.js`) so your OpenAI key never reaches the
  browser.
- **Search** embeds your question with `text-embedding-3-small`, ranks your
  saved memories by cosine similarity, and asks GPT to answer grounded only
  in the memories that matched.

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and add your own OpenAI key:
   ```
   cp .env.example .env
   ```
   Then edit `.env` and set `OPENAI_API_KEY` to a key from
   https://platform.openai.com/api-keys.
3. Run the app (starts both the Vite frontend and the Express API):
   ```
   npm run dev
   ```
   The web app runs on http://localhost:3000, the API on http://localhost:8787.
   Vite proxies `/api/*` requests to the API, so you only need to open the
   frontend URL.

To run them separately: `npm run dev:web` and `npm run dev:api` in two
terminals.

## Firebase

Auth, Firestore, and Storage use the Firebase project already configured in
`src/lib/firebase.ts`. Security rules live in `firestore.rules` and
`storage.rules`, and are wired up in `firebase.json` for `firebase deploy`.

## Project structure

```
src/                React app (UI unchanged)
server/index.js      Express API — OpenAI calls happen here only
firestore.rules      Per-user Firestore access rules
storage.rules         Per-user Storage access rules
```
