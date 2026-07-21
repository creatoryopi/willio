import React from 'react';
import { Home, Folder, Layers, Search, Star, Clock, Settings, Trash2, BrainCircuit, Bell, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { ViewState } from '../App';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, logOut } from '../lib/firebase';

interface SidebarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  onUpload: () => void;
}

export default function Sidebar({ currentView, setCurrentView, onUpload }: SidebarProps) {
  const [user] = useAuthState(auth);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'library', icon: Folder, label: 'Library' },
    { id: 'collections', icon: Layers, label: 'Collections' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'favorites', icon: Star, label: 'Favorites' },
    { id: 'recent', icon: Clock, label: 'Recent' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-base border-r border-border-subtle p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-black">
          <svg viewBox="0 0 100 100" className="w-5 h-5 fill-none stroke-white stroke-[8] stroke-linecap-round stroke-linejoin-round" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 40 H 40 L 50 70 L 60 50 L 70 70 L 80 40 H 90" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-text-main">Willow<span className="text-primary">AI</span></span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'search' && currentView === 'chat');
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-surface text-primary' 
                  : 'text-text-muted hover:text-text-main hover:bg-surface/50'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 mt-auto pt-6 border-t border-border-subtle mb-6">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">
          <Trash2 size={20} />
          <span className="font-medium text-sm">Trash</span>
        </button>
      </div>

      {user ? (
        <div 
          onClick={logOut}
          className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border-card cursor-pointer hover:bg-elevated transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-text-main font-bold text-sm overflow-hidden">
            {user.photoURL ? <img src={user.photoURL} alt="User" /> : user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.displayName || 'User'}</p>
            <p className="text-xs text-text-muted">Sign out</p>
          </div>
          <LogOut size={16} className="text-text-muted" />
        </div>
      ) : (
        <div 
          onClick={signInWithGoogle}
          className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border-card cursor-pointer hover:bg-elevated transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-text-main">
            <LogIn size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">Sign in</p>
            <p className="text-xs text-text-muted">Sync your memory</p>
          </div>
        </div>
      )}
    </aside>
  );
}
