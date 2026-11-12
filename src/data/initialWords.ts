import type { DictionaryLanguage, PartOfSpeech, WordItem } from '../types/dictionary.ts';

/**
 * Starter content: 30 core vocabulary words per language (10 nouns, 12 verbs, 8 adjectives),
 * picked from the most frequent content words of each language. Function words are left out.
 */

interface SampleEntry {
  word: string;
  phonetic?: string;
  pos: PartOfSpeech;
  meanings: string[];
  example: [sentence: string, translation: string];
  note?: string;
}

const SAMPLE_TAGS = ['Temel 30'];
const SAMPLE_BASE_TIME = Date.UTC(2026, 10, 1);

function buildSamples(language: DictionaryLanguage, entries: SampleEntry[]): WordItem[] {
  return entries.map((entry, index) => {
    const order = index + 1;
    // Older timestamps for later entries, so the default "newest first" sort keeps the list order.
    const timestamp = new Date(SAMPLE_BASE_TIME + (entries.length - order) * 60_000).toISOString();
    return {
      id: `sample_${language}_${order}`,
      language,
      word: entry.word,
      phonetic: entry.phonetic,
      partOfSpeech: entry.pos,
      cefrLevel: 'A1',
      meanings: entry.meanings,
      examples: [{ id: `ex_${language}_${order}`, en: entry.example[0], tr: entry.example[1] }],
      synonyms: [],
      antonyms: [],
      tags: SAMPLE_TAGS,
      personalNote: entry.note,
      status: 'new',
      reviewCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      favorite: false,
    };
  });
}

