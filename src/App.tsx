import React, { useState, useEffect, useMemo } from 'react';
import { DictionaryLanguage, WordFilter, WordItem, WordStatus } from './types/dictionary.ts';
import { ALL_SAMPLE_WORDS, getSampleWords } from './data/initialWords.ts';
import { LANGUAGES, isDictionaryLanguage } from './data/languages.ts';
import { calculateStats, filterAndSearchWords } from './utils/dictionary.ts';
import { Header } from './components/Header.tsx';
import { StatsBanner } from './components/StatsBanner.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { WordCard } from './components/WordCard.tsx';
import { WordModal } from './components/WordModal.tsx';
import { PracticeModal } from './components/PracticeModal.tsx';
import { GitHubModal } from './components/GitHubModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LanguagePicker } from './components/LanguagePicker.tsx';
import { BookOpen, Plus, Cloud, Check, ListPlus } from 'lucide-react';
import {
  onAuthChange,
  logoutUser,
  subscribeToUserWords,
  saveUserWord,
  deleteUserWord,
  batchSyncWordsToFirestore,
  batchDeleteWordsFromFirestore,
} from './services/firebase.ts';
import { User } from 'firebase/auth';

/** Guest words used to be stored here; guests are read-only now, so the key is only cleaned up. */
const LEGACY_GUEST_STORAGE_KEY = 'lexinote_words_v1';
const LANGUAGE_KEY = 'lexinote_language';
const THEME_KEY = 'lexinote_theme_dark';

const DEFAULT_FILTERS: WordFilter = {
  search: '',
  status: 'all',
  partOfSpeech: 'all',
  cefrLevel: 'all',
  tag: 'all',
  favoritesOnly: false,
  sortBy: 'date_desc',
};

function loadLanguage(): DictionaryLanguage | null {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return isDictionaryLanguage(saved) ? saved : null;
  } catch {
    return null;
  }
}

