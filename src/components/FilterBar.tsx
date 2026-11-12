import React from 'react';
import { Search, X, Star, ArrowUpDown } from 'lucide-react';
import { CEFRLevel, PartOfSpeech, SortOption, WordFilter, WordStatus } from '../types/dictionary.ts';

interface FilterBarProps {
  filter: WordFilter;
  onChangeFilter: (updated: Partial<WordFilter>) => void;
  availableTags: string[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  availableTags,
  totalResults,
}) => {
  const statusOptions: Array<{ label: string; value: WordStatus | 'all' }> = [
    { label: 'Tümü', value: 'all' },
    { label: 'Yeni', value: 'new' },
    { label: 'Öğreniliyor', value: 'learning' },
    { label: 'Öğrenildi', value: 'mastered' },
  ];

  const posOptions: Array<{ label: string; value: PartOfSpeech | 'all' }> = [
    { label: 'Tüm Türler', value: 'all' },
    { label: 'İsim (noun)', value: 'noun' },
    { label: 'Fiil (verb)', value: 'verb' },
    { label: 'Sıfat (adj)', value: 'adjective' },
    { label: 'Zarf (adv)', value: 'adverb' },
    { label: 'Phrasal Verb', value: 'phrasal_verb' },
    { label: 'Deyim (idiom)', value: 'idiom' },
    { label: 'Kalıp İfade', value: 'expression' },
  ];

  const cefrOptions: Array<{ label: string; value: CEFRLevel | 'all' }> = [
    { label: 'Tüm Seviyeler', value: 'all' },
    { label: 'A1 - Başlangıç', value: 'A1' },
    { label: 'A2 - Temel', value: 'A2' },
    { label: 'B1 - Orta Öncesi', value: 'B1' },
    { label: 'B2 - Orta', value: 'B2' },
    { label: 'C1 - İleri', value: 'C1' },
    { label: 'C2 - Yetkin', value: 'C2' },
  ];

  return (
    <div className="space-y-3">
      {/* Top Search & Filter Segmented Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onChangeFilter({ search: e.target.value })}
            placeholder="Kelime, anlam, örnek cümle veya etiket ara..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors"
          />
          {filter.search && (
            <button
              type="button"
              onClick={() => onChangeFilter({ search: '' })}
              aria-label="Aramayı temizle"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-800/80 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
          {statusOptions.map((opt) => {
            const isActive = (filter.status || 'all') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeFilter({ status: opt.value })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Dropdown Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Part of Speech */}
          <select
            value={filter.partOfSpeech || 'all'}
            onChange={(e) => onChangeFilter({ partOfSpeech: e.target.value as any })}
            aria-label="Kelime türü filtresi"
            className="px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
          >
            {posOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* CEFR Level */}
          <select
            value={filter.cefrLevel || 'all'}
            onChange={(e) => onChangeFilter({ cefrLevel: e.target.value as any })}
            aria-label="CEFR seviye filtresi"
            className="px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
          >
            {cefrOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <select
              value={filter.tag || 'all'}
              onChange={(e) => onChangeFilter({ tag: e.target.value })}
              aria-label="Etiket filtresi"
              className="px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
            >
              <option value="all">Tüm Etiketler</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          {/* Favorites Filter */}
          <button
            type="button"
            onClick={() => onChangeFilter({ favoritesOnly: !filter.favoritesOnly })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filter.favoritesOnly
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filter.favoritesOnly ? 'fill-amber-400 text-amber-500' : 'text-stone-400'
              }`}
            />
            <span>Yalnızca Yıldızlılar</span>
          </button>
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-stone-600 dark:text-stone-300 tabular-nums">
            {totalResults} kelime listeleniyor
          </span>

          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <select
              value={filter.sortBy}
              onChange={(e) => onChangeFilter({ sortBy: e.target.value as SortOption })}
              aria-label="Sıralama seçeneği"
              className="px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
            >
              <option value="date_desc">Eklenme Tarihi (En Yeni)</option>
              <option value="date_asc">Eklenme Tarihi (En Eski)</option>
              <option value="alpha_asc">Alfabetik (A → Z)</option>
              <option value="alpha_desc">Alfabetik (Z → A)</option>
              <option value="reviews_asc">Pratik Sayısı (En Az)</option>
              <option value="reviews_desc">Pratik Sayısı (En Çok)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
