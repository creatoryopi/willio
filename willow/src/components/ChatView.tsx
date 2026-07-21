import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Sparkles, Copy, ThumbsUp, ThumbsDown, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Memory } from '../types';
import { askMemory, cosineSimilarity, embedText } from '../lib/api';

interface ChatViewProps {
  initialQuery: string;
  onBack: () => void;
}

interface Turn {
  question: string;
  answer: string;
  matches: Memory[];
  status: 'thinking' | 'done' | 'error';
  error?: string;
}

const TOP_K = 3;

export default function ChatView({ initialQuery, onBack }: ChatViewProps) {
  const [user] = useAuthState(auth);
  const memoriesRef = collection(db, 'memories');
  const memoriesQuery = user ? query(memoriesRef, where('userId', '==', user.uid)) : query(memoriesRef, where('userId', '==', '__none__'));
  const [memories] = useCollectionData(memoriesQuery, { idField: 'id' });

  const [turns, setTurns] = useState<Turn[]>([]);
  const [followUp, setFollowUp] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const askedInitial = useRef(false);

  const runQuestion = async (question: string) => {
    setTurns((prev) => [...prev, { question, answer: '', matches: [], status: 'thinking' }]);

    try {
      const pool = (memories || []) as Memory[];

      let matches: Memory[] = [];
      if (pool.length > 0) {
        const queryEmbedding = await embedText(question);
        matches = [...pool]
          .filter((m) => Array.isArray(m.embedding) && m.embedding.length > 0)
          .map((m) => ({ memory: m, score: cosineSimilarity(queryEmbedding, m.embedding as number[]) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, TOP_K)
          .map((x) => x.memory);

        // Memories saved before embeddings existed (or that failed to embed)
        // still deserve a shot at being used as context.
        if (matches.length === 0) {
          matches = pool.slice(0, TOP_K);
        }
      }

      const answer = await askMemory(
        question,
        matches.map((m) => ({ title: m.title, type: m.type, content: m.content, summary: m.summary }))
      );

      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = { question, answer, matches, status: 'done' };
        return next;
      });
    } catch (err) {
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          question,
          answer: '',
          matches: [],
          status: 'error',
          error: err instanceof Error ? err.message : 'Something went wrong',
        };
        return next;
      });
    }
  };

  useEffect(() => {
    if (initialQuery && !askedInitial.current) {
      askedInitial.current = true;
      runQuestion(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  const handleFollowUp = () => {
    const q = followUp.trim();
    if (!q) return;
    setFollowUp('');
    runQuestion(q);
  };

  return (
    <div className="flex flex-col h-full bg-base">
      <header className="flex items-center p-4 md:p-6 border-b border-border-subtle sticky top-0 bg-base z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface text-text-muted hover:text-text-main transition-colors mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-heading font-semibold flex-1">Ask your memory</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-8">
          {turns.map((turn, i) => (
            <React.Fragment key={i}>
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-elevated border border-border-card text-text-main px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  <p className="text-[15px] leading-relaxed">{turn.question}</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary mt-1">
                  <Sparkles size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  {turn.status === 'thinking' && (
                    <div className="bg-surface border border-border-card px-6 py-5 rounded-2xl rounded-tl-sm w-24 shadow-sm flex items-center justify-center gap-1.5">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}

                  {turn.status === 'error' && (
                    <div className="bg-surface border border-error/30 text-text-main px-6 py-5 rounded-2xl rounded-tl-sm shadow-sm flex items-start gap-3">
                      <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-[15px] leading-relaxed text-text-muted">
                        {turn.error || 'Something went wrong answering that.'}
                      </p>
                    </div>
                  )}

                  {turn.status === 'done' && (
                    <div className="bg-surface border border-border-card text-text-main px-6 py-5 rounded-2xl rounded-tl-sm shadow-sm">
                      {turn.matches.length === 0 ? (
                        <p className="text-[15px] leading-relaxed mb-2">
                          You don't have any memories saved yet, so there's nothing to search. Upload something first.
                        </p>
                      ) : (
                        <>
                          <p className="text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{turn.answer}</p>

                          <ul className="space-y-4 mb-6">
                            {turn.matches.map((memory) => (
                              <li key={memory.id} className="text-[15px] leading-relaxed pl-4 border-l-2 border-border-subtle">
                                <span className="font-semibold">{memory.title}</span>{' '}
                                <span className="text-text-muted text-sm">({memory.type.toUpperCase()})</span>
                                {(memory.summary || memory.content) && (
                                  <p className="text-text-muted mt-1 line-clamp-3">
                                    {memory.summary || memory.content}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>

                          <p className="text-[15px] leading-relaxed mb-6 text-text-muted">
                            Answers are based on your memories. AI can make mistakes.
                          </p>
                        </>
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t border-border-subtle">
                        <button
                          onClick={() => navigator.clipboard.writeText(turn.answer)}
                          className="p-2 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
                        >
                          <Copy size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-elevated text-text-muted hover:text-primary transition-colors">
                          <ThumbsUp size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-elevated text-text-muted hover:text-error transition-colors">
                          <ThumbsDown size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-base via-base to-transparent pointer-events-none pb-20 md:pb-6">
        <div className="max-w-3xl mx-auto relative pointer-events-auto">
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFollowUp();
            }}
            placeholder="Ask follow-up question..."
            className="w-full bg-surface border border-border-subtle rounded-full px-6 py-4 pr-14 outline-none text-[15px] placeholder:text-text-muted/60 focus:border-border-card focus:ring-1 focus:ring-primary/20 transition-all shadow-lg"
          />
          <button
            onClick={handleFollowUp}
            className="absolute right-2 top-2 bottom-2 w-10 bg-elevated hover:bg-primary hover:text-black rounded-full flex items-center justify-center transition-colors text-text-muted"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
