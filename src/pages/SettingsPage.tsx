import React, { useState, useEffect } from 'react';
import { GithubSettings } from '../types';
import { useAppContext } from '../context/AppContext';
import { Save, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { settings, saveSettings } = useAppContext();
  const [formData, setFormData] = useState<GithubSettings>({
    token: '', owner: '', repo: '', branch: 'main', eventsPath: 'events.json', categoriesPath: 'categories.json'
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">GitHub Config</h1>
      <p className="text-slate-600 mb-8">Configure your GitHub repository access to read and write your JSON data files directly.</p>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Personal Access Token</label>
            <input type="password" name="token" value={formData.token} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ghp_xxxxxxxxxxxx" />
            <p className="mt-1 text-xs text-slate-500">Must have repo read/write access.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner (Username)</label>
              <input type="text" name="owner" value={formData.owner} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g. torvalds" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Repository Name</label>
              <input type="text" name="repo" value={formData.repo} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g. sports-app-data" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
            <input type="text" name="branch" value={formData.branch} onChange={handleChange} required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categories File Path</label>
              <input type="text" name="categoriesPath" value={formData.categoriesPath} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Events File Path</label>
              <input type="text" name="eventsPath" value={formData.eventsPath} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {successMsg}
            </div>
          )}

          <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </form>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg flex gap-3 text-blue-800 border border-blue-100">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Security Notice</p>
          <p>Your token is stored locally in your browser and is only sent directly to the GitHub API. This prevents server-side tracking, but ensure you are on a trusted device.</p>
        </div>
      </div>
    </div>
  );
}
