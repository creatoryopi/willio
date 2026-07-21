export type MemoryType = 'pdf' | 'image' | 'audio' | 'link' | 'note';

export interface Memory {
  id: string;
  title: string;
  type: MemoryType;
  date: string;
  tag?: string;
  duration?: string;
  source?: string;
  summary?: string;
  topics?: string[];
  content?: string;
  /** Public download URL for the original uploaded file (Firebase Storage). */
  fileUrl?: string;
  /** OpenAI text-embedding-3-small vector, used for semantic search. */
  embedding?: number[];
}
