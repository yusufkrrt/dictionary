# 📖 LexiNote - Minimalist Kişisel İngilizce Sözlük & Kelime Defteri

Öğrendiğiniz İngilizce kelimeleri, anlamlarını, telaffuzlarını ve örnek cümlelerini düzenli olarak kaydedip pratik yapabileceğiniz minimalist web uygulaması.

Tamamen istemci tarafında çalışır. Giriş yapmadan veriler tarayıcıda (`localStorage`) tutulur; giriş yapıldığında Firebase (Firestore) ile cihazlar arasında senkronize edilir. **GitHub Pages** üzerinde yayınlanır.

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

- **Kelime & Anlam Kaydı:** Kelime, fonetik telaffuz, kelime türü (isim, fiil, sıfat, deyim vb.), CEFR seviyesi (A1-C2).
- **Zengin Örnek Cümleler:** Her kelime için birden fazla İngilizce örnek cümle ve Türkçe çeviri.
- **Sesli Telaffuz (TTS):** Web Speech API ile İngilizce anadili telaffuzunu anında dinleyin.
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