function createWordId(): string {
  return `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export default function App() {
  // 1. Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 2. Selected dictionary
  const [language, setLanguage] = useState<DictionaryLanguage | null>(loadLanguage);

  // 3. Words: guests see the fixed starter words (read-only); each signed-in user has their own words
  //    in Firestore. Nothing a guest does is stored, so it can never reach anyone else.
  const [cloudWords, setCloudWords] = useState<WordItem[]>([]);
  const allWords = currentUser ? cloudWords : ALL_SAMPLE_WORDS;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // 4. Dark mode state
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
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem(THEME_KEY, String(isDarkMode));
    } catch {
      // Theme preference is a convenience only
    }
  }, [isDarkMode]);

  // 5. Firebase Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthChange((user) => setCurrentUser(user));
    return () => unsubscribeAuth();
  }, []);

  // 6. Signed in: live Firestore sync. Signed out: drop the previous account's words from memory.
  useEffect(() => {
    if (!currentUser) {
      setCloudWords([]);
      return;
    }

    const userId = currentUser.uid;
    setIsSyncing(true);
    let isFirstLoad = true;

    const unsubscribeFirestore = subscribeToUserWords(
      userId,
      (words) => {
        setIsSyncing(false);
        if (isFirstLoad) {
          isFirstLoad = false;
          if (words.length === 0) {
            // First sign-in of this account: create its dictionaries from the starter words
            const starterWords = ALL_SAMPLE_WORDS.map((w) => ({ ...w, userId }));
            setCloudWords(starterWords);
            batchSyncWordsToFirestore(userId, starterWords)
              .then(() => showToast("Sözlüklerin 30'ar temel kelimeyle oluşturuldu."))
              .catch((err) => console.error('Cloud sync error:', err));
            return;
          }
        }
        setCloudWords(words);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setIsSyncing(false);
      }
    );

    return () => unsubscribeFirestore();
  }, [currentUser]);

  // Remove words stored by older guest-mode versions
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_GUEST_STORAGE_KEY);
    } catch {
      // Storage unavailable: nothing to clean up
    }
  }, []);

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 4000);
  };

  // 7. Filter & modal state
  const [filters, setFilters] = useState<WordFilter>(DEFAULT_FILTERS);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleChangeLanguage = (next: DictionaryLanguage) => {
    setLanguage(next);
    setFilters(DEFAULT_FILTERS);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      // Language choice is a convenience only
    }
  };

  // Computed data: only the selected dictionary is ever shown
  const words = useMemo(
    () => (language ? allWords.filter((w) => w.language === language) : []),
    [allWords, language]
  );

  const wordCounts = useMemo(() => {
    const counts: Record<DictionaryLanguage, number> = { en: 0, de: 0, ru: 0 };
    allWords.forEach((w) => {
      counts[w.language] += 1;
    });
    return counts;
  }, [allWords]);

  const stats = useMemo(() => calculateStats(words), [words]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => w.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [words]);

  const filteredWords = useMemo(() => filterAndSearchWords(words, filters), [words, filters]);

  /** Returns the signed-in user, or asks the guest to sign in and returns null. */
  const requireAccount = (): User | null => {
    if (currentUser) return currentUser;
    showToast('Kendi sözlüğünü oluşturmak ve düzenlemek için giriş yap.');
    setIsAuthModalOpen(true);
    return null;
  };

  // CRUD handlers: signed-in users only
  const updateWord = async (id: string, changes: (word: WordItem) => Partial<WordItem>, errorLabel: string) => {
    const user = requireAccount();
    if (!user) return;
    const target = cloudWords.find((w) => w.id === id);
    if (!target) return;
    const updated: WordItem = { ...target, ...changes(target), updatedAt: new Date().toISOString() };
    setCloudWords((prev) => prev.map((w) => (w.id === id ? updated : w)));
    try {
      await saveUserWord(user.uid, updated);
    } catch (err) {
      console.error(`Failed to ${errorLabel} in Firestore:`, err);
    }
  };

  const handleToggleFavorite = (id: string) =>
    updateWord(id, (w) => ({ favorite: !w.favorite }), 'update favorite');

  const handleChangeStatus = (id: string, newStatus: WordStatus) =>
    updateWord(id, () => ({ status: newStatus }), 'update status');

  const handleUpdateWordReview = async (id: string, newStatus: WordStatus) => {
    // Guests can practise, but their progress is not saved
    if (!currentUser) return;
    await updateWord(
      id,
      (w) => ({
        status: newStatus,
        reviewCount: (w.reviewCount || 0) + 1,
        lastReviewedAt: new Date().toISOString(),
      }),
      'update review'
    );
  };

  const handleDeleteWord = async (id: string) => {
    const user = requireAccount();
    if (!user) return;
    setCloudWords((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteUserWord(user.uid, id);
      showToast('Kelime silindi.');
    } catch (err) {
      console.error('Failed to delete word in Firestore:', err);
    }
  };

  const handleSaveWord = async (
    wordData: Omit<WordItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'> & { id?: string }
  ) => {
    const user = requireAccount();
    if (!user) return;
    const now = new Date().toISOString();
    const existing = wordData.id ? cloudWords.find((w) => w.id === wordData.id) : undefined;

    const wordToSave: WordItem = {
      ...existing,
      ...wordData,
      id: existing?.id ?? createWordId(),
      reviewCount: existing?.reviewCount ?? 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      userId: user.uid,
    };

    setCloudWords((prev) =>
      existing ? prev.map((w) => (w.id === wordToSave.id ? wordToSave : w)) : [wordToSave, ...prev]
    );

    try {
      await saveUserWord(user.uid, wordToSave);
      showToast(`"${wordToSave.word}" kaydedildi.`);
    } catch (err) {
      console.error('Failed to save word to Firestore:', err);
    }
  };

  /** Replaces the selected dictionary with the starter words. Other dictionaries are untouched. */
  const handleResetToDefaults = async () => {
    const user = requireAccount();
    if (!user || !language) return;
    const samples = getSampleWords(language).map((w) => ({ ...w, userId: user.uid }));
    const sampleIds = new Set(samples.map((w) => w.id));
    const removedIds = words.filter((w) => !sampleIds.has(w.id)).map((w) => w.id);

    setCloudWords((prev) => [...samples, ...prev.filter((w) => w.language !== language)]);

    try {
      await batchDeleteWordsFromFirestore(user.uid, removedIds);
      await batchSyncWordsToFirestore(user.uid, samples);
      showToast(`${LANGUAGES[language].name} başlangıç kelimeleri yüklendi.`);
    } catch (err) {
      console.error('Reset cloud error:', err);
    }
  };

  /** Merges imported words (already assigned to the selected language) into the selected dictionary. */
  const handleImportWords = async (importedWords: WordItem[]) => {
    const user = requireAccount();
    if (!user || !language) return;
    // An id that belongs to another dictionary must not move that word here
    const otherDictionaryIds = new Set(cloudWords.filter((w) => w.language !== language).map((w) => w.id));
    const prepared = importedWords.map((w) => ({
      ...w,
      id: otherDictionaryIds.has(w.id) ? createWordId() : w.id,
      userId: user.uid,
    }));
    const importedIds = new Set(prepared.map((w) => w.id));

    setCloudWords((prev) => [...prepared, ...prev.filter((w) => !importedIds.has(w.id))]);

    try {
      await batchSyncWordsToFirestore(user.uid, prepared);
      showToast(`${prepared.length} kelime hesabınıza aktarıldı.`);
    } catch (err) {
      console.error('Import cloud error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Çıkış yapıldı.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const openAddModal = () => {
    if (!requireAccount()) return;
    setEditingWord(null);
    setIsWordModalOpen(true);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.partOfSpeech !== 'all' ||
    filters.cefrLevel !== 'all' ||
    filters.tag !== 'all' ||
    !!filters.favoritesOnly;

  const lang = language ? LANGUAGES[language] : null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors selection:bg-amber-200 selection:text-stone-900">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{syncToast}</span>
        </div>
      )}

      <Header
        onOpenAddModal={openAddModal}
        onOpenPracticeModal={() => setIsPracticeModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        wordsCount={words.length}
        language={language}
        onChangeLanguage={handleChangeLanguage}
      />

      {!language || !lang ? (
        <LanguagePicker wordCounts={wordCounts} onSelect={handleChangeLanguage} />
      ) : (
        <>
          <StatsBanner stats={stats} currentUser={currentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            <FilterBar
              filter={filters}
              onChangeFilter={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
              availableTags={availableTags}
              totalResults={filteredWords.length}
            />

            {filteredWords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWords.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    onEdit={(w) => {
                      if (!requireAccount()) return;
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
              <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100">
                    {hasActiveFilters
                      ? 'Filtrelere uygun kelime bulunamadı'
                      : isSyncing
                        ? 'Sözlük yükleniyor…'
                        : `${lang.name} sözlüğünüz henüz boş`}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                    {hasActiveFilters
                      ? 'Arama kriterlerinizi değiştirmeyi veya filtreleri temizlemeyi deneyebilirsiniz.'
                      : `İlk kelimenizi ekleyin ya da ${lang.name.toLowerCase()} dilinin en sık kullanılan 30 kelimesiyle başlayın.`}
                  </p>
                </div>

                {!isSyncing && (
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Filtreleri Temizle
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          İlk Kelimeyi Ekle
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToDefaults}
                          className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ListPlus className="w-4 h-4" />
                          30 Temel Kelimeyi Yükle
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 bg-white/40 dark:bg-stone-900/40 py-6 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-stone-800 dark:text-stone-200">LexiNote</span>
            <span>·</span>
            <span>İngilizce · Almanca · Rusça Kelime Defteri</span>
            {currentUser && (
              <>
                <span>·</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Bulut Senkronizasyonu Aktif
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
            {language && (
              <>
                <button
                  type="button"
                  onClick={() => setIsGitHubModalOpen(true)}
                  className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer"
                >
                  Yedekle & Dışa Aktar
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setIsPracticeModalOpen(true)}
                  disabled={words.length === 0}
                  className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pratik Yap
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => showToast('Başarıyla giriş yapıldı!')}
      />

      {language && (
        <>
          <WordModal
            isOpen={isWordModalOpen}
            onClose={() => {
              setIsWordModalOpen(false);
              setEditingWord(null);
            }}
            onSave={handleSaveWord}
            initialWord={editingWord}
            language={editingWord?.language ?? language}
          />

          <PracticeModal
            isOpen={isPracticeModalOpen}
            onClose={() => setIsPracticeModalOpen(false)}
            words={words}
            onUpdateWordReview={handleUpdateWordReview}
          />

          <GitHubModal
            isOpen={isGitHubModalOpen}
            onClose={() => setIsGitHubModalOpen(false)}
            words={words}
            onImportWords={handleImportWords}
            onResetToDefaults={handleResetToDefaults}
            language={language}
            readOnly={!currentUser}
          />
        </>
      )}
    </div>
  );
}
