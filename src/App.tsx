import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WordFilter, WordItem, WordStatus } from './types/dictionary.ts';
import { INITIAL_WORDS } from './data/initialWords.ts';
import { calculateStats, filterAndSearchWords } from './utils/dictionary.ts';
import { Header } from './components/Header.tsx';
import { StatsBanner } from './components/StatsBanner.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { WordCard } from './components/WordCard.tsx';
import { WordModal } from './components/WordModal.tsx';
import { PracticeModal } from './components/PracticeModal.tsx';
import { GitHubModal } from './components/GitHubModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BookOpen, Plus, Sparkles, Cloud, CloudUpload, Check } from 'lucide-react';
import {
  auth,
  onAuthChange,
  logoutUser,
  subscribeToUserWords,
  saveUserWord,
  deleteUserWord,
  batchSyncWordsToFirestore,
} from './services/firebase.ts';
import { User } from 'firebase/auth';

const STORAGE_KEY = 'lexinote_words_v1';
const THEME_KEY = 'lexinote_theme_dark';

export default function App() {
  // 1. Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // 2. Words state
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_WORDS;
  });

  // Track if words came from Firestore or local
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  // 3. Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'false');
    }
  }, [isDarkMode]);

  // 4. Firebase Auth listener & Firestore live sync
  useEffect(() => {
    const unsubscribeAuth = onAuthChange((user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribeAuth();
  }, []);

  // When user signs in: attach real-time Firestore listener
  useEffect(() => {
    if (!currentUser) {
      // If logged out, save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
      } catch (err) {
        console.error('LocalStorage error:', err);
      }
      return;
    }

    setIsSyncing(true);
    let isFirstLoad = true;

    const unsubscribeFirestore = subscribeToUserWords(
      currentUser.uid,
      (cloudWords) => {
        setIsSyncing(false);
        if (isFirstLoad) {
          isFirstLoad = false;
          if (cloudWords.length === 0) {
            // First time this user logs in: automatically migrate their current local words to cloud!
            const wordsToMigrate = wordsRef.current.map((w) => ({
              ...w,
              userId: currentUser.uid,
            }));
            batchSyncWordsToFirestore(currentUser.uid, wordsToMigrate)
              .then(() => {
                showToast('Mevcut kelimeleriniz Firebase Firestore bulut hesabınıza aktarıldı!');
              })
              .catch((err) => console.error('Cloud sync error:', err));
            return;
          }
        }
        setWords(cloudWords);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setIsSyncing(false);
      }
    );

    return () => {
      unsubscribeFirestore();
    };
  }, [currentUser]);

  // Keep localStorage as an offline mirror
  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
      } catch (err) {
        console.error('LocalStorage write error:', err);
      }
    }
  }, [words, currentUser]);

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 4000);
  };

  // 5. Filter State
  const [filters, setFilters] = useState<WordFilter>({
    search: '',
    status: 'all',
    partOfSpeech: 'all',
    cefrLevel: 'all',
    tag: 'all',
    favoritesOnly: false,
    sortBy: 'date_desc',
  });

  // 6. Modals State
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Computed data
  const stats = useMemo(() => calculateStats(words), [words]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => w.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [words]);

  const filteredWords = useMemo(
    () => filterAndSearchWords(words, filters),
    [words, filters]
  );

  // CRUD Handlers with Firebase integration
  const handleToggleFavorite = async (id: string) => {
    const target = words.find((w) => w.id === id);
    if (!target) return;
    const updated: WordItem = {
      ...target,
      favorite: !target.favorite,
      updatedAt: new Date().toISOString(),
    };

    setWords((prev) => prev.map((w) => (w.id === id ? updated : w)));

    if (currentUser) {
      try {
        await saveUserWord(currentUser.uid, updated);
      } catch (err) {
        console.error('Failed to update favorite in Firestore:', err);
      }
    }
  };

  const handleChangeStatus = async (id: string, newStatus: WordStatus) => {
    const target = words.find((w) => w.id === id);
    if (!target) return;
    const updated: WordItem = {
      ...target,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    setWords((prev) => prev.map((w) => (w.id === id ? updated : w)));

    if (currentUser) {
      try {
        await saveUserWord(currentUser.uid, updated);
      } catch (err) {
        console.error('Failed to update status in Firestore:', err);
      }
    }
  };

  const handleDeleteWord = async (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));

    if (currentUser) {
      try {
        await deleteUserWord(currentUser.uid, id);
        showToast('Kelime buluttan silindi.');
      } catch (err) {
        console.error('Failed to delete word in Firestore:', err);
      }
    }
  };

  const handleSaveWord = async (
    wordData: Omit<WordItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    let wordToSave: WordItem;

    if (wordData.id) {
      // Edit existing
      const existing = words.find((w) => w.id === wordData.id);
      wordToSave = {
        ...existing,
        ...wordData,
        id: wordData.id,
        reviewCount: existing?.reviewCount || 0,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        userId: currentUser?.uid,
      };
      setWords((prev) => prev.map((w) => (w.id === wordData.id ? wordToSave : w)));
    } else {
      // Create new
      const newId = `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      wordToSave = {
        ...wordData,
        id: newId,
        reviewCount: 0,
        createdAt: now,
        updatedAt: now,
        userId: currentUser?.uid,
      };
      setWords((prev) => [wordToSave, ...prev]);
    }

    if (currentUser) {
      try {
        await saveUserWord(currentUser.uid, wordToSave);
        showToast(`"${wordToSave.word}" Firebase Firestore'a kaydedildi.`);
      } catch (err) {
        console.error('Failed to save word to Firestore:', err);
      }
    }
  };

  const handleUpdateWordReview = async (id: string, newStatus: WordStatus) => {
    const now = new Date().toISOString();
    const target = words.find((w) => w.id === id);
    if (!target) return;

    const updated: WordItem = {
      ...target,
      status: newStatus,
      reviewCount: (target.reviewCount || 0) + 1,
      lastReviewedAt: now,
      updatedAt: now,
    };

    setWords((prev) => prev.map((w) => (w.id === id ? updated : w)));

    if (currentUser) {
      try {
        await saveUserWord(currentUser.uid, updated);
      } catch (err) {
        console.error('Failed to update review in Firestore:', err);
      }
    }
  };

  const handleResetToDefaults = async () => {
    setWords(INITIAL_WORDS);
    if (currentUser) {
      try {
        const wordsToSync = INITIAL_WORDS.map((w) => ({
          ...w,
          userId: currentUser.uid,
        }));
        await batchSyncWordsToFirestore(currentUser.uid, wordsToSync);
        showToast('Varsayılan kelimeler bulut hesabınıza yüklendi.');
      } catch (err) {
        console.error('Reset cloud error:', err);
      }
    }
  };

  const handleImportWords = async (newWords: WordItem[]) => {
    setWords(newWords);
    if (currentUser) {
      try {
        const wordsToSync = newWords.map((w) => ({
          ...w,
          userId: currentUser.uid,
        }));
        await batchSyncWordsToFirestore(currentUser.uid, wordsToSync);
        showToast(`${newWords.length} kelime Firebase bulut hesabınıza aktarıldı!`);
      } catch (err) {
        console.error('Import cloud error:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Çıkış yapıldı. Yerel hafıza moduna geçildi.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors selection:bg-amber-200 selection:text-stone-900">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Header
        onOpenAddModal={() => {
          setEditingWord(null);
          setIsWordModalOpen(true);
        }}
        onOpenPracticeModal={() => setIsPracticeModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        wordsCount={words.length}
      />

      {/* Stats Summary Bar with Cloud indicator */}
      <StatsBanner
        stats={stats}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Filter & Search Bar */}
        <FilterBar
          filter={filters}
          onChangeFilter={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          availableTags={availableTags}
          totalResults={filteredWords.length}
        />

        {/* Word Grid / Cards List */}
        {filteredWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onEdit={(w) => {
                  setEditingWord(w);
                  setIsWordModalOpen(true);
                }}
                onDelete={handleDeleteWord}
                onToggleFavorite={handleToggleFavorite}
                onChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100">
                {filters.search || filters.status !== 'all' || filters.partOfSpeech !== 'all'
                  ? 'Filtrelere uygun kelime bulunamadı'
                  : 'Sözlüğünüz henüz boş'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                {filters.search || filters.status !== 'all'
                  ? 'Arama kriterlerinizi değiştirmeyi veya filtreleri temizlemeyi deneyebilirsiniz.'
                  : 'Öğrendiğiniz ilk kelimeyi ve örnek cümlesini ekleyerek sözlüğünüzü oluşturmaya başlayın.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              {filters.search || filters.status !== 'all' || filters.partOfSpeech !== 'all' ? (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      search: '',
                      status: 'all',
                      partOfSpeech: 'all',
                      cefrLevel: 'all',
                      tag: 'all',
                      favoritesOnly: false,
                      sortBy: 'date_desc',
                    })
                  }
                  className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Filtreleri Temizle
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingWord(null);
                    setIsWordModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  İlk Kelimeyi Ekle
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Refined Minimalist Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 bg-white/40 dark:bg-stone-900/40 py-6 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-stone-800 dark:text-stone-200">
              LexiNote
            </span>
            <span>·</span>
            <span>Minimalist İngilizce Kelime Defteri</span>
            {currentUser && (
              <>
                <span>·</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Firebase Bulut Aktif
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-stone-600 dark:text-stone-300">
            {!currentUser && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer font-medium"
              >
                Giriş Yap / Kayıt Ol
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer"
            >
              GitHub Pages Kurulumu
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsPracticeModalOpen(true)}
              className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer"
            >
              Pratik Yap
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Google & Email/Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          showToast('Başarıyla giriş yapıldı!');
        }}
      />

      {/* Add / Edit Word Modal */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => {
          setIsWordModalOpen(false);
          setEditingWord(null);
        }}
        onSave={handleSaveWord}
        initialWord={editingWord}
      />

      {/* Practice / Flashcard Modal */}
      <PracticeModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        words={words}
        onUpdateWordReview={handleUpdateWordReview}
      />

      {/* GitHub Deployment & Export Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        words={words}
        onImportWords={handleImportWords}
        onResetToDefaults={handleResetToDefaults}
      />
    </div>
  );
}
