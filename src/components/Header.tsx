import React from 'react';
import { BookOpen, Plus, Sparkles, Github, Moon, Sun, User, LogOut, Cloud } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenPracticeModal: () => void;
  onOpenGitHubModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  currentUser: FirebaseUser | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  wordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenPracticeModal,
  onOpenGitHubModal,
  onOpenAuthModal,
  onLogout,
  currentUser,
  isDarkMode,
  onToggleDarkMode,
  wordsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-600/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-semibold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                LexiNote
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-stone-600 dark:text-stone-300">
                Kişisel Sözlük
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark Mode */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Açık temaya geç' : 'Karanlık temaya geç'}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title={isDarkMode ? 'Açık Tema' : 'Karanlık Tema'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* GitHub & Backup */}
          <button
            type="button"
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="GitHub Pages ve Dışa Aktar"
          >
            <Github className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            <span className="hidden md:inline">GitHub & Yedek</span>
          </button>

          {/* Practice */}
          <button
            type="button"
            onClick={onOpenPracticeModal}
            disabled={wordsCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 border border-amber-300/60 dark:border-amber-800/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Kelime Pratiği & Flashcards"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Pratik Yap</span>
          </button>

          {/* Add Word */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Kelime Ekle</span>
          </button>

          {/* User Account / Auth Section */}
          <div className="pl-1 sm:pl-2 border-l border-stone-200 dark:border-stone-800 flex items-center">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-800 dark:text-stone-200 max-w-[130px] truncate"
                  title={`${currentUser.displayName || currentUser.email} (Bulut Veritabanı Aktif)`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profil"
                      className="w-7 h-7 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs uppercase">
                      {(currentUser.displayName || currentUser.email || 'U')[0]}
                    </div>
                  )}
                  <span className="hidden lg:inline truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:inline" />
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Çıkış yap"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                title="Google veya E-posta ile Giriş Yap"
              >
                <User className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                <span>Giriş Yap</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
