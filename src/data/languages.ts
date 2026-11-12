import type { DictionaryLanguage } from '../types/dictionary.ts';

export interface LanguageConfig {
  code: DictionaryLanguage;
  /** Turkish display name, e.g. "İngilizce". */
  name: string;
  /** Name in the language itself, e.g. "Deutsch". */
  nativeName: string;
  flag: string;
  /** BCP 47 tag for the Web Speech API. */
  speechLang: string;
  wordPlaceholder: string;
  phoneticPlaceholder: string;
  examplePlaceholder: string;
}

export const LANGUAGES: Record<DictionaryLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'İngilizce',
    nativeName: 'English',
    flag: '🇬🇧',
    speechLang: 'en-US',
    wordPlaceholder: 'ör. Resilience',
    phoneticPlaceholder: 'ör. /rɪˈzɪl.jəns/',
    examplePlaceholder: 'İngilizce örnek cümle (ör. Her resilience inspired the team.)',
  },
  de: {
    code: 'de',
    name: 'Almanca',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechLang: 'de-DE',
    wordPlaceholder: 'ör. die Geduld',
    phoneticPlaceholder: 'ör. /ɡəˈdʊlt/',
    examplePlaceholder: 'Almanca örnek cümle (ör. Ich habe keine Geduld mehr.)',
  },
  ru: {
    code: 'ru',
    name: 'Rusça',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechLang: 'ru-RU',
    wordPlaceholder: 'ör. терпение',
    phoneticPlaceholder: 'ör. [tʲɪrˈpʲenʲɪjə]',
    examplePlaceholder: 'Rusça örnek cümle (ör. У меня кончилось терпение.)',
  },
};

export const LANGUAGE_ORDER: DictionaryLanguage[] = ['en', 'de', 'ru'];

export function isDictionaryLanguage(value: unknown): value is DictionaryLanguage {
  return value === 'en' || value === 'ru' || value === 'de';
}

/** Legacy records were created before multi-language support and are all English. */
export function normalizeLanguage(value: unknown): DictionaryLanguage {
  return isDictionaryLanguage(value) ? value : 'en';
}
