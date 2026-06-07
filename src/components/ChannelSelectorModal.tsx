import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { Search, X, Loader2, ListVideo, CheckSquare, Square } from 'lucide-react';

interface Channel {
  name: string;
  url: string;
}

interface ChannelSelectorModalProps {
  categories: Category[];
  onSelect: (channels: {name: string, url: string}[]) => void;
  onClose: () => void;
}

export default function ChannelSelectorModal({
  categories,
  onSelect,
  onClose
}: ChannelSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!selectedCategory) {
      setChannels([]);
      setSelectedChannels([]);
      return;
    }
    const loadPlaylist = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(selectedCategory.playlistUrl);
        if (!res.ok) throw new Error('Failed to fetch playlist');
        const text = await res.text();
        const lines = text.split('\n');
        const items: Channel[] = [];
        let currentItem: Channel | null = null;
        let currentOptions: Record<string, string> = {};

        for (const line of lines) {
          if (line.startsWith('#EXTINF:')) {
             const nameMatch = line.match(/,(.+)$/);
             currentItem = { name: nameMatch ? nameMatch[1].trim() : 'Unknown', url: '' };
          } else if (line.startsWith('#EXTVLCOPT:')) {
             // e.g. #EXTVLCOPT:http-referrer=https://streamcenter.xyz
             const optMatch = line.match(/#EXTVLCOPT:([^=]+)=(.*)/);
             if (optMatch) {
               const key = optMatch[1].trim();
               const val = optMatch[2].trim();
               if (key === 'http-referrer') currentOptions['Referer'] = val;
               if (key === 'http-origin') currentOptions['Origin'] = val;
               if (key === 'http-user-agent') currentOptions['User-Agent'] = val;
             }
          } else if (line.trim() !== '' && !line.startsWith('#')) {
             if (currentItem) {
               let finalUrl = line.trim();
               if (Object.keys(currentOptions).length > 0) {
                 const headers = Object.entries(currentOptions).map(([k, v]) => `${k}=${v}`).join('&');
                 finalUrl += `|${headers}`;
               }
               currentItem.url = finalUrl;
               items.push(currentItem);
               currentItem = null;
               currentOptions = {};
             }
          }
        }
        setChannels(items);
        setSelectedChannels([]);
      } catch (err: any) {
        setError(err.message || 'Error loading playlist (often caused by CORS policies on the target server)');
      } finally {
        setLoading(false);
      }
    };
    loadPlaylist();
  }, [selectedCategory]);

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelection = (channel: Channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl flex flex-col h-[80vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-blue-600" />
            Select Channel from Playlist
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50 shrink-0">
           <div className="flex gap-4">
             <div className="w-1/3">
               <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Select Category</label>
               <select 
                 className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                 value={selectedCategory?.playlistUrl || ''}
                 onChange={(e) => {
                   const cat = categories.find(c => c.playlistUrl === e.target.value);
                   setSelectedCategory(cat || null);
                 }}
               >
                 <option value="">-- Choose Playlist --</option>
                 {categories.map((cat, idx) => (
                   <option key={idx} value={cat.playlistUrl}>{cat.name}</option>
                 ))}
               </select>
             </div>
             <div className="w-2/3">
               <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Search Channel</label>
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Search by channel name..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   disabled={!selectedCategory || loading}
                   className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                 />
                 <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
               </div>
             </div>
           </div>
           {selectedChannels.length > 0 && (
             <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-sm font-medium text-blue-600">{selectedChannels.length} channel(s) selected</span>
                <button 
                  onClick={() => {
                     onSelect(selectedChannels);
                     onClose();
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                >
                  Add Selected Streams
                </button>
             </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-white relative">
          {!selectedCategory ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              Please select a playlist category above to load channels.
            </div>
          ) : loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600 gap-3">
               <Loader2 className="w-8 h-8 animate-spin" />
               <span className="text-sm font-medium">Fetching M3U playlist...</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm p-4 text-center">
              {error}
            </div>
          ) : channels.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              No channels found in this playlist.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
               {filteredChannels.length === 0 ? (
                 <div className="text-center text-sm text-slate-500 py-8">No channels match your search.</div>
               ) : filteredChannels.map((ch, idx) => {
                 const isSelected = selectedChannels.includes(ch);
                 return (
                   <button 
                     key={idx} 
                     type="button"
                     onClick={() => toggleSelection(ch)}
                     className={`text-left px-4 py-3 border rounded-lg transition-colors flex items-center gap-3 w-full ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                   >
                     {isSelected ? (
                       <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                     ) : (
                       <Square className="w-5 h-5 text-slate-300 shrink-0" />
                     )}
                     <div className="flex flex-col gap-0.5 overflow-hidden w-full">
                       <span className={`font-medium text-sm truncate w-full ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{ch.name}</span>
                       <span className="text-xs text-slate-400 truncate w-full">{ch.url}</span>
                     </div>
                   </button>
                 );
               })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
