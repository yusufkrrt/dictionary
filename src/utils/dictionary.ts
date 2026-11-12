import { LANGUAGES } from '../data/languages.ts';
import type { DictionaryLanguage, DictionaryStats, PartOfSpeech, WordFilter, WordItem, WordStatus } from '../types/dictionary.ts';

/**
 * Filter, search, and sort words
 */
export function filterAndSearchWords(words: WordItem[], filters: WordFilter): WordItem[] {
  const query = filters.search.trim().toLowerCase();

  return words.filter((item) => {
    // Search query match in word, phonetic, meanings, examples, tags, personal note
    if (query) {
      const matchWord = item.word.toLowerCase().includes(query);
      const matchPhonetic = item.phonetic?.toLowerCase().includes(query);
      const matchMeanings = item.meanings.some((m) => m.toLowerCase().includes(query));
      const matchExamples = item.examples.some(
        (ex) => ex.en.toLowerCase().includes(query) || (ex.tr && ex.tr.toLowerCase().includes(query))
      );
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
      const matchNote = item.personalNote?.toLowerCase().includes(query);

      if (!matchWord && !matchPhonetic && !matchMeanings && !matchExamples && !matchTags && !matchNote) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }

    // Part of speech filter
    if (filters.partOfSpeech && filters.partOfSpeech !== 'all' && item.partOfSpeech !== filters.partOfSpeech) {
      return false;
    }

    // CEFR level filter
    if (filters.cefrLevel && filters.cefrLevel !== 'all' && item.cefrLevel !== filters.cefrLevel) {
      return false;
    }

    // Tag filter
    if (filters.tag && filters.tag !== 'all' && !item.tags.includes(filters.tag)) {
      return false;
    }

    // Favorites filter
    if (filters.favoritesOnly && !item.favorite) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'alpha_asc':
        return a.word.localeCompare(b.word, 'en', { sensitivity: 'base' });
      case 'alpha_desc':
        return b.word.localeCompare(a.word, 'en', { sensitivity: 'base' });
      case 'reviews_asc':
        return a.reviewCount - b.reviewCount;
      case 'reviews_desc':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });
}

/**
 * Compute key statistics for dictionary overview
 */
export function calculateStats(words: WordItem[]): DictionaryStats {
  let masteredCount = 0;
  let learningCount = 0;
  let newCount = 0;
  let totalExamples = 0;
  let favoriteCount = 0;

  for (const w of words) {
    if (w.status === 'mastered') masteredCount++;
    else if (w.status === 'learning') learningCount++;
    else newCount++;

    totalExamples += w.examples.length;
    if (w.favorite) favoriteCount++;
  }

  return {
    totalWords: words.length,
    masteredCount,
    learningCount,
    newCount,
    totalExamples,
    favoriteCount,
  };
}

/**
 * Format dictionary into GitHub-friendly Markdown document
 */
export function exportToMarkdown(words: WordItem[], language: DictionaryLanguage = 'en'): string {
  const lang = LANGUAGES[language];
  const sorted = [...words].sort((a, b) => a.word.localeCompare(b.word));
  const stats = calculateStats(words);

  let md = `# 📖 Kişisel ${lang.name} Sözlüğüm (${lang.nativeName})\n\n`;
  md += `> Toplam **${stats.totalWords}** kelime, **${stats.totalExamples}** örnek cümle.\n\n`;
  md += `## 📊 Özet İstatistikler\n`;
  md += `- **Öğrenildi / Mastered**: ${stats.masteredCount}\n`;
  md += `- **Öğreniliyor / Learning**: ${stats.learningCount}\n`;
  md += `- **Yeni / New**: ${stats.newCount}\n\n`;
  md += `---\n\n`;
  md += `## 📚 Kelime Listesi\n\n`;

  for (const item of sorted) {
    const phoneticStr = item.phonetic ? ` *${item.phonetic}*` : '';
    const pos = getPartOfSpeechLabel(item.partOfSpeech);
    const cefr = item.cefrLevel ? ` \`[${item.cefrLevel}]\`` : '';
    const statusIcon = item.status === 'mastered' ? '✅' : item.status === 'learning' ? '🔄' : '🌱';

    md += `### ${item.word}${phoneticStr} ${cefr}\n`;
    md += `- **Tür:** *${pos}* | **Durum:** ${statusIcon} ${getStatusLabel(item.status)}\n`;
    md += `- **Anlam(lar):** ${item.meanings.join(', ')}\n`;

    if (item.examples && item.examples.length > 0) {
      md += `- **Örnek Cümleler:**\n`;
      for (const ex of item.examples) {
        md += `  - ${lang.flag} *"${ex.en}"*\n`;
        if (ex.tr) {
          md += `    🇹🇷 ${ex.tr}\n`;
        }
      }
    }

    if (item.synonyms && item.synonyms.length > 0) {
      md += `- **Eş Anlamlılar:** ${item.synonyms.join(', ')}\n`;
    }

    if (item.personalNote) {
      md += `- **Kişisel Not:** 💡 *${item.personalNote}*\n`;
    }

    if (item.tags && item.tags.length > 0) {
      md += `- **Etiketler:** \`${item.tags.join('`, `')}\`\n`;
    }

    md += `\n---\n\n`;
  }

  md += `\n*Bu sözlük [LexiNote](https://github.com/yusufkrrt/dictionary) minimalist kelime defteri ile oluşturuldu.*\n`;
  return md;
}

