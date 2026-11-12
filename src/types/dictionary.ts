/** Target languages that have their own separate dictionary. */
export type DictionaryLanguage = 'en' | 'ru' | 'de';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrasal_verb'
  | 'idiom'
  | 'expression'
  | 'conjunction'
  | 'pronoun'
  | 'preposition'
  | 'article'
  | 'particle';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type WordStatus = 'new' | 'learning' | 'mastered';

export interface SentenceExample {
  id: string;
  /** Sentence in the dictionary's target language (field name kept for stored-data compatibility). */
  en: string;
  tr?: string;
  context?: string;
}

export interface WordItem {
  id: string;
  /** Which dictionary this word belongs to. Legacy records without it are treated as English. */
  language: DictionaryLanguage;
  word: string;
  phonetic?: string;
  partOfSpeech: PartOfSpeech;
  cefrLevel?: CEFRLevel;
  meanings: string[];
  examples: SentenceExample[];
  synonyms?: string[];
  antonyms?: string[];
  tags: string[];
  personalNote?: string;
  status: WordStatus;
  reviewCount: number;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  favorite?: boolean;
  userId?: string;
}

export type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'alpha_asc'
  | 'alpha_desc'
  | 'reviews_asc'
  | 'reviews_desc';

export interface WordFilter {
  search: string;
  status?: WordStatus | 'all';
  partOfSpeech?: PartOfSpeech | 'all';
  cefrLevel?: CEFRLevel | 'all';
  tag?: string | 'all';
  favoritesOnly?: boolean;
  sortBy: SortOption;
}

export interface DictionaryStats {
  totalWords: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
  totalExamples: number;
  favoriteCount: number;
}
