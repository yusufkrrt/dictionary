import type { DictionaryLanguage, PartOfSpeech, WordItem } from '../types/dictionary.ts';

/**
 * Starter content: the 30 most frequent words (lemmas) of each language, in frequency order.
 * Sources: Oxford English Corpus (en), Routledge Frequency Dictionary of German (de),
 * Sharoff / Lyashevskaya lemma frequency lists (ru).
 */

interface SampleEntry {
  word: string;
  phonetic?: string;
  pos: PartOfSpeech;
  meanings: string[];
  example: [sentence: string, translation: string];
  note?: string;
}

const SAMPLE_TAGS = ['En Sık 30', 'Temel'];
const SAMPLE_BASE_TIME = Date.UTC(2026, 10, 1);

function buildSamples(language: DictionaryLanguage, entries: SampleEntry[]): WordItem[] {
  return entries.map((entry, index) => {
    const rank = index + 1;
    // Older timestamps for higher-ranked words, so "newest first" lists end with the most frequent word.
    const timestamp = new Date(SAMPLE_BASE_TIME + (entries.length - rank) * 60_000).toISOString();
    return {
      id: `sample_${language}_${rank}`,
      language,
      word: entry.word,
      phonetic: entry.phonetic,
      partOfSpeech: entry.pos,
      cefrLevel: 'A1',
      meanings: entry.meanings,
      examples: [{ id: `ex_${language}_${rank}`, en: entry.example[0], tr: entry.example[1] }],
      synonyms: [],
      antonyms: [],
      tags: SAMPLE_TAGS,
      personalNote: entry.note ? `#${rank} · ${entry.note}` : `Sıklık sırası: #${rank}`,
      status: 'new',
      reviewCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      favorite: false,
    };
  });
}

