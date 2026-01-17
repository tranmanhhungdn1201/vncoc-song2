import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  language: 'en' | 'vn';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [{
  id: 'traditional',
  labelVn: 'Thánh Ca',
  labelEn: 'Hymn',
  color: 'blue'
}, {
  id: 'contemporary',
  labelVn: 'Đương Đại',
  labelEn: 'Contemporary',
  color: 'purple'
}, {
  id: 'hymn',
  labelVn: 'Thánh Thi',
  labelEn: 'Psalm',
  color: 'green'
}];

export function SearchBar({
  language,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: SearchBarProps) {
  const placeholder = language === 'vn' ? 'Tìm tên bài hát, lời bài hát...' : 'Search by title, lyrics...';

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-zinc-200 dark:bg-white/5 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:bg-white/10 dark:focus:border-white/20 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all font-medium shadow-sm dark:shadow-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 p-1 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(isSelected ? null : category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border
                ${isSelected 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/25 scale-[1.02]' 
                  : 'bg-white border-zinc-200 dark:bg-white/5 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 shadow-sm dark:shadow-none'
                }
              `}
            >
              {language === 'vn' ? category.labelVn : category.labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
}