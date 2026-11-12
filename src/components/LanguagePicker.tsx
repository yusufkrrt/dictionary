import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { DictionaryLanguage } from '../types/dictionary.ts';
import { LANGUAGES, LANGUAGE_ORDER } from '../data/languages.ts';

interface LanguageBadgeProps {
  language: DictionaryLanguage;
  size?: 'sm' | 'lg';
}

const BADGE_COLORS: Record<DictionaryLanguage, string> = {
  en: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  de: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  ru: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
};

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({ language, size = 'sm' }) => (
  <span
    className={`inline-flex items-center justify-center font-mono font-semibold rounded-md shrink-0 ${BADGE_COLORS[language]} ${
      size === 'lg' ? 'w-12 h-12 text-base rounded-xl' : 'px-1.5 py-0.5 text-[10px]'
    }`}
  >
    {language.toUpperCase()}
  </span>
);

interface LanguagePickerProps {
  wordCounts: Record<DictionaryLanguage, number>;
  onSelect: (language: DictionaryLanguage) => void;
}

/** First screen: the user chooses which dictionary to open. */
export const LanguagePicker: React.FC<LanguagePickerProps> = ({ wordCounts, onSelect }) => (
  <div className="flex-1 flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-600/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100">Hangi sözlüğü açalım?</h1>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          Her dilin ayrı bir sözlüğü var. Eklediğiniz kelimeler seçtiğiniz sözlüğe kaydedilir; dili istediğiniz zaman üst menüden
          değiştirebilirsiniz.
        </p>
      </div>

      <div className="space-y-2.5">
        {LANGUAGE_ORDER.map((code) => {
          const lang = LANGUAGES[code];
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelect(code)}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 rounded-2xl text-left transition-colors cursor-pointer group"
            >
              <LanguageBadge language={code} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 dark:text-stone-100">{lang.name} Sözlük</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {lang.nativeName} · {wordCounts[code]} kelime
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
            </button>
          );
        })}
      </div>
    </div>
  </div>
);
