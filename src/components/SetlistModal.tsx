import React, { useState } from 'react';
import { X, Trash2, Link as LinkIcon, Music2, QrCode, Search, Plus, Play, ChevronLeft, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Song, SavedSetlist } from '../types';

interface SetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSetlists: SavedSetlist[];
  activeSetlistId: string | null;
  onSetActiveSetlist: (id: string | null) => void;
  onCreateSetlist: (name: string) => void;
  onDeleteSetlist: (id: string) => void;
  onRenameSetlist: (id: string, newName: string) => void;
  onUpdateSetlistSongs: (id: string, newSongs: string[]) => void;
  songs: Song[];
  language: 'en' | 'vn';
  onSongSelect: (song: Song) => void;
}

export function SetlistModal({
  isOpen,
  onClose,
  savedSetlists,
  activeSetlistId,
  onSetActiveSetlist,
  onCreateSetlist,
  onDeleteSetlist,
  onRenameSetlist,
  onUpdateSetlistSongs,
  songs,
  language,
  onSongSelect
}: SetlistModalProps) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSetName, setNewSetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const activeSetlist = savedSetlists.find(s => s.id === activeSetlistId);

  // --- LIBRARY VIEW ---
  if (!activeSetlist) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col h-[70vh] animate-fade-in-up overflow-hidden border border-zinc-200 dark:border-white/10">
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/5">
            <h2 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <Music2 className="w-5 h-5 text-blue-500" />
              {language === 'vn' ? 'Thư viện danh sách' : 'Setlist Library'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full text-zinc-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {/* Create New Block */}
             <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 border border-blue-200 dark:border-blue-500/20">
               {isCreating ? (
                 <div className="flex gap-2">
                   <input 
                     autoFocus
                     value={newSetName}
                     onChange={e => setNewSetName(e.target.value)}
                     placeholder={language === 'vn' ? 'Tên danh sách...' : 'Setlist name...'}
                     className="flex-1 bg-white dark:bg-black/20 rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-blue-500"
                     onKeyDown={e => {
                       if (e.key === 'Enter' && newSetName.trim()) {
                         onCreateSetlist(newSetName);
                         setNewSetName('');
                         setIsCreating(false);
                       }
                     }}
                   />
                   <button 
                     disabled={!newSetName.trim()}
                     onClick={() => {
                        onCreateSetlist(newSetName);
                        setNewSetName('');
                        setIsCreating(false);
                     }}
                     className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                   >
                     {language === 'vn' ? 'Tạo' : 'Add'}
                   </button>
                    <button 
                     onClick={() => setIsCreating(false)}
                     className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => setIsCreating(true)}
                   className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-semibold py-1"
                 >
                   <Plus className="w-4 h-4" />
                   {language === 'vn' ? 'Tạo danh sách mới' : 'Create New Setlist'}
                 </button>
               )}
             </div>

             {savedSetlists.length === 0 && !isCreating && (
               <div className="text-center py-10 text-zinc-400">
                 <p>{language === 'vn' ? 'Chưa có danh sách nào' : 'No setlists found'}</p>
               </div>
             )}

             {savedSetlists.map(list => (
               <div 
                 key={list.id}
                 onClick={() => onSetActiveSetlist(list.id)}
                 className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5 cursor-pointer group transition-colors"
               >
                 <div>
                   <h3 className="font-bold text-zinc-900 dark:text-white">{list.name}</h3>
                   <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                     <span className="flex items-center gap-1">
                       <Music2 className="w-3 h-3" /> {list.songs.length}
                     </span>
                     <span>•</span>
                     <span className="flex items-center gap-1">
                       <Calendar className="w-3 h-3" /> {new Date(list.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                 </div>
                 
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     if (confirm(language === 'vn' ? 'Xóa danh sách này?' : 'Delete this setlist?')) {
                       onDeleteSetlist(list.id);
                     }
                   }}
                   className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  
  const setlistSongs = activeSetlist.songs
    .map(id => songs.find(s => s.id === id))
    .filter((s): s is Song => !!s);

  // Search Logic
  const searchResults = searchQuery 
    ? songs.filter(song => {
        // Exclude songs already in the setlist
        if (activeSetlist.songs.includes(song.id)) return false;

        const query = searchQuery.toLowerCase();
        return (
          song.index.includes(query) ||
          song.titleVn.toLowerCase().includes(query) ||
          song.titleEn.toLowerCase().includes(query)
        );
      }).slice(0, 10) 
    : [];

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?setlist=${activeSetlist.songs.join(',')}&title=${encodeURIComponent(activeSetlist.name)}`
    : '';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleAddSong = (songId: string) => {
    onUpdateSetlistSongs(activeSetlist.id, [...activeSetlist.songs, songId]);
    setSearchQuery('');
  };

  const handleRemoveSong = (songId: string) => {
    onUpdateSetlistSongs(activeSetlist.id, activeSetlist.songs.filter(id => id !== songId));
  };

  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    if (!activeSetlist) return;
    const newSongs = [...activeSetlist.songs];
    if (direction === 'up') {
      if (index === 0) return;
      [newSongs[index - 1], newSongs[index]] = [newSongs[index], newSongs[index - 1]];
    } else {
      if (index === newSongs.length - 1) return;
      [newSongs[index + 1], newSongs[index]] = [newSongs[index], newSongs[index + 1]];
    }
    onUpdateSetlistSongs(activeSetlist.id, newSongs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col h-[85vh] animate-fade-in-up overflow-hidden border border-zinc-200 dark:border-white/10">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col gap-4 bg-zinc-50 dark:bg-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onSetActiveSetlist(null)}
                      className="p-1.5 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <input 
                            value={activeSetlist.name}
                            onChange={(e) => onRenameSetlist(activeSetlist.id, e.target.value)}
                            className="font-bold text-lg text-zinc-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder:text-zinc-400 w-full"
                        />
                         <span className="text-xs text-zinc-500">
                             {activeSetlist.songs.length} {language === 'vn' ? 'bài hát' : 'songs'}
                         </span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full text-zinc-500">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'vn' ? 'Tìm bài hát để thêm...' : 'Search songs to add...'}
                    className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Search Results */}
            {searchQuery && (
                <div className="mb-6 space-y-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        {language === 'vn' ? 'Kết quả tìm kiếm' : 'Search Results'}
                    </h3>
                    {searchResults.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-4 italic">
                            {language === 'vn' ? 'Không tìm thấy bài hát' : 'No songs found'}
                        </p>
                    ) : (
                        searchResults.map(song => (
                            <button
                                key={song.id}
                                onClick={() => handleAddSong(song.id)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                     <span className="text-xs font-bold bg-zinc-100 dark:bg-white/10 text-zinc-500 px-1.5 py-0.5 rounded">
                                        {song.index}
                                    </span>
                                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                                        {language === 'vn' ? song.titleVn : song.titleEn}
                                    </span>
                                </div>
                                <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </button>
                        ))
                    )}
                     <div className="h-px bg-zinc-200 dark:bg-white/10 my-4" />
                </div>
            )}


            {setlistSongs.length === 0 && !searchQuery ? (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <Music2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{language === 'vn' ? 'Danh sách trống' : 'Empty setlist'}</p>
                    <p className="text-sm mt-2 opacity-70">
                        {language === 'vn' ? 'Hãy thêm bài hát vào danh sách' : 'Add songs to your setlist'}
                    </p>
                </div>
            ) : (
                <>
                     {/* Share Panel Toggle */}
                     {!searchQuery && setlistSongs.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <button 
                                onClick={() => setShowShare(!showShare)}
                                className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all text-sm
                                    ${showShare 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                        : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                                    }
                                `}
                            >
                                {showShare ? <X className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                                {showShare ? (language === 'vn' ? 'Đóng Chia Sẻ' : 'Close Share') : (language === 'vn' ? 'Chia Sẻ & QR' : 'Share & QR')}
                            </button>
                            
                            <button 
                                onClick={() => onUpdateSetlistSongs(activeSetlist.id, [])}
                                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                     )}

                     {showShare && (
                         <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-6 border border-zinc-200 dark:border-white/10 animate-fade-in flex flex-col items-center gap-4 mb-4">
                             <div className="bg-white p-3 rounded-xl">
                                 <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply dark:mix-blend-normal" />
                             </div>
                             
                             <div className="w-full flex gap-2">
                                <input 
                                    readOnly 
                                    value={shareUrl} 
                                    className="flex-1 bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono"
                                />
                                <button 
                                    onClick={handleCopy}
                                    className="p-2 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    {copied ? <span className="text-green-600 font-bold text-xs">OK</span> : <LinkIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}
                                </button>
                             </div>
                         </div>
                     )}

                    <div className="space-y-2">
                        {setlistSongs.map((song, index) => (
                            <div 
                                key={song.id} 
                                className="flex items-center gap-3 p-2 pr-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer"
                                onClick={() => onSongSelect(song)}
                            >
                                {/* Reorder Controls */}
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSong(index, 'up');
                                    }}
                                    disabled={index === 0}
                                    className="p-1 text-zinc-300 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-20 disabled:hover:text-zinc-300 transition-colors"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSong(index, 'down');
                                    }}
                                    disabled={index === setlistSongs.length - 1}
                                    className="p-1 text-zinc-300 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-20 disabled:hover:text-zinc-300 transition-colors"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="w-5 text-center text-xs font-bold text-zinc-400 flex-shrink-0">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0">
                                            {song.index}
                                        </span>
                                        <h4 className="font-semibold text-zinc-900 dark:text-white truncate text-sm">
                                            {language === 'vn' ? song.titleVn : song.titleEn}
                                        </h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Play className="w-3 h-3 fill-current" />
                                     </button>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSong(song.id);
                                        }}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
