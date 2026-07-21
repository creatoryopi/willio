import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative bg-black">
          <svg viewBox="0 0 100 100" className="w-16 h-16 fill-none stroke-white stroke-[8] stroke-linecap-round stroke-linejoin-round" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 40 H 40 L 50 70 L 60 50 L 70 70 L 80 40 H 90" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-text-main flex items-center gap-2">
          Willow<span className="text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">AI</span>
        </h1>
        <p className="text-text-muted mt-4 text-lg font-medium opacity-80 flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Awakening your memory...
        </p>
      </div>
    </div>
  );
}
