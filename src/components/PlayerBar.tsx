import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Heart, Volume2, VolumeX, Share2 } from 'lucide-react';
import { Song } from '../types';

interface PlayerBarProps {
  song: Song;
  language: 'en' | 'vn';
  isPlaying: boolean;
  onPlayPause: () => void;
  onKaraokeMode: () => void;
  currentTime: number;
  onTimeChange: (time: number | ((prev: number) => number)) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  duration?: number;
  audioMode?: 'vocal' | 'beat';
  onToggleAudioMode?: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onShare: () => void;
}

export function PlayerBar({
  song,
  language,
  isPlaying,
  onPlayPause,
  onKaraokeMode,
  currentTime,
  onTimeChange,
  isFavorite,
  onToggleFavorite,
  duration = 205, // fallback if not provided
  audioMode,
  onToggleAudioMode,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  onShare
}: PlayerBarProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Removed internal fake timer logic - now controlled by parent App.tsx


  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '00:00';
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onTimeChange(Math.floor(percentage * duration));
  };

  const hasAudio = !!(song.vocalUrl || song.beatUrl);

  if (!hasAudio) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-zinc-200 dark:border-white/10 z-50">
        <div className="px-4 py-4 md:py-5 max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Song Info (Minimal) */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-zinc-900 dark:text-white truncate text-sm mb-1">
              <span className="text-zinc-500 dark:text-zinc-500 mr-2">#{song.index}</span>
              {language === 'vn' ? song.titleVn : song.titleEn}
            </h4>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
               {language === 'vn' ? 'Chế độ xem lời bài hát (Không có Audio)' : 'Lyrics Mode (No Audio)'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleFavorite}
              className={`p-2 rounded-full transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-white/10 ${isFavorite ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-400'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

             <button 
                onClick={onPrev}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <SkipBack className="w-5 h-5" />
              </button>

            <button 
              onClick={onKaraokeMode}
              className="px-4 py-2 bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-900 dark:text-white rounded-full font-bold text-sm transition-all flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              {language === 'vn' ? 'Xem Lời' : 'Read Lyrics'}
            </button>

             <button 
                onClick={onNext}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <SkipForward className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-zinc-200 dark:border-white/10 z-50">
      {/* Progress Bar */}
      <div 
        className="h-1 bg-zinc-200 dark:bg-white/10 cursor-pointer relative group"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-blue-800 relative"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100 duration-200"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
        </div>
      </div>

      <div className="px-4 py-4 md:py-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-zinc-900 dark:text-white truncate text-sm mb-1">
              <span className="text-blue-600 dark:text-blue-400 mr-2">#{song.index}</span>
              {language === 'vn' ? song.titleVn : song.titleEn}
            </h4>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="text-zinc-700 dark:text-zinc-300">{formatTime(currentTime)}</span>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Volume Control (Desktop) */}
             <div 
              className="relative hidden md:flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
             >
                <div className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 pb-4 p-2 transition-all duration-200
                    ${showVolumeSlider ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}>
                  <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-white/10 p-2">
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="h-24 w-1.5 -rotate-180 appearance-none bg-zinc-200 dark:bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' }}
                    />
                  </div>
                </div>
                <button 
                    onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all"
                >
                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
             </div>

             <button 
              onClick={onShare}
              className="p-2 hidden md:block text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 md:p-2 rounded-full transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-white/10 ${isFavorite ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-400'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <div className="flex items-center gap-1.5 md:gap-4">
              {/* Audio Mode Toggle - Only show if both are available or if we want to show generic toggle */}
              {(song.beatUrl && song.vocalUrl) && (
                 <button 
                  onClick={onToggleAudioMode}
                  className={`px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded-full transition-all uppercase flex-shrink-0
                    ${audioMode === 'beat' 
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300' 
                      : 'bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/20'
                    }
                  `}
                >
                  <span className="md:hidden">{audioMode === 'vocal' ? 'VOC' : 'BEAT'}</span>
                  <span className="hidden md:inline">{audioMode}</span>
                </button>
              )}

              <button 
                onClick={onPrev}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all hidden md:block"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onPlayPause}
                className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 rounded-full text-white shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 active:scale-95 flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current pl-0.5" />
                )}
              </button>
              
              <button 
                onClick={onNext}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all hidden md:block"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={onKaraokeMode}
              className="p-1.5 md:p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all flex-shrink-0"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}