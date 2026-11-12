import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStats,
  exportToMarkdown,
  filterAndSearchWords,
  importFromJson,
  exportToJson,
} from './dictionary.ts';
import type { WordItem } from '../types/dictionary.ts';

const SAMPLE_WORDS: WordItem[] = [
  {
    id: '1',
    language: 'en',
    word: 'Resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    partOfSpeech: 'noun',
    cefrLevel: 'C1',
    meanings: ['Dayanıklılık'],
    examples: [
      { id: 'ex1', en: 'Her resilience was key.', tr: 'Onun dayanıklılığı anahtardı.' },
    ],
    tags: ['Mindset'],
    status: 'mastered',
    reviewCount: 3,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    favorite: true,
  },
  {
    id: '2',
    language: 'en',
    word: 'Catch up with',
    phonetic: '/kætʃ ʌp wɪð/',
    partOfSpeech: 'phrasal_verb',
    cefrLevel: 'B1',
    meanings: ['Görüşmek', 'hasret gidermek'],
    examples: [
      { id: 'ex2', en: 'Let us catch up with coffee.', tr: 'Kahve ile hasret giderelim.' },
      { id: 'ex3', en: 'I must catch up with work.', tr: 'İşlerime yetişmeliyim.' },
    ],
    tags: ['Daily'],
    status: 'learning',
    reviewCount: 1,
    createdAt: '2026-11-02T00:00:00Z',
    updatedAt: '2026-11-02T00:00:00Z',
    favorite: false,
  },
  {
    id: '3',
    language: 'en',
    word: 'Ubiquitous',
    partOfSpeech: 'adjective',
    cefrLevel: 'C1',
    meanings: ['Her yerde bulunan'],
    examples: [],
    tags: ['Academic'],
    status: 'new',
    reviewCount: 0,
    createdAt: '2026-11-03T00:00:00Z',
    updatedAt: '2026-11-03T00:00:00Z',
    favorite: false,
  },
];

test('calculateStats aggregates word counts and examples correctly', () => {
  const stats = calculateStats(SAMPLE_WORDS);
  assert.equal(stats.totalWords, 3);
  assert.equal(stats.masteredCount, 1);
  assert.equal(stats.learningCount, 1);
  assert.equal(stats.newCount, 1);
  assert.equal(stats.totalExamples, 3);
  assert.equal(stats.favoriteCount, 1);
});

test('filterAndSearchWords filters by text query across words, meanings and examples', () => {
  // Search for word
  const matchWord = filterAndSearchWords(SAMPLE_WORDS, {
    search: 'resil',
    sortBy: 'alpha_asc',
  });
  assert.equal(matchWord.length, 1);
  assert.equal(matchWord[0].word, 'Resilience');

  // Search for meaning in Turkish
  const matchMeaning = filterAndSearchWords(SAMPLE_WORDS, {
    search: 'hasret',
    sortBy: 'alpha_asc',
  });
  assert.equal(matchMeaning.length, 1);
  assert.equal(matchMeaning[0].word, 'Catch up with');

  // Search for sentence example in English
  const matchExample = filterAndSearchWords(SAMPLE_WORDS, {
    search: 'coffee',
    sortBy: 'alpha_asc',
  });
  assert.equal(matchExample.length, 1);
  assert.equal(matchExample[0].word, 'Catch up with');
});

test('filterAndSearchWords filters by status and part of speech', () => {
  const learningOnly = filterAndSearchWords(SAMPLE_WORDS, {
    search: '',
    status: 'learning',
    sortBy: 'alpha_asc',
  });
  assert.equal(learningOnly.length, 1);
  assert.equal(learningOnly[0].word, 'Catch up with');

  const adjectivesOnly = filterAndSearchWords(SAMPLE_WORDS, {
    search: '',
    partOfSpeech: 'adjective',
    sortBy: 'alpha_asc',
  });
  assert.equal(adjectivesOnly.length, 1);
  assert.equal(adjectivesOnly[0].word, 'Ubiquitous');
});

test('exportToMarkdown creates markdown with headings, examples and summaries', () => {
  const md = exportToMarkdown(SAMPLE_WORDS);
  assert.ok(md.includes('# 📖 Kişisel İngilizce Sözlüğüm'));
  assert.ok(md.includes('Resilience'));
  assert.ok(md.includes('Her resilience was key.'));
  assert.ok(md.includes('Toplam **3** kelime'));
});

test('importFromJson validates and sanitizes incoming data array', () => {
  const exported = exportToJson(SAMPLE_WORDS);
  const imported = importFromJson(exported);

  assert.equal(imported.success, true);
  assert.ok(imported.data);
  assert.equal(imported.data.length, 3);
  assert.equal(imported.data[0].word, 'Resilience');

  // Invalid JSON
  const invalid = importFromJson('invalid string');
  assert.equal(invalid.success, false);
});

test('exportToMarkdown uses the dictionary language in the title and example flags', () => {
  const md = exportToMarkdown(SAMPLE_WORDS, 'de');
  assert.ok(md.includes('# 📖 Kişisel Almanca Sözlüğüm (Deutsch)'));
  assert.ok(md.includes('🇩🇪 *"Her resilience was key."*'));
});

test('importFromJson assigns every imported word to the target dictionary', () => {
  const exported = exportToJson(SAMPLE_WORDS);
  const imported = importFromJson(exported, 'ru');

  assert.equal(imported.success, true);
  assert.ok(imported.data);
  assert.ok(imported.data.every((w) => w.language === 'ru'));
});