/**
 * Export dictionary data to JSON string
 */
export function exportToJson(words: WordItem[]): string {
  return JSON.stringify(words, null, 2);
}

/**
 * Export words as CSV for Anki or Excel
 */
export function exportToCsv(words: WordItem[]): string {
  const header = ['Word', 'Phonetic', 'Part of Speech', 'CEFR', 'Meanings', 'Examples', 'Status', 'Tags'];
  const rows = words.map((w) => {
    const examplesStr = w.examples.map((ex) => `${ex.en} ${ex.tr ? `(${ex.tr})` : ''}`).join(' | ');
    return [
      `"${w.word.replace(/"/g, '""')}"`,
      `"${(w.phonetic || '').replace(/"/g, '""')}"`,
      `"${w.partOfSpeech}"`,
      `"${w.cefrLevel || ''}"`,
      `"${w.meanings.join('; ').replace(/"/g, '""')}"`,
      `"${examplesStr.replace(/"/g, '""')}"`,
      `"${w.status}"`,
      `"${w.tags.join(', ').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

/**
 * Validate and import a JSON array. Every imported word is assigned to the given dictionary language.
 */
export function importFromJson(
  rawJson: string,
  language: DictionaryLanguage = 'en'
): { success: boolean; data?: WordItem[]; error?: string } {
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'JSON verisi bir dizi (array) olmalıdır.' };
    }

    const validated: WordItem[] = [];
    for (const item of parsed) {
      if (!item.word || typeof item.word !== 'string') {
        continue;
      }
      validated.push({
        id: item.id || `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        language,
        word: item.word.trim(),
        phonetic: item.phonetic?.trim() || undefined,
        partOfSpeech: item.partOfSpeech || 'noun',
        cefrLevel: item.cefrLevel || undefined,
        meanings: Array.isArray(item.meanings) ? item.meanings.filter(Boolean) : [String(item.meanings || '')],
        examples: Array.isArray(item.examples)
          ? item.examples.map((ex: any, idx: number) => ({
              id: ex.id || `ex_${idx}`,
              en: typeof ex === 'string' ? ex : ex.en || '',
              tr: typeof ex === 'object' ? ex.tr : undefined,
              context: typeof ex === 'object' ? ex.context : undefined,
            }))
          : [],
        synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
        antonyms: Array.isArray(item.antonyms) ? item.antonyms : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        personalNote: item.personalNote || undefined,
        status: ['new', 'learning', 'mastered'].includes(item.status) ? item.status : 'new',
        reviewCount: typeof item.reviewCount === 'number' ? item.reviewCount : 0,
        lastReviewedAt: item.lastReviewedAt || undefined,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        favorite: !!item.favorite,
      });
    }

    if (validated.length === 0) {
      return { success: false, error: 'İçeride geçerli kelime bulunamadı.' };
    }

    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: `Geçersiz JSON formatı: ${err.message}` };
  }
}

const PART_OF_SPEECH_LABELS: Record<PartOfSpeech, string> = {
  noun: 'İsim (noun)',
  verb: 'Fiil (verb)',
  adjective: 'Sıfat (adj)',
  adverb: 'Zarf (adv)',
  pronoun: 'Zamir (pron)',
  preposition: 'Edat (prep)',
  conjunction: 'Bağlaç (conj)',
  article: 'Tanımlık (article)',
  particle: 'Edatçık (particle)',
  phrasal_verb: 'Deyimsel Fiil (phrasal verb)',
  idiom: 'Deyim (idiom)',
  expression: 'Kalıp İfade (expression)',
};

/** All parts of speech in display order, for select inputs and filters. */
export const PART_OF_SPEECH_OPTIONS = Object.keys(PART_OF_SPEECH_LABELS) as PartOfSpeech[];

export function getPartOfSpeechLabel(pos: PartOfSpeech): string {
  return PART_OF_SPEECH_LABELS[pos] ?? pos;
}

export function getStatusLabel(status: WordStatus): string {
  switch (status) {
    case 'mastered':
      return 'Öğrenildi';
    case 'learning':
      return 'Öğreniliyor';
    case 'new':
      return 'Yeni';
  }
}

/**
 * Text-to-speech pronunciation using the browser Web Speech API, in the dictionary's language.
 */
export function playPronunciation(text: string, language: DictionaryLanguage = 'en'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const speechLang = LANGUAGES[language].speechLang;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang;
  utterance.rate = 0.9; // Slightly slower for language learners

  // Prefer a high-quality voice for the language; fall back to any voice that matches it
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(language));
  const preferredVoice =
    voices.find((v) => /Natural|Google|Samantha|Anna|Milena/.test(v.name)) ?? voices[0];
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}
