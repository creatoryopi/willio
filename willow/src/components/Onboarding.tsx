import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, updateProfile } from 'firebase/auth';

interface OnboardingProps {
  user: User;
  onComplete: () => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.displayName || '');
  const [hobby, setHobby] = useState('');
  const [source, setSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        hobby,
        source,
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }, { merge: true });
      await updateProfile(user, { displayName: name });
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-base">
      <div className="w-full max-w-md p-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-surface'}`}></div>
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-surface'}`}></div>
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-surface'}`}></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">What should we call you?</h2>
              <p className="text-text-muted mb-8">Your AI assistant needs to know who to address.</p>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-surface border border-border-card rounded-[20px] py-4 px-6 text-lg focus:outline-none focus:border-primary transition-colors text-text-main mb-6"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">What's a hobby you enjoy?</h2>
              <p className="text-text-muted mb-8">We'll tailor your memory experience to your interests.</p>
              <input 
                type="text" 
                value={hobby}
                onChange={(e) => setHobby(e.target.value)}
                placeholder="e.g. Photography, Coding, Reading"
                required
                className="w-full bg-surface border border-border-card rounded-[20px] py-4 px-6 text-lg focus:outline-none focus:border-primary transition-colors text-text-main mb-6"
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">Where did you hear about us?</h2>
              <p className="text-text-muted mb-8">Help us understand how people find Willow AI.</p>
              <select 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                className="w-full bg-surface border border-border-card rounded-[20px] py-4 px-6 text-lg focus:outline-none focus:border-primary transition-colors text-text-main mb-6 appearance-none"
                autoFocus
              >
                <option value="" disabled>Select an option</option>
                <option value="twitter">Twitter / X</option>
                <option value="producthunt">Product Hunt</option>
                <option value="youtube">YouTube</option>
                <option value="friend">Friend / Colleague</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting || (step === 1 && !name) || (step === 2 && !hobby) || (step === 3 && !source)}
            className="self-end bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-full font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {step < 3 ? 'Next' : (isSubmitting ? 'Saving...' : 'Get Started')}
            {step < 3 && <ArrowRight size={18} />}
            {step === 3 && !isSubmitting && <Sparkles size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
