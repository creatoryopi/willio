/**
 * Willow AI backend
 * ------------------
 * Small Express API that does the real AI work with OpenAI's API.
 * Kept separate from the Vite dev server so the OPENAI_API_KEY
 * never has to be shipped to the browser.
 *
 * Endpoints:
 *   GET  /api/health           -> { ok: true }
 *   POST /api/process-upload   -> multipart file + type, returns extracted
 *                                  text, an AI summary, tags/topics, and an
 *                                  embedding vector for semantic search
 *   POST /api/embed            -> { text } -> { embedding }
 *   POST /api/chat             -> { query, context[] } -> { answer }
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI, { toFile } from 'openai';
import pdfParse from 'pdf-parse';

const PORT = process.env.PORT || 8787;
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    '[willow] WARNING: OPENAI_API_KEY is not set. Add it to your .env file — ' +
    'see .env.example. AI features will fail until it is configured.'
  );
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.OPENAI_API_KEY) });
});

// ---- helpers ---------------------------------------------------------

async function embedText(text) {
  const input = (text || '').slice(0, 8000) || 'empty memory';
  const result = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });
  return result.data[0].embedding;
}

async function summarizeAndTag(text, title) {
  const truncated = (text || '').slice(0, 6000);
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You organize a personal memory/knowledge base. Given extracted content, ' +
          'return STRICT JSON only, no markdown fences, with this shape: ' +
          '{"summary": string (1-3 sentences), "topics": string[] (3-6 short tags), ' +
          '"tag": string (one short category like Development, Career, Business, Personal)}.',
      },
      {
        role: 'user',
        content: `Title: ${title || 'Untitled'}\n\nContent:\n${truncated || '(no extractable text)'}`,
      },
    ],
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    const cleaned = raw.replace(/^```json\s*|```$/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { summary: raw.slice(0, 300), topics: [], tag: 'General' };
  }
}

function bufferToBase64DataUrl(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

// ---- routes ------------------------------------------------------------

// Extracts text from whatever was uploaded, summarizes/tags it with GPT,
// and returns an embedding — this is the real pipeline behind the
// "Analyzing content..." step in the upload modal.
app.post('/api/process-upload', upload.single('file'), async (req, res) => {
  try {
    const { title, type } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let extractedText = '';

    if (type === 'audio' || file.mimetype.startsWith('audio/')) {
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(file.buffer, file.originalname, { type: file.mimetype }),
        model: 'whisper-1',
      });
      extractedText = transcription.text || '';
    } else if (type === 'image' || file.mimetype.startsWith('image/')) {
      const dataUrl = bufferToBase64DataUrl(file.buffer, file.mimetype);
      const vision = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in detail, including any visible text.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      extractedText = vision.choices[0]?.message?.content || '';
    } else if (file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      extractedText = parsed.text || '';
    } else {
      // Plain text / notes / anything else readable as UTF-8
      extractedText = file.buffer.toString('utf-8');
    }

    const [{ summary, topics, tag }, embedding] = await Promise.all([
      summarizeAndTag(extractedText, title),
      embedText(`${title}\n${extractedText}`),
    ]);

    res.json({
      extractedText: extractedText.slice(0, 8000),
      summary,
      topics: topics || [],
      tag: tag || 'General',
      embedding,
    });
  } catch (err) {
    console.error('process-upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process upload' });
  }
});

// Embed arbitrary text (used to embed the user's search query)
app.post('/api/embed', async (req, res) => {
  try {
    const { text } = req.body;
    const embedding = await embedText(text);
    res.json({ embedding });
  } catch (err) {
    console.error('embed error:', err);
    res.status(500).json({ error: err.message || 'Failed to embed text' });
  }
});

// Answer a question grounded in the user's own retrieved memories
app.post('/api/chat', async (req, res) => {
  try {
    const { query, context } = req.body;
    const contextBlock = (context || [])
      .map((m, i) => `Memory ${i + 1} — "${m.title}" (${m.type}):\n${(m.content || m.summary || '').slice(0, 1500)}`)
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are Willow, a personal memory assistant. Answer the question using ONLY the ' +
            'memories provided below. Be concise and specific. If the memories do not contain ' +
            'the answer, say so honestly instead of guessing.',
        },
        {
          role: 'user',
          content: `Memories:\n${contextBlock || '(no memories found)'}\n\nQuestion: ${query}`,
        },
      ],
      temperature: 0.4,
    });

    res.json({ answer: completion.choices[0]?.message?.content || '' });
  } catch (err) {
    console.error('chat error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate answer' });
  }
});

app.listen(PORT, () => {
  console.log(`[willow] API server listening on http://localhost:${PORT}`);
});
