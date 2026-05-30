import React from 'react';
import { Settings, Folder, Calendar, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { activeTab, setActiveTab } = useAppContext();

  const getBtnClass = (tab: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full
    ${activeTab === tab 
      ? 'bg-blue-600 text-white' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
  `;

  const handleTabClick = (tab: string) => {
    setActiveTab(tab as any);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={onClose} 
        />
      )}
      
      {/* Sidebar container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-full`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 text-slate-100">
            <Menu className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight">SportsAdmin</span>
          </div>
          <button className="md:hidden p-1 text-slate-400 hover:bg-slate-800 rounded" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button className={getBtnClass('categories')} onClick={() => handleTabClick('categories')}>
            <Folder className="w-5 h-5 shrink-0" />
            <span className="truncate">Categories (Playlists)</span>
          </button>
          <button className={getBtnClass('events')} onClick={() => handleTabClick('events')}>
            <Calendar className="w-5 h-5 shrink-0" />
            <span>Live Events</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button className={getBtnClass('settings')} onClick={() => handleTabClick('settings')}>
            <Settings className="w-5 h-5 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </>
  );
}
