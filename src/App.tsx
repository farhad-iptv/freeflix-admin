import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import SettingsPage from './pages/SettingsPage';
import CategoriesPage from './pages/CategoriesPage';
import EventsPage from './pages/EventsPage';
import { AlertCircle, Menu } from 'lucide-react';

function Dashboard() {
  const { activeTab, error } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto p-4 md:p-8 relative">
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
           <h1 className="font-bold text-xl tracking-tight text-slate-900">SportsAdmin</h1>
           <button onClick={() => setSidebarOpen(true)} className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50">
              <Menu className="w-5 h-5 text-slate-700" />
           </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-3 w-full">
             <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
             <div className="overflow-hidden">
               <h4 className="font-semibold text-sm">Error connecting to GitHub</h4>
               <p className="text-sm mt-1 truncate">{error}</p>
             </div>
          </div>
        )}

        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'categories' && <CategoriesPage />}
        {activeTab === 'events' && <EventsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}

