import React, { useState } from 'react';
import { Volume2, Star, MoreHorizontal, Edit2, Trash2, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { WordItem, WordStatus } from '../types/dictionary.ts';
import { getPartOfSpeechLabel, playPronunciation } from '../utils/dictionary.ts';

interface WordCardProps {
  word: WordItem;
  onEdit: (word: WordItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onChangeStatus: (id: string, status: WordStatus) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onEdit,
  onDelete,
  onToggleFavorite,
  onChangeStatus,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedExampleId, setCopiedExampleId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSpeak = (text: string) => {
    setIsPlayingAudio(true);
    playPronunciation(text, word.language);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleCopyExample = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExampleId(id);
    setTimeout(() => setCopiedExampleId(null), 1500);
  };

  const statusColors: Record<WordStatus, { dot: string; text: string; bg: string }> = {
    new: {
      dot: 'bg-sky-500',
      text: 'text-sky-700 dark:text-sky-400',
      bg: 'hover:bg-sky-50 dark:hover:bg-sky-950/30',
    },
    learning: {
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
    },
    mastered: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    },
  };

  const currentStatusConfig = statusColors[word.status];

  return (
    <article className="group bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 hover:border-stone-300 dark:hover:border-stone-700 transition-all shadow-xs">
      {/* Top Bar: Word, Phonetic, Status & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-editorial text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {word.word}
            </h2>

            {/* Pronunciation Audio Button */}
            <button
              type="button"
              onClick={() => handleSpeak(word.word)}
              aria-label={`"${word.word}" kelimesinin telaffuzunu dinle`}
              className={`p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                isPlayingAudio ? 'text-amber-600 scale-110' : ''
              }`}
              title="Telaffuzu Dinle"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {word.phonetic && (
              <span className="font-mono text-xs text-stone-400 dark:text-stone-500 tracking-wide">
                {word.phonetic}
              </span>
            )}
          </div>

          {/* Clean metadata line with typographic separators (Zero Pill Discipline) */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-600 dark:text-stone-300">
            {word.cefrLevel && (
              <>
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {word.cefrLevel}
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>{getPartOfSpeechLabel(word.partOfSpeech)}</span>

            {word.reviewCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{word.reviewCount} pratik</span>
              </>
            )}
          </div>
        </div>

        {/* Right Corner: Favorite & Status Switcher & Edit */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => onToggleFavorite(word.id)}
            aria-label={word.favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={word.favorite ? 'Yıldızı Kaldır' : 'Yıldız Ekle'}
          >
            <Star
              className={`w-4 h-4 ${
                word.favorite ? 'fill-amber-400 text-amber-500' : 'text-stone-400'
              }`}
            />
          </button>

          {/* Status Quick Switcher */}
          <select
            value={word.status}
            onChange={(e) => onChangeStatus(word.id, e.target.value as WordStatus)}
            aria-label={`Durumu değiştir: ${word.word}`}
            className="text-xs font-medium py-1 px-2 rounded-lg bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
          >
            <option value="new">🌱 Yeni</option>
            <option value="learning">🔄 Öğreniliyor</option>
            <option value="mastered">✅ Öğrenildi</option>
          </select>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(word)}
            aria-label={`Düzenle: ${word.word}`}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Kelimeyi Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Sil: ${word.word}`}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
            title="Kelimeyi Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Warning */}
      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-between gap-3 text-xs">
          <span className="text-red-800 dark:text-red-300 font-medium">
            "{word.word}" sözlükten silinsin mi?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2.5 py-1 rounded bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(word.id);
                setShowDeleteConfirm(false);
              }}
              className="px-2.5 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700 cursor-pointer"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      )}

      {/* Meanings */}
      <div className="mt-3.5">
        <ul className="space-y-1">
          {word.meanings.map((meaning, idx) => (
            <li key={idx} className="text-sm font-medium text-stone-800 dark:text-stone-200 flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 select-none text-xs leading-5">▪</span>
              <span>{meaning}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sentence Examples Section */}
      {word.examples && word.examples.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800/80 space-y-2.5">
          <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 tracking-wider uppercase">
            Örnek Cümleler ({word.examples.length})
          </div>

          <div className="space-y-2">
            {word.examples.map((ex) => (
              <div
                key={ex.id}
                className="group/ex relative bg-stone-50/70 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200/50 dark:border-stone-700/50 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-stone-900 dark:text-stone-100 font-medium leading-relaxed italic">
                    "{ex.en}"
                  </p>
                  <div className="flex items-center gap-1 opacity-80 group-hover/ex:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSpeak(ex.en)}
                      aria-label="Cümleyi dinle"
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded cursor-pointer"
                      title="Cümleyi Dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyExample(ex.id, ex.en)}
                      aria-label="Cümleyi kopyala"
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded cursor-pointer"
                      title="Cümleyi Kopyala"
                    >
                      {copiedExampleId === ex.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {ex.tr && (
                  <p className="mt-1 text-stone-700 dark:text-stone-300 leading-normal">
                    {ex.tr}
                  </p>
                )}

                {ex.context && (
                  <span className="inline-block mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                    Bağlam: {ex.context}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Extra Details: Synonyms, Antonyms, Personal Notes, Tags */}
      {(word.synonyms?.length || word.antonyms?.length || word.personalNote || word.tags?.length) && (
        <div className="mt-3.5 pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-medium transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Detayları gizle</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Eş anlamlılar & notlar</span>
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2.5 text-xs bg-stone-50/50 dark:bg-stone-800/30 p-3 rounded-xl border border-stone-200/40 dark:border-stone-800">
              {word.synonyms && word.synonyms.length > 0 && (
                <div>
                  <span className="text-stone-400 dark:text-stone-500">Eş Anlamlılar: </span>
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    {word.synonyms.join(', ')}
                  </span>
                </div>
              )}

              {word.antonyms && word.antonyms.length > 0 && (
                <div>
                  <span className="text-stone-400 dark:text-stone-500">Zıt Anlamlılar: </span>
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    {word.antonyms.join(', ')}
                  </span>
                </div>
              )}

              {word.personalNote && (
                <div>
                  <span className="text-stone-400 dark:text-stone-500">Kişisel Not: </span>
                  <span className="text-stone-700 dark:text-stone-300 italic">
                    💡 {word.personalNote}
                  </span>
                </div>
              )}

              {word.tags && word.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-stone-400 dark:text-stone-500">Etiketler:</span>
                  {word.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-stone-600 dark:text-stone-400 font-mono text-[11px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
