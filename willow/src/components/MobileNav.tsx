import React from 'react';
import { Home, Folder, Plus, Search, Settings } from 'lucide-react';
import { ViewState } from '../App';

interface MobileNavProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  onUpload: () => void;
}

export default function MobileNav({ currentView, setCurrentView, onUpload }: MobileNavProps) {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'library', icon: Folder, label: 'Library' },
    { id: 'upload', icon: Plus, label: 'Upload', isAction: true },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border-subtle px-6 flex items-center justify-between z-40">
      {items.map((item) => {
        if (item.isAction) {
          return (
            <button
              key={item.id}
              onClick={onUpload}
              className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black shadow-lg shadow-primary/20 transform -translate-y-4"
            >
              <item.icon size={24} />
            </button>
          );
        }

        const isActive = currentView === item.id || (item.id === 'search' && currentView === 'chat');

        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as ViewState)}
            className={`flex flex-col items-center gap-1 ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