const EN: SampleEntry[] = [
  // Nouns
  { word: 'time', phonetic: '/taɪm/', pos: 'noun', meanings: ['Zaman, vakit', 'kez, sefer'], example: ["I don't have time today.", 'Bugün vaktim yok.'], note: 'What time is it? = Saat kaç?' },
  { word: 'people', phonetic: '/ˈpiːpl/', pos: 'noun', meanings: ['İnsanlar', 'halk'], example: ['Many people live in this city.', 'Bu şehirde çok insan yaşıyor.'], note: '"person" kelimesinin çoğulu olarak kullanılır.' },
  { word: 'year', phonetic: '/jɪə/', pos: 'noun', meanings: ['Yıl, sene'], example: ['I moved here last year.', 'Geçen yıl buraya taşındım.'] },
  { word: 'day', phonetic: '/deɪ/', pos: 'noun', meanings: ['Gün'], example: ['Have a nice day!', 'İyi günler!'] },
  { word: 'life', phonetic: '/laɪf/', pos: 'noun', meanings: ['Hayat, yaşam'], example: ['Life is beautiful.', 'Hayat güzel.'], note: 'Çoğulu: lives' },
  { word: 'man', phonetic: '/mæn/', pos: 'noun', meanings: ['Adam, erkek'], example: ['That man is my teacher.', 'O adam benim öğretmenim.'], note: 'Çoğulu: men' },
  { word: 'woman', phonetic: '/ˈwʊmən/', pos: 'noun', meanings: ['Kadın'], example: ['The woman is reading a book.', 'Kadın kitap okuyor.'], note: 'Çoğulu: women /ˈwɪmɪn/' },
  { word: 'child', phonetic: '/tʃaɪld/', pos: 'noun', meanings: ['Çocuk'], example: ['They have one child.', 'Bir çocukları var.'], note: 'Çoğulu: children' },
  { word: 'world', phonetic: '/wɜːld/', pos: 'noun', meanings: ['Dünya'], example: ['She wants to travel around the world.', 'Dünyayı gezmek istiyor.'] },
  { word: 'house', phonetic: '/haʊs/', pos: 'noun', meanings: ['Ev'], example: ['Their house has a big garden.', 'Evlerinin büyük bir bahçesi var.'], note: '"home" ise yuva, insanın kendi evi anlamında.' },
  // Verbs
  { word: 'say', phonetic: '/seɪ/', pos: 'verb', meanings: ['Söylemek, demek'], example: ['What did you say?', 'Ne dedin?'], note: 'say – said – said' },
  { word: 'get', phonetic: '/ɡet/', pos: 'verb', meanings: ['Almak, elde etmek', 'olmak (get tired)', 'varmak (get home)'], example: ['I got a message from her.', 'Ondan bir mesaj aldım.'], note: 'get – got – got / gotten' },
  { word: 'make', phonetic: '/meɪk/', pos: 'verb', meanings: ['Yapmak, üretmek', 'hazırlamak'], example: ["I'll make some tea.", 'Biraz çay yapacağım.'], note: 'make – made – made' },
  { word: 'go', phonetic: '/ɡəʊ/', pos: 'verb', meanings: ['Gitmek'], example: ["Let's go home.", 'Hadi eve gidelim.'], note: 'go – went – gone' },
  { word: 'know', phonetic: '/nəʊ/', pos: 'verb', meanings: ['Bilmek', 'tanımak'], example: ['Do you know her?', 'Onu tanıyor musun?'], note: 'know – knew – known' },
  { word: 'take', phonetic: '/teɪk/', pos: 'verb', meanings: ['Almak, götürmek', '(zaman) sürmek'], example: ['It takes ten minutes.', 'On dakika sürüyor.'], note: 'take – took – taken' },
  { word: 'see', phonetic: '/siː/', pos: 'verb', meanings: ['Görmek', 'anlamak (I see)'], example: ['I can see the sea from here.', 'Buradan denizi görebiliyorum.'], note: 'see – saw – seen' },
  { word: 'come', phonetic: '/kʌm/', pos: 'verb', meanings: ['Gelmek'], example: ['Come here, please.', 'Buraya gel lütfen.'], note: 'come – came – come' },
  { word: 'think', phonetic: '/θɪŋk/', pos: 'verb', meanings: ['Düşünmek', 'sanmak'], example: ["I think you're right.", 'Bence haklısın.'], note: 'think – thought – thought' },
  { word: 'want', phonetic: '/wɒnt/', pos: 'verb', meanings: ['İstemek'], example: ['I want a cup of coffee.', 'Bir fincan kahve istiyorum.'] },
  { word: 'give', phonetic: '/ɡɪv/', pos: 'verb', meanings: ['Vermek'], example: ['Can you give me your number?', 'Bana numaranı verebilir misin?'], note: 'give – gave – given' },
  { word: 'find', phonetic: '/faɪnd/', pos: 'verb', meanings: ['Bulmak'], example: ["I can't find my keys.", 'Anahtarlarımı bulamıyorum.'], note: 'find – found – found' },
  // Adjectives
  { word: 'good', phonetic: '/ɡʊd/', pos: 'adjective', meanings: ['İyi, güzel'], example: ['This is a good idea.', 'Bu iyi bir fikir.'], note: 'good – better – best' },
  { word: 'new', phonetic: '/njuː/', pos: 'adjective', meanings: ['Yeni'], example: ['I bought a new phone.', 'Yeni bir telefon aldım.'] },
  { word: 'old', phonetic: '/əʊld/', pos: 'adjective', meanings: ['Eski', 'yaşlı'], example: ['How old are you?', 'Kaç yaşındasın?'] },
  { word: 'big', phonetic: '/bɪɡ/', pos: 'adjective', meanings: ['Büyük'], example: ['They live in a big city.', 'Büyük bir şehirde yaşıyorlar.'] },
  { word: 'small', phonetic: '/smɔːl/', pos: 'adjective', meanings: ['Küçük'], example: ['We have a small flat.', 'Küçük bir dairemiz var.'] },
  { word: 'long', phonetic: '/lɒŋ/', pos: 'adjective', meanings: ['Uzun'], example: ['It was a long day.', 'Uzun bir gündü.'] },
  { word: 'great', phonetic: '/ɡreɪt/', pos: 'adjective', meanings: ['Harika, muhteşem', 'büyük'], example: ['We had a great time.', 'Çok güzel vakit geçirdik.'] },
  { word: 'important', phonetic: '/ɪmˈpɔːtnt/', pos: 'adjective', meanings: ['Önemli'], example: ['This is very important.', 'Bu çok önemli.'] },
];