const EN: SampleEntry[] = [
  { word: 'the', phonetic: '/ðə/', pos: 'article', meanings: ['Belirli tanımlık (çoğu zaman çevrilmez)'], example: ['The book is on the table.', 'Kitap masanın üstünde.'], note: 'Sesli harften önce /ði/ okunur: the apple.' },
  { word: 'be', phonetic: '/biː/', pos: 'verb', meanings: ['Olmak', '-dir, -dır'], example: ['I am a student.', 'Ben bir öğrenciyim.'], note: 'am / is / are – was / were – been' },
  { word: 'to', phonetic: '/tuː/', pos: 'preposition', meanings: ['-e, -a (yönelme)', 'mastar eki (to go = gitmek)'], example: ['I want to go to the park.', 'Parka gitmek istiyorum.'] },
  { word: 'of', phonetic: '/ɒv/', pos: 'preposition', meanings: ['-in, -ın (ait olma)', '-den (miktar)'], example: ['She is the mother of two children.', 'O, iki çocuk annesi.'] },
  { word: 'and', phonetic: '/ænd/', pos: 'conjunction', meanings: ['Ve'], example: ['Tea and coffee, please.', 'Çay ve kahve lütfen.'] },
  { word: 'a', phonetic: '/ə/', pos: 'article', meanings: ['Bir (belirsiz tanımlık)'], example: ['I have a car.', 'Bir arabam var.'], note: 'Sesli harften önce "an" olur: an apple.' },
  { word: 'in', phonetic: '/ɪn/', pos: 'preposition', meanings: ['İçinde, -de, -da'], example: ['The keys are in my bag.', 'Anahtarlar çantamda.'] },
  { word: 'that', phonetic: '/ðæt/', pos: 'pronoun', meanings: ['Şu, o', 'ki, -dığı (bağlaç olarak)'], example: ['I know that you are right.', 'Haklı olduğunu biliyorum.'] },
  { word: 'have', phonetic: '/hæv/', pos: 'verb', meanings: ['Sahip olmak', 'yardımcı fiil (have done)'], example: ['We have a big family.', 'Kalabalık bir ailemiz var.'], note: 'he / she / it has – had – had' },
  { word: 'I', phonetic: '/aɪ/', pos: 'pronoun', meanings: ['Ben'], example: ['I live in Istanbul.', "İstanbul'da yaşıyorum."], note: 'Her zaman büyük harfle yazılır.' },
  { word: 'it', phonetic: '/ɪt/', pos: 'pronoun', meanings: ['O (cansız varlık, hayvan)', 'hava/zaman cümlelerinde özne'], example: ['It is very cold today.', 'Bugün hava çok soğuk.'] },
  { word: 'for', phonetic: '/fɔː/', pos: 'preposition', meanings: ['İçin', '(süre) -dir'], example: ['This gift is for you.', 'Bu hediye senin için.'] },
  { word: 'not', phonetic: '/nɒt/', pos: 'adverb', meanings: ['Değil', 'olumsuzluk eki'], example: ['I am not tired.', 'Yorgun değilim.'] },
  { word: 'on', phonetic: '/ɒn/', pos: 'preposition', meanings: ['Üzerinde', '(gün) -de'], example: ['See you on Monday.', 'Pazartesi görüşürüz.'] },
  { word: 'with', phonetic: '/wɪð/', pos: 'preposition', meanings: ['İle, birlikte'], example: ['I live with my parents.', 'Ailemle yaşıyorum.'] },
  { word: 'he', phonetic: '/hiː/', pos: 'pronoun', meanings: ['O (erkek)'], example: ['He works in a hospital.', 'O bir hastanede çalışıyor.'] },
  { word: 'as', phonetic: '/æz/', pos: 'conjunction', meanings: ['Olarak', '-dığı gibi', '-ken'], example: ['She works as a teacher.', 'Öğretmen olarak çalışıyor.'] },
  { word: 'you', phonetic: '/juː/', pos: 'pronoun', meanings: ['Sen, siz'], example: ['Do you speak English?', 'İngilizce konuşuyor musun?'] },
  { word: 'do', phonetic: '/duː/', pos: 'verb', meanings: ['Yapmak', 'soru ve olumsuzluk yardımcı fiili'], example: ['What do you do?', 'Ne iş yapıyorsun?'], note: 'does – did – done' },
  { word: 'at', phonetic: '/æt/', pos: 'preposition', meanings: ['-de (nokta, adres)', '(saat) -de'], example: ["The meeting is at five o'clock.", 'Toplantı saat beşte.'] },
  { word: 'this', phonetic: '/ðɪs/', pos: 'pronoun', meanings: ['Bu'], example: ['This is my brother.', 'Bu benim kardeşim.'], note: 'Çoğulu: these' },
  { word: 'but', phonetic: '/bʌt/', pos: 'conjunction', meanings: ['Ama, fakat'], example: ['It is small but comfortable.', 'Küçük ama rahat.'] },
  { word: 'his', phonetic: '/hɪz/', pos: 'pronoun', meanings: ['Onun (erkek)'], example: ['His name is Tom.', 'Onun adı Tom.'] },
  { word: 'by', phonetic: '/baɪ/', pos: 'preposition', meanings: ['Tarafından', 'ile (ulaşım)', '-e kadar'], example: ['I go to work by bus.', 'İşe otobüsle giderim.'] },
  { word: 'from', phonetic: '/frɒm/', pos: 'preposition', meanings: ['-den, -dan'], example: ['Where are you from?', 'Nerelisin?'] },
  { word: 'they', phonetic: '/ðeɪ/', pos: 'pronoun', meanings: ['Onlar'], example: ['They are my friends.', 'Onlar benim arkadaşlarım.'] },
  { word: 'we', phonetic: '/wiː/', pos: 'pronoun', meanings: ['Biz'], example: ['We are late again.', 'Yine geç kaldık.'] },
  { word: 'say', phonetic: '/seɪ/', pos: 'verb', meanings: ['Söylemek, demek'], example: ['What did you say?', 'Ne dedin?'], note: 'say – said – said' },
  { word: 'her', phonetic: '/hɜː/', pos: 'pronoun', meanings: ['Onun (kadın)', 'onu, ona (kadın)'], example: ['I called her yesterday.', 'Dün onu aradım.'] },
  { word: 'she', phonetic: '/ʃiː/', pos: 'pronoun', meanings: ['O (kadın)'], example: ['She is a doctor.', 'O bir doktor.'] },
];

