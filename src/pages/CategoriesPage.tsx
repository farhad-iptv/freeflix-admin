import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { useAppContext } from '../context/AppContext';
import { fetchGithubFile, commitGithubFile } from '../lib/github';
import { Plus, Pencil, Trash2, Save, CloudDownload, RefreshCw, X } from 'lucide-react';

export default function CategoriesPage() {
  const { settings, setError } = useAppContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileSha, setFileSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const loadData = async () => {
    if (!settings?.token || !settings?.owner || !settings?.repo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGithubFile(settings.token, settings.owner, settings.repo, settings.categoriesPath, settings.branch);
      if (res) {
        setCategories(JSON.parse(res.content));
        setFileSha(res.sha);
      } else {
        setCategories([]);
        setFileSha(undefined);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [settings]);

  const saveToGithub = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const content = JSON.stringify(categories, null, 2);
      const res = await commitGithubFile(
        settings.token, settings.owner, settings.repo, settings.categoriesPath, settings.branch,
        content, fileSha, "Update categories via Admin Panel"
      );
      setFileSha(res.content.sha);
      setSaveMessage({ type: 'success', text: "Categories successfully saved to GitHub!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setSaveMessage({ type: 'error', text: "Failed to save: " + err.message });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCat({ ...cat });
    } else {
      setEditingCat({ id: 'cat_' + Date.now(), name: '', logoUrl: '', playlistUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    
    setCategories(prev => {
      const exists = prev.find(c => c.id === editingCat.id);
      if (exists) {
        return prev.map(c => c.id === editingCat.id ? editingCat : c);
      } else {
        return [...prev, editingCat];
      }
    });
    setIsModalOpen(false);
  };

  if (!settings?.token) {
    return <div className="text-slate-500">Please configure your GitHub settings first.</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1">Manage your M3U playlist categories</p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
          {saveMessage && (
            <span className={`text-sm font-medium px-4 py-2 rounded-xl flex-1 md:flex-none text-center ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {saveMessage.text}
            </span>
          )}
          <button onClick={loadData} disabled={loading} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Reload
          </button>
          <button onClick={saveToGithub} disabled={saving} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-600/20 transition-all">
            <CloudDownload className="w-4 h-4" /> {saving ? 'Pushing...' : 'Push to GitHub'}
          </button>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="font-medium text-slate-700">{categories.length} Categories Loaded</span>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
          <div className="overflow-auto flex-1 p-0">
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium whitespace-nowrap">
                  <th className="px-6 py-3">Logo & Name</th>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Playlist URL</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={cat.logoUrl || 'https://via.placeholder.com/40'} alt={cat.name} className="w-8 h-8 rounded-md bg-slate-200 object-cover" />
                        <span className="font-medium text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{cat.id}</td>
                    <td className="px-6 py-4">
                       <a href={cat.playlistUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-xs block" title={cat.playlistUrl}>{cat.playlistUrl}</a>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 transition-opacity">
                         <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                         <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No categories found. Add one or check your config.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-semibold text-lg mb-2">Confirm Delete</h3>
            <p className="text-slate-600 mb-6 text-sm">Are you sure you want to delete this category? The changes won't be synced to GitHub until you push.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium">Cancel</button>
              <button onClick={() => {
                setCategories(prev => prev.filter(c => c.id !== itemToDelete));
                setItemToDelete(null);
              }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && editingCat && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden">
             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-lg">{editingCat.name ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">ID</label>
                   <input type="text" value={editingCat.id} onChange={(e) => setEditingCat({...editingCat, id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                   <input type="text" value={editingCat.name} onChange={(e) => setEditingCat({...editingCat, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                   <input type="url" value={editingCat.logoUrl} onChange={(e) => setEditingCat({...editingCat, logoUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Playlist URL (.m3u)</label>
                   <input type="url" value={editingCat.playlistUrl} onChange={(e) => setEditingCat({...editingCat, playlistUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Save to List</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