const DE: SampleEntry[] = [
  // Nouns
  { word: 'die Zeit', phonetic: '/t͡saɪ̯t/', pos: 'noun', meanings: ['Zaman, vakit'], example: ['Ich habe keine Zeit.', 'Vaktim yok.'], note: 'Çoğulu: die Zeiten' },
  { word: 'das Jahr', phonetic: '/jaːɐ̯/', pos: 'noun', meanings: ['Yıl'], example: ['Ich lerne seit einem Jahr Deutsch.', 'Bir yıldır Almanca öğreniyorum.'], note: 'Çoğulu: die Jahre' },
  { word: 'der Mensch', phonetic: '/mɛnʃ/', pos: 'noun', meanings: ['İnsan'], example: ['Er ist ein guter Mensch.', 'O iyi bir insan.'], note: 'Çoğulu: die Menschen' },
  { word: 'der Tag', phonetic: '/taːk/', pos: 'noun', meanings: ['Gün'], example: ['Guten Tag!', 'İyi günler!'], note: 'Çoğulu: die Tage' },
  { word: 'das Leben', phonetic: '/ˈleːbn̩/', pos: 'noun', meanings: ['Hayat, yaşam'], example: ['Das Leben ist schön.', 'Hayat güzel.'] },
  { word: 'der Mann', phonetic: '/man/', pos: 'noun', meanings: ['Adam, erkek', 'koca'], example: ['Der Mann liest eine Zeitung.', 'Adam gazete okuyor.'], note: 'Çoğulu: die Männer' },
  { word: 'die Frau', phonetic: '/fʁaʊ̯/', pos: 'noun', meanings: ['Kadın', 'eş, karı', 'Bayan (hitap)'], example: ['Meine Frau ist Ärztin.', 'Eşim doktor.'], note: 'Çoğulu: die Frauen' },
  { word: 'das Kind', phonetic: '/kɪnt/', pos: 'noun', meanings: ['Çocuk'], example: ['Die Kinder spielen im Garten.', 'Çocuklar bahçede oynuyor.'], note: 'Çoğulu: die Kinder' },
  { word: 'die Welt', phonetic: '/vɛlt/', pos: 'noun', meanings: ['Dünya'], example: ['Er reist um die ganze Welt.', 'Bütün dünyayı geziyor.'] },
  { word: 'das Haus', phonetic: '/haʊ̯s/', pos: 'noun', meanings: ['Ev'], example: ['Ich bin zu Hause.', 'Evdeyim.'], note: 'Çoğulu: die Häuser · zu Hause = evde, nach Hause = eve' },
  // Verbs
  { word: 'sagen', phonetic: '/ˈzaːɡn̩/', pos: 'verb', meanings: ['Söylemek, demek'], example: ['Was hast du gesagt?', 'Ne dedin?'], note: 'sagte – hat gesagt' },
  { word: 'machen', phonetic: '/ˈmaxn̩/', pos: 'verb', meanings: ['Yapmak'], example: ['Was machst du heute?', 'Bugün ne yapıyorsun?'], note: 'machte – hat gemacht' },
  { word: 'gehen', phonetic: '/ˈɡeːən/', pos: 'verb', meanings: ['Gitmek (yürüyerek)'], example: ['Wir gehen ins Kino.', 'Sinemaya gidiyoruz.'], note: 'ging – ist gegangen · Wie geht es dir? = Nasılsın?' },
  { word: 'wissen', phonetic: '/ˈvɪsn̩/', pos: 'verb', meanings: ['Bilmek'], example: ['Ich weiß es nicht.', 'Bilmiyorum.'], note: 'weiß, weißt, weiß – wusste – hat gewusst' },
  { word: 'kommen', phonetic: '/ˈkɔmən/', pos: 'verb', meanings: ['Gelmek'], example: ['Woher kommst du?', 'Nerelisin?'], note: 'kam – ist gekommen' },
  { word: 'sehen', phonetic: '/ˈzeːən/', pos: 'verb', meanings: ['Görmek'], example: ['Siehst du das Auto?', 'Arabayı görüyor musun?'], note: 'sieht – sah – hat gesehen' },
  { word: 'geben', phonetic: '/ˈɡeːbn̩/', pos: 'verb', meanings: ['Vermek'], example: ['Kannst du mir das Salz geben?', 'Bana tuzu verebilir misin?'], note: 'gibt – gab – hat gegeben · es gibt = var' },
  { word: 'nehmen', phonetic: '/ˈneːmən/', pos: 'verb', meanings: ['Almak', '(ulaşım aracına) binmek'], example: ['Ich nehme den Bus.', 'Otobüse biniyorum.'], note: 'nimmt – nahm – hat genommen' },
  { word: 'finden', phonetic: '/ˈfɪndn̩/', pos: 'verb', meanings: ['Bulmak', '(fikir) bulmak, düşünmek'], example: ['Ich finde meinen Schlüssel nicht.', 'Anahtarımı bulamıyorum.'], note: 'fand – hat gefunden · Wie findest du das? = Bunu nasıl buluyorsun?' },
  { word: 'denken', phonetic: '/ˈdɛŋkn̩/', pos: 'verb', meanings: ['Düşünmek'], example: ['Ich denke oft an dich.', 'Seni sık sık düşünüyorum.'], note: 'dachte – hat gedacht · denken an + Akkusativ' },
  { word: 'sprechen', phonetic: '/ˈʃpʁɛçn̩/', pos: 'verb', meanings: ['Konuşmak'], example: ['Sprechen Sie Türkisch?', 'Türkçe konuşuyor musunuz?'], note: 'spricht – sprach – hat gesprochen' },
  { word: 'arbeiten', phonetic: '/ˈaʁbaɪ̯tn̩/', pos: 'verb', meanings: ['Çalışmak'], example: ['Sie arbeitet in einer Bank.', 'Bir bankada çalışıyor.'], note: 'arbeitete – hat gearbeitet' },
  // Adjectives
  { word: 'gut', phonetic: '/ɡuːt/', pos: 'adjective', meanings: ['İyi'], example: ['Das Essen ist sehr gut.', 'Yemek çok iyi.'], note: 'gut – besser – am besten' },
  { word: 'neu', phonetic: '/nɔɪ̯/', pos: 'adjective', meanings: ['Yeni'], example: ['Ich habe ein neues Handy.', 'Yeni bir telefonum var.'] },
  { word: 'alt', phonetic: '/alt/', pos: 'adjective', meanings: ['Eski', 'yaşlı'], example: ['Wie alt bist du?', 'Kaç yaşındasın?'], note: 'alt – älter – am ältesten' },
  { word: 'groß', phonetic: '/ɡʁoːs/', pos: 'adjective', meanings: ['Büyük', 'uzun boylu'], example: ['Berlin ist eine große Stadt.', 'Berlin büyük bir şehir.'], note: 'groß – größer – am größten' },
  { word: 'klein', phonetic: '/klaɪ̯n/', pos: 'adjective', meanings: ['Küçük', 'kısa boylu'], example: ['Wir haben eine kleine Wohnung.', 'Küçük bir dairemiz var.'] },
  { word: 'lang', phonetic: '/laŋ/', pos: 'adjective', meanings: ['Uzun'], example: ['Der Film war zu lang.', 'Film çok uzundu.'], note: 'lang – länger – am längsten' },
  { word: 'wichtig', phonetic: '/ˈvɪçtɪç/', pos: 'adjective', meanings: ['Önemli'], example: ['Das ist sehr wichtig.', 'Bu çok önemli.'] },
  { word: 'schön', phonetic: '/ʃøːn/', pos: 'adjective', meanings: ['Güzel'], example: ['Was für ein schöner Tag!', 'Ne güzel bir gün!'] },
];