const DE: SampleEntry[] = [
  { word: 'der, die, das', phonetic: '/deːɐ̯, diː, das/', pos: 'article', meanings: ['Belirli tanımlık (eril, dişil, nötr)'], example: ['Der Mann, die Frau und das Kind.', 'Adam, kadın ve çocuk.'], note: 'Her ismi tanımlığıyla birlikte öğren.' },
  { word: 'und', phonetic: '/ʊnt/', pos: 'conjunction', meanings: ['Ve'], example: ['Ich trinke Kaffee und lese die Zeitung.', 'Kahve içiyorum ve gazete okuyorum.'] },
  { word: 'sein', phonetic: '/zaɪ̯n/', pos: 'verb', meanings: ['Olmak', '-dir, -dır'], example: ['Ich bin müde.', 'Yorgunum.'], note: 'bin, bist, ist, sind, seid, sind' },
  { word: 'in', phonetic: '/ɪn/', pos: 'preposition', meanings: ['İçinde, -de', 'içine, -e'], example: ['Ich wohne in Berlin.', "Berlin'de yaşıyorum."], note: 'Yer: Dativ, yön: Akkusativ.' },
  { word: 'ein, eine', phonetic: '/aɪ̯n, ˈaɪ̯nə/', pos: 'article', meanings: ['Bir (belirsiz tanımlık)'], example: ['Ich habe eine Frage.', 'Bir sorum var.'] },
  { word: 'zu', phonetic: '/t͡suː/', pos: 'preposition', meanings: ['-e, -a, -in yanına', '(sıfattan önce) fazla, çok'], example: ['Ich gehe zu meiner Mutter.', 'Annemin yanına gidiyorum.'], note: 'zu + Dativ' },
  { word: 'haben', phonetic: '/ˈhaːbn̩/', pos: 'verb', meanings: ['Sahip olmak', 'yardımcı fiil (Perfekt)'], example: ['Wir haben keine Zeit.', 'Vaktimiz yok.'], note: 'habe, hast, hat, haben, habt, haben' },
  { word: 'ich', phonetic: '/ɪç/', pos: 'pronoun', meanings: ['Ben'], example: ['Ich heiße Anna.', 'Benim adım Anna.'] },
  { word: 'werden', phonetic: '/ˈveːɐ̯dn̩/', pos: 'verb', meanings: ['Olmak (dönüşmek)', 'gelecek zaman yardımcı fiili'], example: ['Es wird kalt.', 'Hava soğuyor.'], note: 'werde, wirst, wird, werden, werdet, werden' },
  { word: 'sie / Sie', phonetic: '/ziː/', pos: 'pronoun', meanings: ['O (dişil)', 'onlar', 'Sie: siz (resmî)'], example: ['Sie kommt aus Wien.', "O Viyanalı."] },
  { word: 'von', phonetic: '/fɔn/', pos: 'preposition', meanings: ['-den, -dan', '-in (ait olma)'], example: ['Das ist ein Geschenk von meinem Vater.', 'Bu babamdan bir hediye.'], note: 'von + Dativ' },
  { word: 'nicht', phonetic: '/nɪçt/', pos: 'particle', meanings: ['Değil', 'olumsuzluk (-me, -ma)'], example: ['Ich verstehe das nicht.', 'Bunu anlamıyorum.'], note: 'İsim olumsuzlamada "kein" kullanılır.' },
  { word: 'mit', phonetic: '/mɪt/', pos: 'preposition', meanings: ['İle, birlikte'], example: ['Ich fahre mit dem Zug.', 'Trenle gidiyorum.'], note: 'mit + Dativ' },
  { word: 'es', phonetic: '/ɛs/', pos: 'pronoun', meanings: ['O (nötr)', 'hava/olay cümlelerinde özne'], example: ['Es regnet.', 'Yağmur yağıyor.'] },
  { word: 'sich', phonetic: '/zɪç/', pos: 'pronoun', meanings: ['Kendini, kendine (dönüşlü zamir)'], example: ['Er wäscht sich.', 'O yıkanıyor.'] },
  { word: 'auch', phonetic: '/aʊ̯x/', pos: 'adverb', meanings: ['De, da', 'dahi'], example: ['Ich komme auch mit.', 'Ben de geliyorum.'] },
  { word: 'auf', phonetic: '/aʊ̯f/', pos: 'preposition', meanings: ['Üzerinde, üstüne'], example: ['Das Buch liegt auf dem Tisch.', 'Kitap masanın üstünde.'] },
  { word: 'für', phonetic: '/fyːɐ̯/', pos: 'preposition', meanings: ['İçin'], example: ['Das ist für dich.', 'Bu senin için.'], note: 'für + Akkusativ' },
  { word: 'an', phonetic: '/an/', pos: 'preposition', meanings: ['-de, yanında (dikey yüzey)', '(gün) -de'], example: ['Das Bild hängt an der Wand.', 'Resim duvarda asılı.'] },
  { word: 'er', phonetic: '/eːɐ̯/', pos: 'pronoun', meanings: ['O (eril)'], example: ['Er ist mein Bruder.', 'O benim erkek kardeşim.'] },
  { word: 'so', phonetic: '/zoː/', pos: 'adverb', meanings: ['Böyle, öyle', 'çok, o kadar'], example: ['Das ist so schön!', 'Bu çok güzel!'] },
  { word: 'dass', phonetic: '/das/', pos: 'conjunction', meanings: ['Ki, -dığı'], example: ['Ich glaube, dass er recht hat.', 'Bence o haklı.'], note: 'Yan cümlede çekimli fiil sona gider.' },
  { word: 'können', phonetic: '/ˈkœnən/', pos: 'verb', meanings: ['-ebilmek, -abilmek'], example: ['Kannst du mir helfen?', 'Bana yardım edebilir misin?'], note: 'kann, kannst, kann, können, könnt, können' },
  { word: 'dieser', phonetic: '/ˈdiːzɐ/', pos: 'pronoun', meanings: ['Bu'], example: ['Dieser Film ist langweilig.', 'Bu film sıkıcı.'], note: 'dieser / diese / dieses' },
  { word: 'als', phonetic: '/als/', pos: 'conjunction', meanings: ['Olarak', '-den (karşılaştırma)', '-dığında (geçmiş)'], example: ['Er ist größer als ich.', 'O benden uzun.'] },
  { word: 'ihr', phonetic: '/iːɐ̯/', pos: 'pronoun', meanings: ['Siz (samimi, çoğul)', 'onun (dişil)'], example: ['Habt ihr Hunger?', 'Acıktınız mı?'] },
  { word: 'ja', phonetic: '/jaː/', pos: 'particle', meanings: ['Evet', '(vurgu) ya, işte'], example: ['Ja, gerne!', 'Evet, memnuniyetle!'] },
  { word: 'wie', phonetic: '/viː/', pos: 'adverb', meanings: ['Nasıl', 'gibi'], example: ['Wie heißt du?', 'Adın ne?'] },
  { word: 'bei', phonetic: '/baɪ̯/', pos: 'preposition', meanings: ['Yanında, -de', 'sırasında'], example: ['Ich wohne bei meinen Eltern.', 'Ailemin yanında oturuyorum.'], note: 'bei + Dativ' },
  { word: 'oder', phonetic: '/ˈoːdɐ/', pos: 'conjunction', meanings: ['Veya, ya da'], example: ['Tee oder Kaffee?', 'Çay mı kahve mi?'] },
];

