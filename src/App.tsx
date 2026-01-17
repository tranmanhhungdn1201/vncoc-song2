import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SongList } from './components/SongList';
import { PlayerBar } from './components/PlayerBar';
import { KaraokeScreen } from './components/KaraokeScreen';
import { Song, SavedSetlist } from './types';
import { fetchSongs } from './services/songService';
// We can keep the local songs as a fallback or initial state if needed, 
// but the user wants to fetch from API.
// import { songs as initialSongs } from './data/songs'; 

import { SetlistModal } from './components/SetlistModal';

export function App() {
  const [language, setLanguage] = useState<'en' | 'vn'>('vn');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('favorites');
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
    return new Set();
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  // Default to vocal if available, otherwise beat
  const [audioMode, setAudioMode] = useState<'vocal' | 'beat'>('vocal'); 
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  // Setlist State
  const [storedSetlists, setStoredSetlists] = useState<SavedSetlist[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('savedSetlists');
        if (saved) {
          return JSON.parse(saved);
        }
        
        // Migration from legacy single-list system
        const legacySetlist = localStorage.getItem('setlist');
        if (legacySetlist) {
          const ids = JSON.parse(legacySetlist);
          const name = localStorage.getItem('setlistName') || 'My Setlist';
          // Clear legacy
          localStorage.removeItem('setlist');
          localStorage.removeItem('setlistName');
          
          if (Array.isArray(ids) && ids.length > 0) {
            return [{
              id: Date.now().toString(),
              name,
              songs: ids,
              createdAt: Date.now()
            }];
          }
        }
      } catch (e) {
        console.error('Failed to parse setlists:', e);
      }
    }
    return [];
  });
  
  const [activeSetlistId, setActiveSetlistId] = useState<string | null>(null);
  const [isSetlistModalOpen, setIsSetlistModalOpen] = useState(false);

  // Scroll Position Management
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  // Persist Setlists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedSetlists', JSON.stringify(storedSetlists));
    }
  }, [storedSetlists]);

  useEffect(() => {
    // Check for setlist in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const setlistParam = params.get('setlist');
      const titleParam = params.get('title');
      
      if (setlistParam) {
        const ids = setlistParam.split(',');
        if (ids.length > 0) {
          const newSetlist: SavedSetlist = {
            id: Date.now().toString(),
            name: titleParam || 'Shared Setlist',
            songs: ids,
            createdAt: Date.now()
          };
          
          setStoredSetlists(prev => [newSetlist, ...prev]);
          setActiveSetlistId(newSetlist.id);
          setIsSetlistModalOpen(true);
          
          // Clean URL after loading to avoid sticking
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, []);

  // Handle Song Deep Link
  useEffect(() => {
    // We wait for songs to be loaded before checking the URL
    if (songs.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const songIdParam = params.get('songId');

      if (songIdParam) {
        const foundSong = songs.find(s => s.id === songIdParam);
        if (foundSong) {
          setSelectedSong(foundSong);
          setShowKaraoke(true);
          // Optional: Auto-play if desired by user, or let them press play
          if (foundSong.vocalUrl || foundSong.beatUrl) {
             setIsPlaying(true);
          }
          
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [songs]);

  useEffect(() => {
    if (!showKaraoke && savedScrollPosition > 0) {
      // Restore scroll position when returning from Karaoke mode
      // Use setTimeout to ensure DOM has re-rendered
      setTimeout(() => {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: 'auto' // Instant jump, 'smooth' might be annoying here
        });
      }, 10);
    }
  }, [showKaraoke]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist favorites to localStorage
  useEffect(() => {
    // Only save if we have initialized or changed
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    }
  }, [favorites]);

  const loadSongs = React.useCallback(async () => {
    setIsLoading(true);
    const fetchedSongs = await fetchSongs();
    setSongs(fetchedSongs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  // Audio handling
  useEffect(() => {
    if (selectedSong) {
      // Determine source based on mode and availability
      let src = '';
      if (audioMode === 'vocal' && selectedSong.vocalUrl) {
        src = selectedSong.vocalUrl;
      } else if (audioMode === 'beat' && selectedSong.beatUrl) {
        src = selectedSong.beatUrl;
      } else {
        // Fallback
        src = selectedSong.vocalUrl || selectedSong.beatUrl || '';
      }

      if (audioRef.current) {
        // Only change src if it's different to avoid reloading if just re-selecting same logic (though song change implies new src usually)
        if (audioRef.current.src !== src) {
          audioRef.current.src = src;
          audioRef.current.load();
        }
        
        if (isPlaying && src) {
          audioRef.current.play().catch(e => console.error("Play failed:", e));
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [selectedSong, audioMode, isPlaying]); // Re-run if song, mode or play state changes

  // Handle play/pause toggle from UI
  const handlePlayPause = () => {
    if (!selectedSong || (!selectedSong.vocalUrl && !selectedSong.beatUrl)) return;

    const newState = !isPlaying;
    setIsPlaying(newState);
    if (audioRef.current) {
      if (newState) {
        audioRef.current.play().catch(e => console.error("Play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Handle Seek
  const handleTimeSeek = (time: number | ((prev: number) => number)) => {
    let newTime;
    if (typeof time === 'function') {
      newTime = time(currentTime);
    } else {
      newTime = time;
    }
    
    if (audioRef.current && isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleToggleAudioMode = () => {
    setAudioMode(prev => prev === 'vocal' ? 'beat' : 'vocal');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleFavorite = (songId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) {
        newFavorites.delete(songId);
      } else {
        newFavorites.add(songId);
      }
      return newFavorites;
    });
  };

  // Setlist Handlers
  const handleCreateSetlist = (name: string) => {
    const newSetlist: SavedSetlist = {
      id: Date.now().toString(),
      name: name || (language === 'vn' ? 'Danh sách mới' : 'New Setlist'),
      songs: [],
      createdAt: Date.now()
    };
    setStoredSetlists(prev => [newSetlist, ...prev]);
    setActiveSetlistId(newSetlist.id);
  };

  const handleDeleteSetlist = (id: string) => {
    setStoredSetlists(prev => prev.filter(l => l.id !== id));
    if (activeSetlistId === id) {
      setActiveSetlistId(null);
    }
  };

  const handleRenameSetlist = (id: string, newName: string) => {
    setStoredSetlists(prev => prev.map(l => 
      l.id === id ? { ...l, name: newName } : l
    ));
  };

  const handleUpdateSetlistSongs = (id: string, newSongs: string[]) => {
    setStoredSetlists(prev => prev.map(l => 
      l.id === id ? { ...l, songs: newSongs } : l
    ));
  };


  // Volume State
  const [volume, setVolume] = useState(1);

  const handleNextSong = () => {
    if (!selectedSong) return;
    
    // Filter songs if in favorites mode, otherwise use all songs
    const effectiveSongs = showFavoritesOnly 
      ? songs.filter(s => favorites.has(s.id))
      : songs;
      
    if (effectiveSongs.length === 0) return;

    const currentIndex = effectiveSongs.findIndex(s => s.id === selectedSong.id);
    // If current song is not in the list (e.g. was just unfavorited), start from 0
    let nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % effectiveSongs.length;
    
    // Loop until we find a song with audio or return to start
    let attempts = 0;
    while (attempts < effectiveSongs.length) {
      const song = effectiveSongs[nextIndex];
      if (song.vocalUrl || song.beatUrl) {
        setSelectedSong(song);
        return;
      }
      nextIndex = (nextIndex + 1) % effectiveSongs.length;
      attempts++;
    }
  };

  const handlePrevSong = () => {
    if (!selectedSong) return;

    // Filter songs if in favorites mode, otherwise use all songs
    const effectiveSongs = showFavoritesOnly 
      ? songs.filter(s => favorites.has(s.id))
      : songs;
      
    if (effectiveSongs.length === 0) return;

    const currentIndex = effectiveSongs.findIndex(s => s.id === selectedSong.id);
    // If current song is not in the list, start from end
    let prevIndex = currentIndex === -1 
      ? effectiveSongs.length - 1 
      : (currentIndex - 1 + effectiveSongs.length) % effectiveSongs.length;
    
    // Loop until we find a song with audio or return to start
    let attempts = 0;
    while (attempts < effectiveSongs.length) {
      const song = effectiveSongs[prevIndex];
      if (song.vocalUrl || song.beatUrl) {
        setSelectedSong(song);
        return;
      }
      prevIndex = (prevIndex - 1 + effectiveSongs.length) % effectiveSongs.length;
      attempts++;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const v = Math.max(0, Math.min(1, newVolume));
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const handleShare = async () => {
    if (!selectedSong) return;
    const text = `Check out this song: ${selectedSong.titleVn} - ${selectedSong.titleEn}`;
    
    // Construct URL with song Id
    const url = new URL(window.location.href);
    url.searchParams.set('songId', selectedSong.id);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VNCOC Songs',
          text: text,
          url: shareUrl, 
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Media Session API Handling
  useEffect(() => {
    if ('mediaSession' in navigator && selectedSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: language === 'vn' ? selectedSong.titleVn : selectedSong.titleEn,
        artist: 'VNCOC Songs',
        album: 'Thánh Ca & Hymns',
        artwork: [
          { src: 'https://cdn-icons-png.flaticon.com/512/9043/9043013.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevSong);
      navigator.mediaSession.setActionHandler('nexttrack', handleNextSong);
    }
  }, [selectedSong, language, isPlaying]); // Re-register when song changes to update metadata

  // Ensure volume is set when audio loads
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef.current]);


  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden pb-24 font-sans selection:bg-sky-500/30 transition-colors duration-300">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
           setDuration(e.currentTarget.duration);
           if (audioRef.current) { audioRef.current.volume = volume; }
        }}
        onEnded={handleNextSong}
      />

      {/* Aurora Background Effects - Adaptive */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[100px] animate-blob filter mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-400/30 dark:bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 filter mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-400/30 dark:bg-emerald-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000 filter mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        {!showKaraoke ? (
          <>
            <Header 
              language={language} 
              onLanguageChange={setLanguage}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
              favoritesCount={favorites.size}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenSetlist={() => setIsSetlistModalOpen(true)}
              setlistCount={0}
            />
            <SearchBar 
              language={language} 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            {isLoading ? (
               <div className="text-center py-20 text-zinc-500">Loading songs...</div>
            ) : (
              <SongList 
                songs={songs}
                language={language}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                showFavoritesOnly={showFavoritesOnly}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onSongSelect={(song) => {
                  setSelectedSong(song);
                  if (song.vocalUrl || song.beatUrl) {
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(false);
                  }
                }}
                currentSongId={selectedSong?.id}
                onRefresh={loadSongs}
              />
            )}
            {selectedSong && (
              <PlayerBar 
                song={selectedSong}
                language={language}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onKaraokeMode={() => {
                  setSavedScrollPosition(window.scrollY);
                  setShowKaraoke(true);
                }}
                currentTime={currentTime}
                onTimeChange={handleTimeSeek}
                isFavorite={favorites.has(selectedSong.id)}
                onToggleFavorite={() => toggleFavorite(selectedSong.id)}
                duration={duration}
                audioMode={audioMode}
                onToggleAudioMode={handleToggleAudioMode}
                onNext={handleNextSong}
                onPrev={handlePrevSong}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                onShare={handleShare}
              />
            )}
          </>
        ) : (
          <KaraokeScreen 
            song={selectedSong!} 
            language={language} 
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onClose={() => setShowKaraoke(false)}
            currentTime={currentTime}
            onTimeChange={handleTimeSeek}
            duration={duration}
            audioMode={audioMode}
            onToggleAudioMode={handleToggleAudioMode}
            onNext={handleNextSong}
            onPrev={handlePrevSong}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onShare={handleShare}
          />
        )}
      </div>

      <SetlistModal 
        isOpen={isSetlistModalOpen}
        onClose={() => setIsSetlistModalOpen(false)}
        savedSetlists={storedSetlists}
        activeSetlistId={activeSetlistId}
        onSetActiveSetlist={setActiveSetlistId}
        onCreateSetlist={handleCreateSetlist}
        onDeleteSetlist={handleDeleteSetlist}
        onRenameSetlist={handleRenameSetlist}
        onUpdateSetlistSongs={handleUpdateSetlistSongs}
        songs={songs}
        language={language}
        onSongSelect={(song) => {
           setSelectedSong(song);
           if (song.vocalUrl || song.beatUrl) {
             setIsPlaying(true);
           }
           setIsSetlistModalOpen(false); // Close modal, open Karaoke via state
           setSavedScrollPosition(window.scrollY); // Save scroll
           setShowKaraoke(true); // Open Karaoke
        }}
      />
    </div>
  );
}