import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import SettingsPage from './pages/SettingsPage';
import CategoriesPage from './pages/CategoriesPage';
import EventsPage from './pages/EventsPage';
import { AlertCircle, Menu } from 'lucide-react';

function Dashboard() {
  const { activeTab, error } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block transition-transform duration-300 ease-in-out`}>
         <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shadow-sm relative">
           <div className="font-bold text-lg text-slate-800 tracking-tight">SportsAdmin</div>
           <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
             <Menu className="w-6 h-6" />
           </button>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl shadow-sm flex items-start gap-3">
               <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
               <div>
                 <h4 className="font-semibold text-sm">Error connecting to GitHub</h4>
                 <p className="text-sm mt-1">{error}</p>
               </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'settings' && <SettingsPage />}
            {activeTab === 'categories' && <CategoriesPage />}
            {activeTab === 'events' && <EventsPage />}
          </div>
        </main>
      </div>
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

