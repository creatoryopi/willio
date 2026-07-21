/**
 * Client for the local Express API in server/index.js.
 * In dev, Vite proxies /api/* to that server (see vite.config.ts),
 * so these calls work the same whether the app is opened from
 * localhost:3000 or wherever it's deployed, as long as the API
 * process is running alongside it.
 */

export interface ProcessUploadResult {
  extractedText: string;
  summary: string;
  topics: string[];
  tag: string;
  embedding: number[];
}

export async function processUpload(
  file: File,
  title: string,
  type: string
): Promise<ProcessUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('type', type);

  const res = await fetch('/api/process-upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload processing failed (${res.status})`);
  }

  return res.json();
}

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch('/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Embedding failed (${res.status})`);
  }

  const data = await res.json();
  return data.embedding;
}

export interface ChatContextItem {
  title: string;
  type: string;
  content?: string;
  summary?: string;
}

export async function askMemory(query: string, context: ChatContextItem[]): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Chat failed (${res.status})`);
  }

  const data = await res.json();
  return data.answer;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
