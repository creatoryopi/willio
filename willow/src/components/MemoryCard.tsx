import React from 'react';
import { FileText, Image as ImageIcon, Mic, Link as LinkIcon, StickyNote, Star, MoreVertical } from 'lucide-react';
import { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  key?: React.Key;
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  const getIcon = () => {
    switch (memory.type) {
      case 'pdf': return <FileText size={20} className="text-emerald-500" />;
      case 'image': return <ImageIcon size={20} className="text-amber-500" />;
      case 'audio': return <Mic size={20} className="text-purple-500" />;
      case 'link': return <LinkIcon size={20} className="text-rose-500" />;
      case 'note': return <StickyNote size={20} className="text-text-muted" />;
    }
  };

  const getBgColor = () => {
    switch (memory.type) {
      case 'pdf': return 'bg-emerald-500/10';
      case 'image': return 'bg-amber-500/10';
      case 'audio': return 'bg-purple-500/10';
      case 'link': return 'bg-rose-500/10';
      case 'note': return 'bg-surface';
    }
  };

  return (
    <div className="bg-surface border border-border-card rounded-[16px] p-4 flex flex-col hover:border-border-subtle transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getBgColor()}`}>
          {getIcon()}
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          {memory.duration && <span className="text-xs font-medium">{memory.duration}</span>}
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-primary">
            <Star size={16} />
          </button>
        </div>
      </div>
      
      <div className="mt-auto">
        <h3 className="font-heading font-semibold text-text-main text-lg leading-tight mb-1 line-clamp-2">
          {memory.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          {memory.tag && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-elevated text-emerald-500 border border-emerald-500/20">
              {memory.tag}
            </span>
          )}
          {memory.source && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-elevated text-text-muted border border-border-subtle">
              {memory.source}
            </span>
          )}
          <span className="text-xs text-text-muted">{memory.date}</span>
        </div>
      </div>
    </div>
  );
}