const RU: SampleEntry[] = [
  // Nouns
  { word: 'время', phonetic: '[ˈvrʲemʲə]', pos: 'noun', meanings: ['Zaman, vakit'], example: ['У меня нет времени.', 'Vaktim yok.'], note: 'Nötr isim · -in hâli: времени' },
  { word: 'год', phonetic: '[ɡot]', pos: 'noun', meanings: ['Yıl'], example: ['Я живу здесь два года.', 'İki yıldır burada yaşıyorum.'], note: '5 ve üstü sayılarla: пять лет' },
  { word: 'человек', phonetic: '[t͡ɕɪlɐˈvʲek]', pos: 'noun', meanings: ['İnsan, kişi'], example: ['Он хороший человек.', 'O iyi bir insan.'], note: 'Çoğulu: люди' },
  { word: 'день', phonetic: '[dʲenʲ]', pos: 'noun', meanings: ['Gün'], example: ['Хорошего дня!', 'İyi günler!'], note: 'Eril · çoğulu: дни' },
  { word: 'жизнь', phonetic: '[ʐɨzʲnʲ]', pos: 'noun', meanings: ['Hayat, yaşam'], example: ['Такова жизнь.', 'Hayat böyle.'], note: 'Dişil isim' },
  { word: 'мужчина', phonetic: '[mʊˈɕːinə]', pos: 'noun', meanings: ['Adam, erkek'], example: ['Этот мужчина — мой отец.', 'Bu adam benim babam.'], note: '-а ile bitmesine rağmen eril' },
  { word: 'женщина', phonetic: '[ˈʐɛnʲɕːɪnə]', pos: 'noun', meanings: ['Kadın'], example: ['Эта женщина — врач.', 'Bu kadın doktor.'] },
  { word: 'ребёнок', phonetic: '[rʲɪˈbʲɵnək]', pos: 'noun', meanings: ['Çocuk'], example: ['Ребёнок спит.', 'Çocuk uyuyor.'], note: 'Çoğulu: дети' },
  { word: 'мир', phonetic: '[mʲir]', pos: 'noun', meanings: ['Dünya', 'barış'], example: ['Он хочет увидеть весь мир.', 'Bütün dünyayı görmek istiyor.'] },
  { word: 'дом', phonetic: '[dom]', pos: 'noun', meanings: ['Ev', 'bina'], example: ['Я дома.', 'Evdeyim.'], note: 'дома = evde, домой = eve' },
  // Verbs
  { word: 'говорить', phonetic: '[ɡəvɐˈrʲitʲ]', pos: 'verb', meanings: ['Konuşmak', 'söylemek'], example: ['Вы говорите по-турецки?', 'Türkçe konuşuyor musunuz?'], note: 'говорю, говоришь · tamamlanmış: сказать' },
  { word: 'делать', phonetic: '[ˈdʲeɫətʲ]', pos: 'verb', meanings: ['Yapmak'], example: ['Что ты делаешь?', 'Ne yapıyorsun?'], note: 'делаю, делаешь · tamamlanmış: сделать' },
  { word: 'идти', phonetic: '[ɪˈtʲtʲi]', pos: 'verb', meanings: ['Gitmek (yürüyerek)'], example: ['Я иду домой.', 'Eve gidiyorum.'], note: 'иду, идёшь · geçmiş: шёл, шла' },
  { word: 'знать', phonetic: '[znatʲ]', pos: 'verb', meanings: ['Bilmek', 'tanımak'], example: ['Я не знаю, где он.', 'Onun nerede olduğunu bilmiyorum.'], note: 'знаю, знаешь' },
  { word: 'видеть', phonetic: '[ˈvʲidʲɪtʲ]', pos: 'verb', meanings: ['Görmek'], example: ['Я тебя вижу.', 'Seni görüyorum.'], note: 'вижу, видишь · tamamlanmış: увидеть' },
  { word: 'думать', phonetic: '[ˈdumətʲ]', pos: 'verb', meanings: ['Düşünmek'], example: ['Я думаю, это правда.', 'Bence bu doğru.'], note: 'думаю, думаешь · думать о + bulunma hâli' },
  { word: 'хотеть', phonetic: '[xɐˈtʲetʲ]', pos: 'verb', meanings: ['İstemek'], example: ['Я хочу кофе.', 'Kahve istiyorum.'], note: 'Düzensiz: хочу, хочешь, хочет, хотим, хотите, хотят' },
  { word: 'жить', phonetic: '[ʐɨtʲ]', pos: 'verb', meanings: ['Yaşamak', 'oturmak (ikamet)'], example: ['Где ты живёшь?', 'Nerede yaşıyorsun?'], note: 'живу, живёшь' },
  { word: 'работать', phonetic: '[rɐˈbotətʲ]', pos: 'verb', meanings: ['Çalışmak'], example: ['Она работает в банке.', 'Bir bankada çalışıyor.'], note: 'работаю, работаешь' },
  { word: 'давать', phonetic: '[dɐˈvatʲ]', pos: 'verb', meanings: ['Vermek'], example: ['Он даёт мне книгу.', 'Bana kitabı veriyor.'], note: 'даю, даёшь · tamamlanmış: дать' },
  { word: 'брать', phonetic: '[bratʲ]', pos: 'verb', meanings: ['Almak', '(taksi) tutmak'], example: ['Я беру такси.', 'Taksiye biniyorum.'], note: 'беру, берёшь · tamamlanmış: взять' },
  { word: 'понимать', phonetic: '[pənʲɪˈmatʲ]', pos: 'verb', meanings: ['Anlamak'], example: ['Я тебя не понимаю.', 'Seni anlamıyorum.'], note: 'понимаю, понимаешь · tamamlanmış: понять' },
  // Adjectives
  { word: 'хороший', phonetic: '[xɐˈroʂɨj]', pos: 'adjective', meanings: ['İyi, güzel'], example: ['Сегодня хорошая погода.', 'Bugün hava güzel.'], note: 'Zarfı: хорошо' },
  { word: 'новый', phonetic: '[ˈnovɨj]', pos: 'adjective', meanings: ['Yeni'], example: ['У меня новая машина.', 'Yeni bir arabam var.'], note: 'новый / новая / новое / новые' },
  { word: 'старый', phonetic: '[ˈstarɨj]', pos: 'adjective', meanings: ['Eski', 'yaşlı'], example: ['Это очень старый город.', 'Bu çok eski bir şehir.'] },
  { word: 'большой', phonetic: '[bɐlʲˈʂoj]', pos: 'adjective', meanings: ['Büyük'], example: ['Москва — большой город.', 'Moskova büyük bir şehir.'] },
  { word: 'маленький', phonetic: '[ˈmalʲɪnʲkʲɪj]', pos: 'adjective', meanings: ['Küçük'], example: ['У нас маленькая квартира.', 'Küçük bir dairemiz var.'] },
  { word: 'длинный', phonetic: '[ˈdlʲinːɨj]', pos: 'adjective', meanings: ['Uzun'], example: ['Это был длинный день.', 'Uzun bir gündü.'] },
  { word: 'важный', phonetic: '[ˈvaʐnɨj]', pos: 'adjective', meanings: ['Önemli'], example: ['Это очень важный вопрос.', 'Bu çok önemli bir soru.'] },
  { word: 'красивый', phonetic: '[krɐˈsʲivɨj]', pos: 'adjective', meanings: ['Güzel, yakışıklı'], example: ['Какой красивый вид!', 'Ne güzel bir manzara!'] },
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
