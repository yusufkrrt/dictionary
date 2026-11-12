import React, { useState, useEffect } from 'react';
import { X, Volume2, RotateCcw, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { WordItem, WordStatus } from '../types/dictionary.ts';
import { getPartOfSpeechLabel, playPronunciation } from '../utils/dictionary.ts';

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
  onUpdateWordReview: (id: string, newStatus: WordStatus) => void;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  isOpen,
  onClose,
  words,
  onUpdateWordReview,
}) => {
  const [deck, setDeck] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ mastered: 0, reviewAgain: 0 });
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'favorites'>('all');

  // Initialize practice session
  useEffect(() => {
    if (isOpen && words.length > 0) {
      let candidateWords = [...words];
      if (filterMode === 'learning') {
        const learning = words.filter((w) => w.status === 'learning');
        candidateWords = learning.length > 0 ? learning : words;
      } else if (filterMode === 'favorites') {
        const favs = words.filter((w) => w.favorite);
        candidateWords = favs.length > 0 ? favs : words;
      }

      // Shuffle deck
      const shuffled = candidateWords.sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCurrentIndex(0);
      setIsRevealed(false);
      setSessionCompleted(false);
      setSessionStats({ mastered: 0, reviewAgain: 0 });
    }
  }, [isOpen, words, filterMode]);

  // Keyboard shortcut for space bar / enter to reveal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRevealed && !sessionCompleted) {
        e.preventDefault();
        setIsRevealed(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRevealed, sessionCompleted]);

  if (!isOpen) return null;

  const currentWord = deck[currentIndex];

  const handleNext = (status: WordStatus) => {
    if (!currentWord) return;

    onUpdateWordReview(currentWord.id, status);

    if (status === 'mastered') {
      setSessionStats((prev) => ({ ...prev, mastered: prev.mastered + 1 }));
    } else {
      setSessionStats((prev) => ({ ...prev, reviewAgain: prev.reviewAgain + 1 }));
    }

    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionCompleted(false);
    setSessionStats({ mastered: 0, reviewAgain: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-editorial text-lg font-bold">Kelime Pratik Modu</h2>
          </div>

          <div className="flex items-center gap-3">
            {!sessionCompleted && deck.length > 0 && (
              <span className="text-xs text-stone-600 dark:text-stone-300 font-mono tabular-nums">
                {currentIndex + 1} / {deck.length}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {!sessionCompleted && deck.length > 0 && (
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1">
            <div
              className="bg-amber-600 h-1 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>
        )}

        {/* Practice Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-center min-h-[360px]">
          {deck.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Pratik yapılacak kelime bulunamadı.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl"
              >
                Sözlüğe Dön
              </button>
            </div>
          ) : sessionCompleted ? (
            /* Session Completed Screen */
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Tebrikler! Pratik Tamamlandı
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Toplam {deck.length} kelimeyi gözden geçirdiniz.
                </p>
              </div>

              {/* Stats pill-free */}
              <div className="flex justify-center items-center gap-6 py-3 text-xs">
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {sessionStats.mastered}
                  </div>
                  <div className="text-stone-500">Öğrenildi</div>
                </div>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {sessionStats.reviewAgain}
                  </div>
                  <div className="text-stone-500">Tekrar Edilecek</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Yeniden Başlat
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl transition-colors cursor-pointer"
                >
                  Bitir & Kapat
                </button>
              </div>
            </div>
          ) : (
            /* Flashcard Active View */
            <div className="space-y-6">
              {/* Card Surface */}
              <div className="text-center space-y-3 py-4">
                <div className="flex items-center justify-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                  {currentWord.cefrLevel && (
                    <>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        {currentWord.cefrLevel}
                      </span>
                      <span>·</span>
                    </>
                  )}
                  <span>{getPartOfSpeechLabel(currentWord.partOfSpeech)}</span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <h3 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {currentWord.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() => playPronunciation(currentWord.word)}
                    aria-label={`"${currentWord.word}" telaffuzunu dinle`}
                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                    title="Telaffuzu Dinle"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {currentWord.phonetic && (
                  <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
                    {currentWord.phonetic}
                  </p>
                )}
              </div>

              {/* Reveal Area */}
              {!isRevealed ? (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsRevealed(true)}
                    className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs rounded-xl hover:bg-stone-800 dark:hover:bg-white shadow-sm transition-transform active:scale-98 cursor-pointer"
                  >
                    Anlamı & Cümleleri Göster <span className="text-[10px] opacity-70 ml-1.5">(Boşluk)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-stone-200/80 dark:border-stone-800 animate-in fade-in duration-200">
                  {/* Meanings */}
                  <div>
                    <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Türkçe Anlamı
                    </div>
                    <p className="text-base font-semibold text-stone-900 dark:text-stone-100">
                      {currentWord.meanings.join(', ')}
                    </p>
                  </div>

                  {/* Sentence Examples */}
                  {currentWord.examples && currentWord.examples.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                        Örnek Cümleler
                      </div>
                      {currentWord.examples.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-xs space-y-1 border border-stone-200/40 dark:border-stone-700/40"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="italic text-stone-900 dark:text-stone-100 font-medium">
                              "{ex.en}"
                            </p>
                            <button
                              type="button"
                              onClick={() => playPronunciation(ex.en)}
                              className="text-stone-400 hover:text-amber-600 p-1 cursor-pointer shrink-0"
                              title="Cümleyi Dinle"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {ex.tr && <p className="text-stone-600 dark:text-stone-400">{ex.tr}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Personal note if any */}
                  {currentWord.personalNote && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                      💡 {currentWord.personalNote}
                    </p>
                  )}

                  {/* Assessment buttons */}
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleNext('learning')}
                      className="flex-1 py-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold text-xs rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      🔄 Tekrar Et (Öğreniliyor)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNext('mastered')}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                    >
                      ✅ Biliyorum (Öğrenildi)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
