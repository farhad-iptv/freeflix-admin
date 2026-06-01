import React, { useState, useEffect } from 'react';
import { Event, Stream, Category } from '../types';
import { useAppContext } from '../context/AppContext';
import { fetchGithubFile, commitGithubFile } from '../lib/github';
import { Plus, Pencil, Trash2, CloudDownload, RefreshCw, X, Radio, Clock, MinusCircle, ListVideo } from 'lucide-react';
import ChannelSelectorModal from '../components/ChannelSelectorModal';

export default function EventsPage() {
  const { settings, setError } = useAppContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileSha, setFileSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [selectorStreamIndex, setSelectorStreamIndex] = useState<number | null>(null);

  const loadData = async () => {
    if (!settings?.token || !settings?.owner || !settings?.repo) return;
    setLoading(true);
    setError(null);
    try {
      const [resEvents, resCat] = await Promise.all([
        fetchGithubFile(settings.token, settings.owner, settings.repo, settings.eventsPath, settings.branch).catch(() => null),
        fetchGithubFile(settings.token, settings.owner, settings.repo, settings.categoriesPath, settings.branch).catch(() => null)
      ]);

      if (resEvents) {
        setEvents(JSON.parse(resEvents.content));
        setFileSha(resEvents.sha);
      } else {
        setEvents([]);
        setFileSha(undefined);
      }
      
      if (resCat) {
        setCategories(JSON.parse(resCat.content));
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
      const content = JSON.stringify(events, null, 2);
      const res = await commitGithubFile(
        settings.token, settings.owner, settings.repo, settings.eventsPath, settings.branch,
        content, fileSha, "Update live events via Admin Panel"
      );
      setFileSha(res.content.sha);
      setSaveMessage({ type: 'success', text: "Events successfully saved to GitHub!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setSaveMessage({ type: 'error', text: "Failed to save: " + err.message });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (ev?: Event) => {
    if (ev) {
      setEditingEvent(JSON.parse(JSON.stringify(ev))); // deep clone
    } else {
      setEditingEvent({ 
        id: Date.now().toString(), matchName: '', sportType: 'Football', league: '', 
        homeTeamName: '', homeTeamLogo: '', awayTeamName: '', awayTeamLogo: '', 
        isLive: false, isHot: false, startTime: '', link: '', 
        streams: [{ name: 'Main Stream', url: '', isPrimary: true }] 
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setEvents(prev => {
      const exists = prev.find(c => c.id === editingEvent.id);
      if (exists) {
        return prev.map(c => c.id === editingEvent.id ? editingEvent : c);
      } else {
        return [...prev, editingEvent];
      }
    });
    setIsModalOpen(false);
  };

  const handleStreamChange = (index: number, field: keyof Stream, value: any) => {
    if (!editingEvent) return;
    const newStreams = [...editingEvent.streams];
    if (field === 'isPrimary' && value === true) {
        newStreams.forEach(s => s.isPrimary = false); // only one primary
    }
    newStreams[index] = { ...newStreams[index], [field]: value };
    setEditingEvent({ ...editingEvent, streams: newStreams });
  };

  const addStream = () => {
    if (!editingEvent) return;
    setEditingEvent({ ...editingEvent, streams: [...editingEvent.streams, { name: 'New Stream', url: '', isPrimary: false }] });
  };

  const removeStream = (index: number) => {
    if (!editingEvent) return;
    const newStreams = [...editingEvent.streams];
    newStreams.splice(index, 1);
    setEditingEvent({ ...editingEvent, streams: newStreams });
  };

  if (!settings?.token) return <div className="text-slate-500">Please configure your GitHub settings first.</div>;

  return (
    <div className="flex flex-col h-full space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Events</h1>
          <p className="text-slate-500 mt-1">Manage live sports events and streams</p>
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
            <span className="font-medium text-slate-700">{events.length} Events Loaded</span>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
          <div className="overflow-auto flex-1 p-0">
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium whitespace-nowrap">
                  <th className="px-6 py-3">Match</th>
                  <th className="px-6 py-3">League & Sport</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Streams</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {events.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="font-semibold text-slate-900">{ev.matchName}</span>
                         <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1"><img src={ev.homeTeamLogo || 'https://via.placeholder.com/20'} className="w-4 h-4 object-contain"/> {ev.homeTeamName}</div>
                            <span>vs</span>
                            <div className="flex items-center gap-1"><img src={ev.awayTeamLogo || 'https://via.placeholder.com/20'} className="w-4 h-4 object-contain"/> {ev.awayTeamName}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-slate-900">{ev.league}</div>
                        <div className="text-slate-500 text-xs">{ev.sportType}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2 items-center flex-wrap">
                          {ev.isLive ? <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-medium border border-red-200 flex items-center gap-1"><Radio className="w-3 h-3"/> Live</span> : <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">Upcoming</span>}
                          {ev.isHot && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-medium border border-orange-200">Hot 🔥</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3"/> {ev.startTime}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{ev.streams.length} stream(s)</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 transition-opacity">
                         <button onClick={() => handleOpenModal(ev)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                         <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No events found. Add one or check your config.</td>
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
            <p className="text-slate-600 mb-6 text-sm">Are you sure you want to delete this event? The changes won't be synced to GitHub until you push.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium">Cancel</button>
              <button onClick={() => {
                setEvents(prev => prev.filter(c => c.id !== itemToDelete));
                setItemToDelete(null);
              }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && editingEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 relative shrink-0">
                <h3 className="font-semibold text-lg">{editingEvent.matchName ? 'Edit Event' : 'New Event'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             
             <div className="overflow-y-auto p-6 flex-1">
               <form id="event-form" onSubmit={handleSaveEvent} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Match Name</label>
                        <input type="text" value={editingEvent.matchName} onChange={(e) => setEditingEvent({...editingEvent, matchName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required placeholder="e.g. PSG vs Arsenal" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sport Type</label>
                            <input type="text" value={editingEvent.sportType} onChange={(e) => setEditingEvent({...editingEvent, sportType: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                            <input type="text" value={editingEvent.startTime} onChange={(e) => setEditingEvent({...editingEvent, startTime: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required placeholder="09:00 PM 01/06/2026" />
                         </div>
                     </div>
                     <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">League</label>
                        <input type="text" value={editingEvent.league} onChange={(e) => setEditingEvent({...editingEvent, league: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                     {/* Home Team */}
                     <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 border-b pb-2">Home Team</h4>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                          <input type="text" value={editingEvent.homeTeamName} onChange={(e) => setEditingEvent({...editingEvent, homeTeamName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                          <input type="url" value={editingEvent.homeTeamLogo} onChange={(e) => setEditingEvent({...editingEvent, homeTeamLogo: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                        </div>
                     </div>
                     {/* Away Team */}
                     <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 border-b pb-2">Away Team</h4>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                          <input type="text" value={editingEvent.awayTeamName} onChange={(e) => setEditingEvent({...editingEvent, awayTeamName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                          <input type="url" value={editingEvent.awayTeamLogo} onChange={(e) => setEditingEvent({...editingEvent, awayTeamLogo: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-6 border-t border-slate-100 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editingEvent.isLive} onChange={(e) => setEditingEvent({...editingEvent, isLive: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm font-medium text-slate-700">Is Live Event</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editingEvent.isHot} onChange={(e) => setEditingEvent({...editingEvent, isHot: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm font-medium text-slate-700">Hot/Featured</span>
                      </label>
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-4">
                     <div className="flex justify-between items-center">
                       <h4 className="font-medium text-slate-900">Streams</h4>
                       <button type="button" onClick={addStream} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"><Plus className="w-3 h-3"/> Add Stream</button>
                     </div>
                     {editingEvent.streams.map((stream, idx) => (
                       <div key={idx} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3">
                            <input type="text" placeholder="Stream Name" value={stream.name} onChange={(e) => handleStreamChange(idx, 'name', e.target.value)} className="w-1/3 px-3 py-1.5 border border-slate-300 rounded text-sm"/>
                            <input type="url" placeholder="Stream URL (.m3u8, .mp4)" value={stream.url} onChange={(e) => handleStreamChange(idx, 'url', e.target.value)} className="w-2/3 px-3 py-1.5 border border-slate-300 rounded text-sm"/>
                            <label className="flex items-center gap-1 text-sm whitespace-nowrap px-2">
                               <input type="radio" name="primary_stream" checked={stream.isPrimary} onChange={(e) => handleStreamChange(idx, 'isPrimary', e.target.checked)} className="text-blue-600"/> Main
                            </label>
                            <button type="button" onClick={() => removeStream(idx)} className="text-slate-400 hover:text-red-500" disabled={editingEvent.streams.length <= 1}><MinusCircle className="w-5 h-5"/></button>
                          </div>
                          <div className="flex justify-end">
                             <button type="button" onClick={() => setSelectorStreamIndex(idx)} className="text-xs font-medium text-slate-600 bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-1.5 shadow-sm">
                               <ListVideo className="w-3.5 h-3.5" /> Select from Playlist
                             </button>
                          </div>
                       </div>
                     ))}
                     
                     <div className="mt-4 pt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fallback Link (optional)</label>
                        <input type="url" value={editingEvent.link} onChange={(e) => setEditingEvent({...editingEvent, link: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. web player url" />
                     </div>
                  </div>
               </form>
             </div>
             
             <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-white font-medium shadow-sm">Cancel</button>
                <button type="submit" form="event-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm">Save to List</button>
             </div>
           </div>
        </div>
      )}

      {selectorStreamIndex !== null && (
        <ChannelSelectorModal 
          categories={categories}
          onClose={() => setSelectorStreamIndex(null)}
          onSelect={(name, url) => {
            if (editingEvent) {
              const newStreams = [...editingEvent.streams];
              newStreams[selectorStreamIndex] = {
                ...newStreams[selectorStreamIndex],
                name: name,
                url: url
              };
              setEditingEvent({ ...editingEvent, streams: newStreams });
            }
            setSelectorStreamIndex(null);
          }}
        />
      )}
    </div>
  );
}
