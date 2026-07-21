import React from 'react';
import { ArrowRight, Bell, Sparkles, FileText, Image as ImageIcon, Mic, Link as LinkIcon, MoreHorizontal, Star, Search } from 'lucide-react';
import MemoryCard from './MemoryCard';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Memory } from '../types';
import { recentMemories as dummyMemories } from '../data';

interface DashboardProps {
  onSearch: (query: string) => void;
  onUpload: () => void;
}

export default function Dashboard({ onSearch, onUpload }: DashboardProps) {
  const [user] = useAuthState(auth);
  
  const memoriesRef = collection(db, 'memories');
  const q = user ? query(memoriesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(10)) : query(memoriesRef, limit(0));
  const [memories] = useCollectionData(q);
  
  const displayMemories = (memories?.length ? memories : dummyMemories) as Memory[];

  const uploadOptions = [
    { id: 'pdf', label: 'PDF', sub: 'Upload a document', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', hoverBorder: 'hover:border-emerald-500' },
    { id: 'image', label: 'Screenshot', sub: 'Upload an image', icon: ImageIcon, color: 'text-amber-500', bg: 'bg-amber-500/10', hoverBorder: 'hover:border-amber-500' },
    { id: 'audio', label: 'Voice Note', sub: 'Record audio', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/10', hoverBorder: 'hover:border-purple-500' },
    { id: 'link', label: 'Link', sub: 'Save a web link', icon: LinkIcon, color: 'text-rose-500', bg: 'bg-rose-500/10', hoverBorder: 'hover:border-rose-500' },
    { id: 'note', label: 'Note', sub: 'Write something', icon: MoreHorizontal, color: 'text-text-muted', bg: 'bg-elevated', hoverBorder: 'hover:border-text-muted' },
  ];

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Guest';

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-6 md:p-10 relative">
      {/* Background Image Layer */}
      <div 
        className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none opacity-80 mix-blend-lighten"
        style={{ 
          backgroundImage: 'url(https://i.pinimg.com/originals/47/85/8d/47858d858fe59255805a2af1c1972718.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />
      
      <div className="relative z-10">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight leading-tight flex items-center gap-2">
              Good evening, {firstName} <Sparkles className="text-primary" size={24} />
            </h1>
            <p className="text-text-muted mt-2 text-lg">Your memory. One question away.</p>
          </div>
          <button className="flex items-center gap-2 bg-surface border border-border-subtle rounded-[18px] px-4 py-2 hover:bg-elevated transition-colors text-sm font-medium">
            <Star className="text-warning" size={16} fill="currentColor" />
            <span className="hidden sm:inline">Upgrade to Pro</span>
            <div className="w-px h-4 bg-border-subtle mx-1 hidden sm:block"></div>
            <Bell size={18} />
          </button>
        </header>

        <div className="max-w-4xl mx-auto space-y-12">
        {/* Search Section */}
        <section>
          <div className="relative group mt-10">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-text-muted">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Ask anything from your memory..."
              className="w-full bg-surface border border-border-card rounded-[24px] py-5 pl-16 pr-32 text-lg focus:outline-none focus:border-primary transition-colors shadow-2xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onSearch(e.currentTarget.value);
                }
              }}
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <button 
                className="bg-primary hover:bg-primary-hover text-black px-6 py-2 rounded-[18px] font-bold text-sm transition-colors"
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.previousSibling as HTMLInputElement;
                  if (input?.value) onSearch(input.value);
                }}
              >
                Search
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {['What did I save about React Hooks?', 'Find that marketing strategy PDF', 'What was in that YouTube video?'].map((q) => (
              <button
                key={q}
                onClick={() => onSearch(q)}
                className="text-xs md:text-sm bg-surface border border-border-card px-4 py-2 rounded-full text-text-muted hover:text-text-main hover:border-border-subtle transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {/* Add to Memory Section */}
        <section>
          <h2 className="text-lg font-heading font-semibold mb-4">Add to your memory</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {uploadOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={onUpload}
                className={`bg-surface border border-border-card rounded-[20px] p-4 flex flex-col items-center justify-center text-center ${opt.hoverBorder} transition-colors group aspect-square md:aspect-auto md:h-32`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${opt.bg} transition-transform group-hover:-translate-y-1`}>
                  <opt.icon size={24} className={opt.color} />
                </div>
                <h3 className="font-semibold text-sm">{opt.label}</h3>
                <p className="text-[10px] text-text-muted mt-1">{opt.sub}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Memories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold">Recent memories</h2>
            <button className="text-primary text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayMemories.slice(0, 4).map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
