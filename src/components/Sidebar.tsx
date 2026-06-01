import React from 'react';
import { Settings, Folder, Calendar, Menu, Activity, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { activeTab, setActiveTab } = useAppContext();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const getBtnClass = (tab: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
    ${activeTab === tab 
      ? 'bg-blue-600 shadow-md shadow-blue-600/20 text-white translate-x-1' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}
  `;

  return (
    <div className="w-72 bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col h-screen shadow-xl">
      <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">SportsAdmin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2">
        <button className={getBtnClass('categories')} onClick={() => handleTabClick('categories')}>
          <Folder className="w-5 h-5" />
          Categories (Playlists)
        </button>
        <button className={getBtnClass('events')} onClick={() => handleTabClick('events')}>
          <Calendar className="w-5 h-5" />
          Live Events
        </button>
      </div>

      <div className="p-4 border-t border-slate-800/50">
        <button className={getBtnClass('settings')} onClick={() => handleTabClick('settings')}>
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </div>
  );
}
