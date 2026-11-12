# 📖 LexiNote - İngilizce · Almanca · Rusça Kişisel Sözlük

Öğrendiğiniz kelimeleri, anlamlarını, telaffuzlarını ve örnek cümlelerini dile göre ayrı sözlüklerde kaydedip pratik yapabileceğiniz minimalist web uygulaması.

**Canlı:** https://yusufkrrt.github.io/dictionary/

Tamamen istemci tarafında çalışır ve **GitHub Pages** üzerinde yayınlanır. Giriş yapmayan ziyaretçiler hazır başlangıç listelerini salt okunur olarak görür, dinler ve pratik yapar; hiçbir şey kaydedilmez. Kelime eklemek ve düzenlemek için giriş gerekir; her kullanıcının sözlükleri yalnızca kendi Firebase (Firestore) alanında tutulur.

---

## 🚀 Yayın (GitHub Pages)

`main` dalına yapılan her push, `.github/workflows/deploy.yml` ile otomatik olarak derlenip GitHub Pages'e yayınlanır.

Firebase ayarları repoda tutulmaz; workflow bunları **Settings → Secrets and variables → Actions** altındaki repo secret'larından okur:

| Secret | Açıklama |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web API anahtarı |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<proje>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase proje kimliği |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | Web uygulama kimliği |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Firestore veritabanı adı (boşsa `(default)`) |

> Google ile giriş için Firebase Console → Authentication → Settings → **Authorized domains** listesine `localhost` ve `<kullanici-adi>.github.io` eklenmelidir.

---

## ✨ Özellikler

- **Dile Göre Ayrı Sözlükler:** İngilizce, Almanca ve Rusça. Açılışta sözlük seçilir; eklenen her kelime seçili sözlüğe kaydedilir ve yalnızca o sözlüğün kayıtları görünür. Dil üst menüden değiştirilir.
- **Kişisel Hesap:** Giriş yapan her kullanıcının sözlükleri kendi Firestore alanında (`users/{uid}/words`) tutulur, cihazlar arasında senkronize olur. Giriş yapmayan ziyaretçiler salt okunur modda; ekleyemez, düzenleyemez, hiçbir şey kaydedilmez. Başkalarının sözlükleri hiçbir şekilde görülemez (Firestore kuralları yalnızca sahibine izin verir).
- **Başlangıç Listeleri:** Her dil için sık kullanılan 30 temel kelime (10 isim, 12 fiil, 8 sıfat); anlam, sesletim, örnek cümle, çeviri ve dile özgü notlarla (Almanca artikel/çoğul, Rusça fiil eşleri, İngilizce düzensiz fiiller).
- **Kelime & Anlam Kaydı:** Kelime, fonetik telaffuz, kelime türü (isim, fiil, sıfat, deyim vb.), CEFR seviyesi (A1-C2).
- **Zengin Örnek Cümleler:** Her kelime için birden fazla örnek cümle ve Türkçe çeviri.
- **Sesli Telaffuz (TTS):** Web Speech API ile sözlüğün dilinde (en-US, de-DE, ru-RU) telaffuz.
- **Minimalist Kartlar & Filtreler:** Seviye, kelime türü, öğrenme durumu (Yeni / Öğreniliyor / Tamamlandı) ve etiket filtreleri.
- **Flashcard & Pratik Modu:** Kart çevirme, cümle tamamlama ve akılda kalıcılık testi.
- **Yedekleme & Git Uyumluluğu:** 
  - **JSON Dışa/İçe Aktar:** Verilerinizi dilediğiniz zaman tek tıkla yedekleyin veya başka cihaza aktarın.
  - **Markdown İndir (`VOCABULARY.md`):** Kelime listenizi GitHub reponuzda şık bir doküman olarak saklayın.
  - **CSV İndir:** Anki veya Excel'e aktarın.

---

## 🛠️ Yerel Geliştirme (Localhost)

```bash
# Bağımlılıkları yükleyin
npm install

# Firebase ayarlarını girin (değerler Firebase Console > Project settings'te)
cp .env.example .env.local

# Geliştirme sunucusunu başlatın
npm run dev

# Kontroller
npm run lint && npm test && npm run build
```
Tarayıcınızda `http://localhost:3000` adresini açın.
