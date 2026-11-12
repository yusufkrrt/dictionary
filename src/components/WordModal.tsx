import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Volume2, Sparkles } from 'lucide-react';
import { CEFRLevel, DictionaryLanguage, PartOfSpeech, SentenceExample, WordItem, WordStatus } from '../types/dictionary.ts';
import { LANGUAGES } from '../data/languages.ts';
import { getPartOfSpeechLabel, PART_OF_SPEECH_OPTIONS, playPronunciation } from '../utils/dictionary.ts';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wordData: Omit<WordItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'> & { id?: string }) => void;
  initialWord?: WordItem | null;
  language: DictionaryLanguage;
}

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWord,
  language,
}) => {
  const lang = LANGUAGES[language];
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | ''>('B1');
  const [meanings, setMeanings] = useState<string[]>(['']);
  const [examples, setExamples] = useState<Array<{ id: string; en: string; tr: string; context: string }>>([
    { id: 'ex_init_1', en: '', tr: '', context: '' },
  ]);
  const [synonymsInput, setSynonymsInput] = useState('');
  const [antonymsInput, setAntonymsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [status, setStatus] = useState<WordStatus>('learning');
  const [favorite, setFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWord) {
      setWord(initialWord.word);
      setPhonetic(initialWord.phonetic || '');
      setPartOfSpeech(initialWord.partOfSpeech);
      setCefrLevel(initialWord.cefrLevel || '');
      setMeanings(initialWord.meanings.length > 0 ? initialWord.meanings : ['']);
      setExamples(
        initialWord.examples.length > 0
          ? initialWord.examples.map((ex) => ({
              id: ex.id,
              en: ex.en,
              tr: ex.tr || '',
              context: ex.context || '',
            }))
          : [{ id: 'ex_1', en: '', tr: '', context: '' }]
      );
      setSynonymsInput(initialWord.synonyms ? initialWord.synonyms.join(', ') : '');
      setAntonymsInput(initialWord.antonyms ? initialWord.antonyms.join(', ') : '');
      setTagsInput(initialWord.tags ? initialWord.tags.join(', ') : '');
      setPersonalNote(initialWord.personalNote || '');
      setStatus(initialWord.status);
      setFavorite(!!initialWord.favorite);
    } else {
      // Reset form
      setWord('');
      setPhonetic('');
      setPartOfSpeech('noun');
      setCefrLevel('B1');
      setMeanings(['']);
      setExamples([{ id: `ex_${Date.now()}`, en: '', tr: '', context: '' }]);
      setSynonymsInput('');
      setAntonymsInput('');
      setTagsInput('Günlük');
      setPersonalNote('');
      setStatus('learning');
      setFavorite(false);
    }
    setError(null);
  }, [initialWord, isOpen]);

  if (!isOpen) return null;

  const handleAddMeaning = () => {
    setMeanings([...meanings, '']);
  };

  const handleUpdateMeaning = (index: number, val: string) => {
    const updated = [...meanings];
    updated[index] = val;
    setMeanings(updated);
  };

  const handleRemoveMeaning = (index: number) => {
    if (meanings.length <= 1) {
      setMeanings(['']);
      return;
    }
    setMeanings(meanings.filter((_, i) => i !== index));
  };

  const handleAddExample = () => {
    setExamples([
      ...examples,
      { id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, en: '', tr: '', context: '' },
    ]);
  };

  const handleUpdateExample = (index: number, field: 'en' | 'tr' | 'context', value: string) => {
    const updated = [...examples];
    updated[index] = { ...updated[index], [field]: value };
    setExamples(updated);
  };

  const handleRemoveExample = (index: number) => {
    if (examples.length <= 1) {
      setExamples([{ id: `ex_${Date.now()}`, en: '', tr: '', context: '' }]);
      return;
    }
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!word.trim()) {
      setError(`Lütfen ${lang.name} kelimeyi giriniz.`);
      return;
    }

    const cleanMeanings = meanings.map((m) => m.trim()).filter(Boolean);
    if (cleanMeanings.length === 0) {
      setError('Lütfen kelimenin en az bir Türkçe anlamını giriniz.');
      return;
    }

    const cleanExamples: SentenceExample[] = examples
      .filter((ex) => ex.en.trim())
      .map((ex) => ({
        id: ex.id,
        en: ex.en.trim(),
        tr: ex.tr.trim() || undefined,
        context: ex.context.trim() || undefined,
      }));

    const cleanSynonyms = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanAntonyms = antonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSave({
      id: initialWord?.id,
      language,
      word: word.trim(),
      phonetic: phonetic.trim() || undefined,
      partOfSpeech,
      cefrLevel: (cefrLevel as CEFRLevel) || undefined,
      meanings: cleanMeanings,
      examples: cleanExamples,
      synonyms: cleanSynonyms.length > 0 ? cleanSynonyms : undefined,
      antonyms: cleanAntonyms.length > 0 ? cleanAntonyms : undefined,
      tags: cleanTags,
      personalNote: personalNote.trim() || undefined,
      status,
      favorite,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-xl text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 className="font-editorial text-xl font-bold">
            {initialWord ? 'Kelimeyi Düzenle' : `Yeni Kelime · ${lang.name} Sözlük`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Row 1: Word, Phonetic, Audio Test */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {lang.name} Kelime / İfade *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={lang.wordPlaceholder}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100 font-medium"
                />
                {word.trim() && (
                  <button
                    type="button"
                    onClick={() => playPronunciation(word, language)}
                    title="Telaffuzu dene"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Fonetik Telaffuz (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder={lang.phoneticPlaceholder}
                className="w-full px-3.5 py-2 font-mono text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Row 2: Part of Speech, CEFR Level, Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kelime Türü
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100 cursor-pointer"
              >
                {PART_OF_SPEECH_OPTIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {getPartOfSpeechLabel(pos)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                CEFR Seviyesi
              </label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value as CEFRLevel)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100 cursor-pointer"
              >
                <option value="">Belirtilmedi</option>
                <option value="A1">A1 - Başlangıç</option>
                <option value="A2">A2 - Temel</option>
                <option value="B1">B1 - Orta Öncesi</option>
                <option value="B2">B2 - Orta</option>
                <option value="C1">C1 - İleri</option>
                <option value="C2">C2 - Yetkin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Öğrenme Durumu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WordStatus)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100 cursor-pointer"
              >
                <option value="new">🌱 Yeni Başlandı</option>
                <option value="learning">🔄 Öğreniliyor</option>
                <option value="mastered">✅ Tamamen Öğrenildi</option>
              </select>
            </div>
          </div>

          {/* Meanings / Translations */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Türkçe Anlamlar / Karşılıklar *
              </label>
              <button
                type="button"
                onClick={handleAddMeaning}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Anlam Ekle
              </button>
            </div>
            <div className="space-y-2">
              {meanings.map((meaning, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={meaning}
                    onChange={(e) => handleUpdateMeaning(index, e.target.value)}
                    placeholder={`Anlam ${index + 1} (ör. sabır, dayanıklılık)`}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100"
                  />
                  {meanings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMeaning(index)}
                      aria-label={`Anlam ${index + 1} sil`}
                      className="p-1.5 text-stone-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sentence Examples (Core feature) */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  Örnek Cümleler ({lang.name} & Türkçe)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Kelimeleri cümle içinde görmek kalıcılığı 3 kat artırır
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddExample}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Cümle Ekle
              </button>
            </div>

            <div className="space-y-3">
              {examples.map((ex, index) => (
                <div
                  key={ex.id || index}
                  className="p-3 bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-xl space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                      Cümle #{index + 1}
                    </span>
                    {examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExample(index)}
                        aria-label={`Cümle ${index + 1} sil`}
                        className="text-stone-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={ex.en}
                      onChange={(e) => handleUpdateExample(index, 'en', e.target.value)}
                      placeholder={lang.examplePlaceholder}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ex.tr}
                      onChange={(e) => handleUpdateExample(index, 'tr', e.target.value)}
                      placeholder="🇹🇷 Türkçe çevirisi (isteğe bağlı)"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                    />
                    <input
                      type="text"
                      value={ex.context}
                      onChange={(e) => handleUpdateExample(index, 'context', e.target.value)}
                      placeholder="Bağlam/Konu (ör. İş Hayatı, Mülakat)"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synonyms, Antonyms, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Eş Anlamlılar (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={synonymsInput}
                onChange={(e) => setSynonymsInput(e.target.value)}
                placeholder="Virgülle ayırın"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Etiketler / Kategoriler (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Günlük, İş, Seyahat, Konuşma"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Personal Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Kişisel Hatırlatıcı Not / İpucu (İsteğe bağlı)
            </label>
            <textarea
              rows={2}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Kelimeyi ilk nerede duydunuz veya aklınızda tutmak için bir çağrışım..."
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none text-stone-900 dark:text-stone-100"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Yıldızlı / Favori Olarak İşaretle</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {initialWord ? 'Değişiklikleri Kaydet' : 'Sözlüğe Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
