import { Music2, Heart, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  language: 'en' | 'vn';
  onLanguageChange: (lang: 'en' | 'vn') => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSetlist: () => void;
  setlistCount: number;
}

export function Header({ 
  language, 
  onLanguageChange, 
  showFavoritesOnly, 
  onToggleFavorites,
  favoritesCount,
  theme,
  onToggleTheme,
  onOpenSetlist,
  setlistCount
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/20">
          <Music2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-white/70 leading-tight">
            VNCOC Songs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
            {language === 'vn' ? 'THÁNH CA' : 'HYMNS COLLECTION'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button 
          onClick={onToggleTheme}
          className="p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all duration-300"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={onToggleFavorites}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 border ${
              showFavoritesOnly 
                ? 'bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[10px] font-bold text-white shadow-sm ring-2 ring-[#121212]">
              {favoritesCount}
            </span>
          )}
        </div>

        {/* Setlist Button */}
        <div className="relative">
          <button 
            onClick={onOpenSetlist}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/></svg>
          </button>
          {setlistCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] sm:text-[10px] font-bold text-white shadow-sm ring-2 ring-[#121212]">
              {setlistCount}
            </span>
          )}
        </div>

        <button 
          onClick={() => onLanguageChange(language === 'vn' ? 'en' : 'vn')}
          className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300 min-w-[36px] sm:min-w-[44px]"
        >
          {language.toUpperCase()}
        </button>
      </div>
    </div>
  );
}