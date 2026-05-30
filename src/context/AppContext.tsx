import React, { createContext, useContext, useState, useEffect } from 'react';
import { GithubSettings } from '../types';

interface AppContextType {
  settings: GithubSettings | null;
  saveSettings: (settings: GithubSettings) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: GithubSettings = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  eventsPath: 'events.json',
  categoriesPath: 'categories.json'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GithubSettings | null>(null);
  const [activeTab, setActiveTab] = useState<string>('settings');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sports_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        // If settings look somewhat complete, go to categories by default
        if (parsed.token && parsed.owner && parsed.repo) {
            setActiveTab('categories');
        }
      } catch (e) {
        setSettings(defaultSettings);
      }
    } else {
        setSettings(defaultSettings);
    }
  }, []);

  const saveSettings = (newSettings: GithubSettings) => {
    setSettings(newSettings);
    localStorage.setItem('sports_admin_settings', JSON.stringify(newSettings));
    setError(null);
  };

  return (
    <AppContext.Provider value={{ settings, saveSettings, activeTab, setActiveTab, isLoading, setIsLoading, error, setError }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
