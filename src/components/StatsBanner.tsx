import React from 'react';
import { Cloud, HardDrive, CheckCircle2 } from 'lucide-react';
import { DictionaryStats } from '../types/dictionary.ts';
import { User } from 'firebase/auth';

interface StatsBannerProps {
  stats: DictionaryStats;
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats, currentUser, onOpenAuthModal }) => {
  return (
    <div className="border-b border-stone-200/80 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs text-stone-700 dark:text-stone-300">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                {stats.totalWords}
              </span>
              <span className="text-stone-600 dark:text-stone-300">toplam kelime</span>
            </div>

            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline" aria-hidden="true">
              ·
            </span>

            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {stats.masteredCount}
              </span>
              <span className="text-stone-600 dark:text-stone-300">öğrenildi</span>
            </div>

            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline" aria-hidden="true">
              ·
            </span>

            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                {stats.learningCount}
              </span>
              <span className="text-stone-600 dark:text-stone-300">öğreniliyor</span>
            </div>

            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline" aria-hidden="true">
              ·
            </span>

            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-xl font-bold text-stone-700 dark:text-stone-300 tabular-nums">
                {stats.totalExamples}
              </span>
              <span className="text-stone-600 dark:text-stone-300">örnek cümle</span>
            </div>
          </div>

          {/* Sync indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {currentUser ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Firebase Firestore bulut veritabanı aktif ({currentUser.email})</span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Yerel hafıza modu</span>
                </span>
                <span>·</span>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="text-amber-800 dark:text-amber-300 hover:underline font-medium cursor-pointer"
                >
                  Buluta bağlamak için giriş yapın
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