const RU: SampleEntry[] = [
  { word: 'и', phonetic: '[i]', pos: 'conjunction', meanings: ['Ve', 'de, da'], example: ['Мама и папа дома.', 'Annem ve babam evde.'] },
  { word: 'в', phonetic: '[v]', pos: 'preposition', meanings: ['-de, içinde', '-e, içine'], example: ['Я живу в Москве.', "Moskova'da yaşıyorum."], note: 'Yer: bulunma hâli, yön: belirtme hâli.' },
  { word: 'не', phonetic: '[nʲe]', pos: 'particle', meanings: ['Değil', 'olumsuzluk (-me, -ma)'], example: ['Я не знаю.', 'Bilmiyorum.'] },
  { word: 'на', phonetic: '[na]', pos: 'preposition', meanings: ['Üzerinde, -de', 'üzerine, -e'], example: ['Книга на столе.', 'Kitap masanın üstünde.'] },
  { word: 'я', phonetic: '[ja]', pos: 'pronoun', meanings: ['Ben'], example: ['Я студент.', 'Ben öğrenciyim.'] },
  { word: 'быть', phonetic: '[bɨtʲ]', pos: 'verb', meanings: ['Olmak'], example: ['Завтра я буду дома.', 'Yarın evde olacağım.'], note: 'Şimdiki zamanda genelde düşer: Я студент.' },
  { word: 'он', phonetic: '[on]', pos: 'pronoun', meanings: ['O (eril)'], example: ['Он мой брат.', 'O benim erkek kardeşim.'] },
  { word: 'с', phonetic: '[s]', pos: 'preposition', meanings: ['İle, birlikte', '-den (yüzeyden)'], example: ['Я пью чай с молоком.', 'Sütlü çay içiyorum.'] },
  { word: 'что', phonetic: '[ʂto]', pos: 'pronoun', meanings: ['Ne', 'ki (bağlaç olarak)'], example: ['Что это?', 'Bu ne?'], note: '"şto" diye okunur.' },
  { word: 'а', phonetic: '[a]', pos: 'conjunction', meanings: ['İse, ama (karşıtlık)'], example: ['Я врач, а она учитель.', 'Ben doktorum, o ise öğretmen.'] },
  { word: 'по', phonetic: '[po]', pos: 'preposition', meanings: ['Boyunca, üzerinde', 'ile (iletişim)', '-e göre'], example: ['Мы говорим по телефону.', 'Telefonla konuşuyoruz.'] },
  { word: 'это', phonetic: '[ˈɛtə]', pos: 'pronoun', meanings: ['Bu (… dır)'], example: ['Это мой дом.', 'Bu benim evim.'] },
  { word: 'она', phonetic: '[ɐˈna]', pos: 'pronoun', meanings: ['O (dişil)'], example: ['Она очень умная.', 'O çok zeki.'] },
  { word: 'этот', phonetic: '[ˈɛtət]', pos: 'pronoun', meanings: ['Bu (isimden önce)'], example: ['Этот фильм интересный.', 'Bu film ilginç.'], note: 'этот / эта / это / эти' },
  { word: 'к', phonetic: '[k]', pos: 'preposition', meanings: ['-e doğru', '-in yanına'], example: ['Я иду к врачу.', 'Doktora gidiyorum.'], note: 'к + yönelme hâli (dative)' },
  { word: 'но', phonetic: '[no]', pos: 'conjunction', meanings: ['Ama, fakat'], example: ['Я устал, но счастлив.', 'Yorgunum ama mutluyum.'] },
  { word: 'они', phonetic: '[ɐˈnʲi]', pos: 'pronoun', meanings: ['Onlar'], example: ['Они живут в Казани.', "Onlar Kazan'da yaşıyor."] },
  { word: 'мы', phonetic: '[mɨ]', pos: 'pronoun', meanings: ['Biz'], example: ['Мы идём в кино.', 'Sinemaya gidiyoruz.'] },
  { word: 'как', phonetic: '[kak]', pos: 'adverb', meanings: ['Nasıl', 'gibi'], example: ['Как тебя зовут?', 'Adın ne?'] },
  { word: 'из', phonetic: '[is]', pos: 'preposition', meanings: ['-den (içinden)'], example: ['Я из Турции.', "Türkiye'denim."], note: 'из + -in hâli (genitive)' },
  { word: 'у', phonetic: '[u]', pos: 'preposition', meanings: ['Yanında', 'sahiplik: -in … var'], example: ['У меня есть машина.', 'Benim bir arabam var.'], note: 'у + -in hâli (genitive)' },
  { word: 'который', phonetic: '[kɐˈtorɨj]', pos: 'pronoun', meanings: ['Ki o, -en/-an (ilgi zamiri)', 'hangi'], example: ['Это книга, которую я читаю.', 'Bu okuduğum kitap.'] },
  { word: 'то', phonetic: '[to]', pos: 'pronoun', meanings: ['O, şu'], example: ['То, что ты сказал, правда.', 'Söylediğin şey doğru.'] },
  { word: 'за', phonetic: '[za]', pos: 'preposition', meanings: ['Arkasında', 'için, karşılığında'], example: ['Спасибо за помощь!', 'Yardımın için teşekkürler!'] },
  { word: 'свой', phonetic: '[svoj]', pos: 'pronoun', meanings: ['Kendi'], example: ['Он любит свою работу.', 'O kendi işini seviyor.'] },
  { word: 'весь', phonetic: '[vʲesʲ]', pos: 'pronoun', meanings: ['Bütün, tüm'], example: ['Я работал весь день.', 'Bütün gün çalıştım.'], note: 'весь / вся / всё / все' },
  { word: 'год', phonetic: '[ɡot]', pos: 'noun', meanings: ['Yıl'], example: ['С Новым годом!', 'Yeni yılın kutlu olsun!'] },
  { word: 'от', phonetic: '[ot]', pos: 'preposition', meanings: ['-den (kişiden, kaynaktan)'], example: ['Это письмо от друга.', 'Bu bir arkadaştan gelen mektup.'] },
  { word: 'так', phonetic: '[tak]', pos: 'adverb', meanings: ['Böyle, öyle', 'çok, o kadar'], example: ['Я так рада тебя видеть!', 'Seni gördüğüme çok sevindim!'] },
  { word: 'о', phonetic: '[o]', pos: 'preposition', meanings: ['Hakkında'], example: ['Мы говорим о погоде.', 'Hava hakkında konuşuyoruz.'], note: 'о + bulunma hâli (prepositional)' },
];

const SAMPLE_WORDS: Record<DictionaryLanguage, WordItem[]> = {
  en: buildSamples('en', EN),
  de: buildSamples('de', DE),
  ru: buildSamples('ru', RU),
};

export function getSampleWords(language: DictionaryLanguage): WordItem[] {
  return SAMPLE_WORDS[language];
}

export const ALL_SAMPLE_WORDS: WordItem[] = [...SAMPLE_WORDS.en, ...SAMPLE_WORDS.de, ...SAMPLE_WORDS.ru];
