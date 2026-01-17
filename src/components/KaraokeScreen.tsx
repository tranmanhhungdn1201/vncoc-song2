import React, { useEffect, useState } from 'react';
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Type, Settings, Volume2, VolumeX, Share2 } from 'lucide-react';
import { Song } from '../types';

interface KaraokeScreenProps {
  song: Song;
  language: 'en' | 'vn';
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  currentTime: number;
  onTimeChange: (time: number | ((prev: number) => number)) => void;
  duration?: number;
  audioMode?: 'vocal' | 'beat';
  onToggleAudioMode?: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onShare: () => void;
}

export function KaraokeScreen({
  song,
  language,
  isPlaying,
  onPlayPause,
  onClose,
  currentTime,
  onTimeChange,
  duration = 205, // fallback
  audioMode,
  onToggleAudioMode,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  onShare
}: KaraokeScreenProps) {
  const [displayMode, setDisplayMode] = useState<'vn' | 'en' | 'both'>('vn');
  const [showChords, setShowChords] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [showSettings, setShowSettings] = useState(false); // Mobile settings toggle
  
  // Auto-scroll state
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1); // 0.1 to 5
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(false);
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    
    // Only scroll if active AND audio is playing
     if (isAutoScrollActive && isPlaying && lyricsContainerRef.current) {
        // Use a ref to accumulate fractional pixels
        // using a property on the ref object to persist across frames
        const accumulatorRef = { current: 0 };
        
        const scroll = () => {
         if (lyricsContainerRef.current) {
           // Add fractional amount to accumulator
           const delta = autoScrollSpeed * 0.5;
           accumulatorRef.current += delta;
           
           if (accumulatorRef.current >= 1) {
             const wholePixels = Math.floor(accumulatorRef.current);
             lyricsContainerRef.current.scrollTop += wholePixels;
             accumulatorRef.current -= wholePixels;
           }
         }
         animationFrameId = requestAnimationFrame(scroll);
       };
       animationFrameId = requestAnimationFrame(scroll);
     }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoScrollActive, isPlaying, autoScrollSpeed]);

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
  
  // ... renderLyrics logic remains same ...
  const renderLyrics = () => {
    const lyrics = displayMode === 'en' ? song.lyricsEn : song.lyricsVn;
    const chords = displayMode === 'en' ? song.chordsEn || [] : song.chordsVn || [];

    if (displayMode === 'both') {
      return (
        <div className="space-y-8">
          {song.lyricsVn.map((lineVn, index) => (
            <div key={index} className="space-y-2">
              {showChords && song.chordsVn?.[index] && (
                <p className="text-center font-mono text-purple-600 dark:text-purple-400 font-bold opacity-80" style={{
                  fontSize: `${fontSize * 0.7}%`
                }}>
                  {song.chordsVn[index]}
                </p>
              )}
              <p className="text-center leading-relaxed text-zinc-900 dark:text-white font-bold tracking-wide" style={{
                fontSize: `${fontSize}%`
              }}>
                {lineVn || '\u00A0'}
              </p>
              <p className="text-center leading-relaxed text-zinc-500 dark:text-zinc-400 italic font-medium" style={{
                fontSize: `${fontSize * 0.85}%`
              }}>
                {song.lyricsEn[index] || '\u00A0'}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {lyrics.map((line, index) => (
          <div key={index} className="space-y-2">
            {showChords && chords[index] && (
              <p className="text-center font-mono text-purple-600 dark:text-purple-400 font-bold opacity-80" style={{
                fontSize: `${fontSize * 0.7}%`
              }}>
                {chords[index]}
              </p>
            )}
            <p className={`text-center leading-relaxed text-zinc-900 dark:text-white font-bold tracking-wide ${displayMode === 'en' ? 'italic' : ''}`} style={{
              fontSize: `${fontSize}%`
            }}>
              {line || '\u00A0'}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-[100] flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between p-4 glass-panel border-b border-zinc-200 dark:border-white/5">
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 mx-4">
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
            <span className="text-blue-600 dark:text-blue-400 mr-2">#{song.index}</span>
            {language === 'vn' ? song.titleVn : song.titleEn}
          </h2>
        </div>
        <div className="flex gap-2">
           {/* Audio Mode Toggle in Header if available */}
           {(song.beatUrl && song.vocalUrl) && (
             <button 
              onClick={onToggleAudioMode}
              className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-white/10 text-blue-600 dark:text-white hover:bg-blue-200 dark:hover:bg-white/20 transition-all uppercase"
            >
              {audioMode}
            </button>
           )}
           {/* Temporarily hidden as per request */}
           {/* <button 
             onClick={() => setShowChords(!showChords)} 
             className={`p-2 rounded-full transition-all ${showChords ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400'}`}
           >
             <Type className="w-5 h-5" />
           </button> */}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-30 glass-panel border-b border-zinc-200 dark:border-white/5 px-4 py-3">
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {language === 'vn' ? 'KÍCH THƯỚC' : 'SIZE'}
            </label>
            <input 
              type="range" 
              min="80" 
              max="150" 
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))} 
              className="w-24 h-1 bg-zinc-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8">{fontSize}%</span>
          </div>

           {/* Auto Scroll Controls */}
           <div className="flex items-center gap-2 border-l border-zinc-300 dark:border-white/10 pl-3">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
              {language === 'vn' ? 'TỰ CUỘN' : 'SCROLL'}
            </label>
             <button 
                onClick={() => setIsAutoScrollActive(!isAutoScrollActive)}
                className={`p-1 rounded-md transition-all ${isAutoScrollActive ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-white/10' : 'text-zinc-400'}`}
             >
                {isAutoScrollActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
             </button>
             <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={autoScrollSpeed * 10} 
              onChange={(e) => setAutoScrollSpeed(Number(e.target.value) / 10)} 
              className="w-24 h-1 bg-zinc-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
          </div>
          
          <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-lg">
            {['vn', 'en', 'both'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setDisplayMode(mode as any)} 
                className={`
                  px-3 py-1 rounded-md text-xs font-bold transition-all uppercase
                  ${displayMode === mode 
                    ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm' 
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }
                `}
              >
                {mode}
              </button>
            ))}
          </div>

        </div>

        {/* Mobile View Header */}
        <div className="flex md:hidden items-center justify-between gap-4">
            <div className="flex items-center bg-white/50 dark:bg-black/20 p-1 rounded-xl border border-zinc-200/50 dark:border-white/5 backdrop-blur-sm shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10">
            {['vn', 'en', 'both'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setDisplayMode(mode as any)} 
                className={`
                  relative px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 uppercase tracking-wider
                  ${displayMode === mode 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-black/5 scale-100' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-white/5'
                  }
                `}
              >
                {mode}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 border backdrop-blur-sm
              ${showSettings 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20' 
                : 'bg-white/50 dark:bg-black/20 border-zinc-200/50 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white shadow-sm'
              }`}
          >
            <Settings className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showSettings ? 'animate-spin-slow' : ''}`} />
            {language === 'vn' ? 'CÀI ĐẶT' : 'SETTINGS'}
          </button>
        </div>

        {/* Mobile Settings Dropdown */}
        {showSettings && (
          <div className="md:hidden absolute left-0 right-0 top-full mt-1 mx-4 p-4 rounded-xl glass-panel border border-zinc-200 dark:border-white/10 shadow-xl z-50 animate-in slide-in-from-top-2 flex flex-col gap-4 bg-white dark:bg-zinc-900 shadow-2xl">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {language === 'vn' ? 'CỠ CHỮ' : 'FONT SIZE'}
                </label>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{fontSize}%</span>
              </div>
              <input 
                type="range" 
                min="80" 
                max="150" 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))} 
                className="w-full h-1.5 bg-zinc-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all touch-action-none"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{language === 'vn' ? 'TỰ ĐỘNG CUỘN' : 'AUTO SCROLL'}</label>
                <button 
                  onClick={() => setIsAutoScrollActive(!isAutoScrollActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${isAutoScrollActive ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-white/10 text-zinc-500'}`}
                >
                  {isAutoScrollActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  {isAutoScrollActive ? (language === 'vn' ? 'TẮT' : 'OFF') : (language === 'vn' ? 'BẬT' : 'ON')}
                </button>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1"
                value={autoScrollSpeed * 10} 
                onChange={(e) => setAutoScrollSpeed(Number(e.target.value) / 10)} 
                className="w-full h-1.5 bg-zinc-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all touch-action-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lyrics */}
      <div 
        ref={lyricsContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-8 scrollbar-hide"
      >
        <div className="max-w-3xl mx-auto min-h-full flex items-center justify-center py-10">
          {renderLyrics()}
        </div>
      </div>

      {/* Player Controls */}
      <div className="relative z-10 glass-panel border-t border-zinc-200 dark:border-white/5 p-4 pb-6 md:pb-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress Bar */}
          <div 
            className="h-1.5 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 w-12">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={onShare}
                className="p-2 rounded-full transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button 
                onClick={onPrev}
                className="p-2 rounded-full transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={onPlayPause} 
                className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white hover:scale-105 active:scale-95 rounded-full transition-all shadow-xl shadow-blue-500/30"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current pl-1" />
                )}
              </button>
              
              <button 
                onClick={onNext}
                className="p-2 rounded-full transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <div className="relative group hidden md:flex items-center">
                 <button 
                    onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                    className="p-2 rounded-full transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
                 >
                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                 </button>
                 {/* Popup Slider on Hover/Tap */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="h-24 w-1.5 -rotate-180 appearance-none bg-zinc-200 dark:bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' }}
                    />
                 </div>
              </div>
            </div>
            
            <span className="text-xs font-medium text-zinc-500 w-12 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}