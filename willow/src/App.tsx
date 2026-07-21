/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import UploadModal from './components/UploadModal';
import ChatView from './components/ChatView';
import Splash from './components/Splash';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type ViewState = 'home' | 'library' | 'chat';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [user, loadingAuth] = useAuthState(auth);
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Show splash screen for at least 1.5s
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function checkOnboarding() {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().onboardingComplete) {
            setOnboardingComplete(true);
          } else {
            setOnboardingComplete(false);
          }
        } catch (error) {
          console.error("Error fetching user doc:", error);
          setOnboardingComplete(false);
        }
      } else {
        setOnboardingComplete(null);
      }
    }
    checkOnboarding();
  }, [user]);

  if (showSplash) {
    return <Splash />;
  }

  if (loadingAuth) {
    return <Splash />; // Keep showing splash while auth loads if splash timer finished early
  }

  if (!user) {
    return <Login />;
  }

  if (onboardingComplete === false) {
    return <Onboarding user={user} onComplete={() => setOnboardingComplete(true)} />;
  }

  if (onboardingComplete === null) {
    return <Splash />; // Loading user document
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('chat');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-base text-text-main font-sans selection:bg-primary/30">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onUpload={() => setIsUploadOpen(true)} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden h-full pb-16 md:pb-0">
        {currentView === 'home' && <Dashboard onSearch={handleSearch} onUpload={() => setIsUploadOpen(true)} />}
        {/* We'll re-use ChatView for search and library can just be a placeholder for now to keep it simple, or fully implemented if needed */}
        {currentView === 'library' && (
          <div className="p-8 flex items-center justify-center h-full text-text-muted">
            Library View (Coming Soon)
          </div>
        )}
        {currentView === 'chat' && <ChatView initialQuery={searchQuery} onBack={() => setCurrentView('home')} />}
      </main>

      <MobileNav currentView={currentView} setCurrentView={setCurrentView} onUpload={() => setIsUploadOpen(true)} />
      
      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
}
