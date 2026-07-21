import React from 'react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export default function Login() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-base">
      <div 
        className="absolute top-0 left-0 right-0 h-full pointer-events-none opacity-20 mix-blend-screen"
        style={{ 
          backgroundImage: 'url(https://i.pinimg.com/originals/47/85/8d/47858d858fe59255805a2af1c1972718.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="relative z-10 w-full max-w-md p-8 bg-surface/80 backdrop-blur-xl border border-border-card rounded-[24px] shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden mb-6 bg-black">
          <svg viewBox="0 0 100 100" className="w-10 h-10 fill-none stroke-white stroke-[8] stroke-linecap-round stroke-linejoin-round" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 40 H 40 L 50 70 L 60 50 L 70 70 L 80 40 H 90" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-main mb-2">Welcome to Willow AI</h2>
        <p className="text-text-muted mb-8">Sign in or create an account to start building your infinite memory.</p>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-[18px] font-semibold hover:bg-gray-100 transition-colors active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
