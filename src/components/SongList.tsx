import { Heart, Music2, Play, ChevronUp, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { useState, useEffect, useRef } from 'react';

interface SongListProps {
  songs: Song[];
  language: 'en' | 'vn';
  searchQuery: string;
  selectedCategory: string | null;
  showFavoritesOnly: boolean;
  favorites: Set<string>;
  onToggleFavorite: (songId: string) => void;
  onSongSelect: (song: Song) => void;
  currentSongId?: string;
  onRefresh?: () => Promise<void>;
}

export function SongList({
  songs,
  language,
  searchQuery,
  selectedCategory,
  showFavoritesOnly,
  favorites,
  onToggleFavorite,
  onSongSelect,
  currentSongId,
  onRefresh
}: SongListProps) {
  const filteredSongs = songs.filter(song => {
    if (showFavoritesOnly && !favorites.has(song.id)) return false;
    if (selectedCategory && song.category !== selectedCategory) return false;
    if (searchQuery === '') return true;
    const query = searchQuery.toLowerCase();
    
    return (
      song.index.includes(query) ||
      song.titleVn.toLowerCase().includes(query) ||
      song.titleEn.toLowerCase().includes(query) ||
      song.tags.some(tag => tag.toLowerCase().includes(query)) ||
      song.lyricsVn.some(line => line.toLowerCase().includes(query)) ||
      song.lyricsEn.some(line => line.toLowerCase().includes(query))
    );
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pullStart, setPullStart] = useState(0);
  const [pullChange, setPullChange] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'traditional':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'contemporary':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case 'hymn':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  // Pull to Refresh Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing && onRefresh) {
      setPullStart(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart > 0 && window.scrollY === 0 && !isRefreshing && onRefresh) {
      const touchY = e.targetTouches[0].clientY;
      const diff = touchY - pullStart;
      if (diff > 0) {
        // e.preventDefault(); // Can't prevent default in passive listener easily in React, relying on CSS/Scroll behavior
        setPullChange(Math.min(diff * 0.5, 100)); // Resistance
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullChange > 60 && onRefresh) {
      setIsRefreshing(true);
      setPullChange(60); // Snap to loading position
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
           setIsRefreshing(false);
           setPullChange(0);
           setPullStart(0);
        }, 500);
      }
    } else {
      setPullChange(0);
      setPullStart(0);
    }
  };

  return (
    <div 
      className="space-y-2 pb-20 relative touch-pan-y"
      ref={listRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="flex items-center justify-center overflow-hidden transition-all duration-300 ease-out"
        style={{ 
          height: isRefreshing ? 60 : pullChange, 
          opacity: Math.min(pullChange / 40, 1) 
        }}
      >
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            <Loader2 className={`w-5 h-5 ${isRefreshing || pullChange > 60 ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullChange * 3}deg)` }} />
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music2 className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-500 font-medium">
            {language === 'vn' ? 'Không tìm thấy bài hát nào' : 'No songs found'}
          </p>
        </div>
      ) : (
        filteredSongs.map((song, index) => {
          const isPlaying = currentSongId === song.id;
          const isFavorite = favorites.has(song.id);
          
          return (
            <div 
              key={song.id} 
              onClick={() => onSongSelect(song)}
              className={`
                group glass-panel border-0 rounded-2xl p-3 flex items-center gap-4 cursor-pointer transition-all duration-300
                ${isPlaying 
                  ? 'bg-white/10 ring-1 ring-white/20' 
                  : 'hover:bg-white/10 hover:translate-x-1'
                }
                animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300
                ${isPlaying 
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 group-hover:bg-blue-100 dark:group-hover:bg-white/10 group-hover:text-blue-600 dark:group-hover:text-white'
                }
              `}>
                {isPlaying ? <Music2 className="w-5 h-5 animate-pulse" /> : song.index}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className={`font-semibold truncate text-sm sm:text-base ${isPlaying ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors'}`}>
                    {language === 'vn' ? song.titleVn : song.titleEn}
                  </h3>
                  {song.hasAudio && (
                    <div className="p-1 rounded-full bg-emerald-500/20">
                      <Play className="w-2 h-2 text-emerald-600 dark:text-emerald-400 fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${getCategoryColor(song.category)}`}>
                    {song.category}
                  </span>
                  {song.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(song.id);
                }}
                className={`
                  flex-shrink-0 p-2.5 rounded-xl transition-all duration-300 
                  ${isFavorite 
                    ? 'text-red-500 bg-red-500/10' 
                    : 'text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400'
                  }
                `}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          );
        })
      )}
      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 p-3 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 animate-fade-in z-40 md:bottom-24 md:right-8 group"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
      )}
    </div>
  );
}