import React, { useState } from 'react';
import {
  X,
  Github,
  Download,
  Upload,
  FileText,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { DictionaryLanguage, WordItem } from '../types/dictionary.ts';
import { LANGUAGES } from '../data/languages.ts';
import {
  exportToCsv,
  exportToJson,
  exportToMarkdown,
  importFromJson,
} from '../utils/dictionary.ts';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
  onImportWords: (newWords: WordItem[]) => void;
  onResetToDefaults: () => void;
  language: DictionaryLanguage;
  /** Guests can only export; importing and resetting need an account. */
  readOnly: boolean;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  words,
  onImportWords,
  onResetToDefaults,
  language,
  readOnly,
}) => {
  const lang = LANGUAGES[language];
  const [activeTab, setActiveTab] = useState<'deploy' | 'export' | 'import' | 'reset'>('deploy');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [pasteJsonInput, setPasteJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const md = exportToMarkdown(words, language);
    downloadFile(md, `VOCABULARY_${language.toUpperCase()}.md`, 'text/markdown;charset=utf-8;');
  };

  const handleDownloadJson = () => {
    const jsonStr = exportToJson(words);
    downloadFile(jsonStr, `lexinote-${language}-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleDownloadCsv = () => {
    const csvStr = exportToCsv(words);
    downloadFile(csvStr, `vocabulary_${language}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processImport(content);
    };
    reader.readAsText(file);
  };

  const processImport = (jsonStr: string) => {
    const res = importFromJson(jsonStr, language);
    if (res.success && res.data) {
      onImportWords(res.data);
      setImportStatus({
        success: true,
        message: `Başarılı! ${res.data.length} kelime ${lang.name} sözlüğüne aktarıldı.`,
      });
      setPasteJsonInput('');
    } else {
      setImportStatus({
        success: false,
        message: res.error || 'İçe aktarma başarısız oldu.',
      });
    }
  };

  const gitCommands = `# 1. Proje dizininde git başlatın:
git init
git add .
git commit -m "feat: kişisel sözlüğüm ilk sürüm"
git branch -M main

# 2. GitHub reponuzu bağlayıp push edin:
git remote add origin https://github.com/<KULLANICI_ADINIZ>/<REPO_ADINIZ>.git
git push -u origin main`;

  const workflowPreview = `name: Deploy to GitHub Pages
on:
  push:
    branches: ['main']
  workflow_dispatch:
# Projenizdeki .github/workflows/deploy.yml dosyası
# otomatik olarak GitHub Pages'e derleyip yayınlar.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-stone-900 dark:text-stone-100" />
            <h2 className="font-editorial text-lg font-bold">
              GitHub Pages & Yedekleme Merkezi
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Navigation */}
        <div className="px-6 pt-3 border-b border-stone-100 dark:border-stone-800 flex gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            🚀 GitHub Pages Rehberi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            📥 Dışa Aktar (MD & JSON & CSV)
          </button>
          {!readOnly && (
            <>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'import'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              📤 İçe Aktar / Geri Yükle
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reset')}
              className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'reset'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              🔄 Sıfırla
            </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed">
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                    GitHub Pages Ön Hazırlıkları Tamamlandı!
                  </div>
                  <div className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Projeniz GitHub Pages için özel olarak yapılandırıldı. <code className="font-mono bg-emerald-100/60 dark:bg-emerald-900/60 px-1 rounded">base: './'</code> ve <code className="font-mono bg-emerald-100/60 dark:bg-emerald-900/60 px-1 rounded">.github/workflows/deploy.yml</code> dosyanız hazır.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  3 Adımda GitHub'da Yayına Alın:
                </h3>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-1.5">
                  <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[10px] flex items-center justify-center font-bold">1</span>
                    GitHub'da Yeni Bir Repository Açın
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 pl-5.5">
                    github.com adresine gidip yeni bir repository oluşturun (örnek: <code>dictionary</code>).
                  </p>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[10px] flex items-center justify-center font-bold">2</span>
                      Terminal Üzerinden Projenizi Push Edin
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('git', gitCommands)}
                      className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedSection === 'git' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Komutları Kopyala
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-stone-900 text-stone-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {gitCommands}
                  </pre>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-1.5">
                  <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[10px] flex items-center justify-center font-bold">3</span>
                    Pages Ayarını Aktif Edin
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 pl-5.5">
                    Reponuzda <strong>Settings → Pages → Build and deployment → Source</strong> kısmında <strong>"GitHub Actions"</strong> seçeneğini işaretleyin. Otomatik olarak derlenip yayına girecektir!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-stone-600 dark:text-stone-400">
                Kişisel sözlüğünüzdeki tüm kelimeleri, anlamları ve örnek cümleleri istediğiniz formatta indirebilir ve yedekleyebilirsiniz:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Markdown Export */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                      VOCABULARY.md
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      GitHub reponuza ekleyebileceğiniz hazır Markdown sözlük dokümanı.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg font-medium text-xs hover:bg-stone-800 dark:hover:bg-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> MD İndir
                  </button>
                </div>

                {/* JSON Export */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-2">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                      lexinote-backup.json
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Tüm istatistikleri ve ilerlemeyi içeren tam veri yedeği.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg font-medium text-xs hover:bg-stone-800 dark:hover:bg-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> JSON İndir
                  </button>
                </div>

                {/* CSV Export */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                      vocabulary.csv
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Excel veya Anki kartlarına aktarım için virgülle ayrılmış tablo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg font-medium text-xs hover:bg-stone-800 dark:hover:bg-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV İndir
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && !readOnly && (
            <div className="space-y-4">
              <p className="text-stone-600 dark:text-stone-400">
                Daha önce yedeklediğiniz bir <code className="font-mono">.json</code> dosyasını yükleyin veya JSON metnini yapıştırın. Kelimeler <strong>{lang.name}</strong> sözlüğüne eklenir; aynı kimlikteki kayıtlar güncellenir, diğerleri silinmez.
              </p>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    importStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}
                >
                  {importStatus.message}
                </div>
              )}

              {/* File Upload Option */}
              <div className="p-4 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl text-center space-y-2">
                <Upload className="w-6 h-6 mx-auto text-stone-400" />
                <div className="text-stone-700 dark:text-stone-300 font-medium">
                  Yedek JSON Dosyasını Seçin
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block mx-auto text-xs text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white cursor-pointer"
                />
              </div>

              {/* Paste JSON Option */}
              <div className="space-y-2">
                <label className="block text-stone-700 dark:text-stone-300 font-semibold">
                  Veya JSON Metnini Buraya Yapıştırın:
                </label>
                <textarea
                  rows={4}
                  value={pasteJsonInput}
                  onChange={(e) => setPasteJsonInput(e.target.value)}
                  placeholder='[ { "word": "Resilience", "meanings": ["Dayanıklılık"], ... } ]'
                  className="w-full p-2.5 font-mono text-[11px] bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                <button
                  type="button"
                  disabled={!pasteJsonInput.trim()}
                  onClick={() => processImport(pasteJsonInput)}
                  className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-semibold text-xs hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
                >
                  Metinden İçe Aktar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reset' && !readOnly && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
                <RotateCcw className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Örnek Kelimeleri Sıfırla (Fabrika Ayarları)
              </div>
              <p className="text-amber-800 dark:text-amber-300 text-xs">
                {lang.name} sözlüğünü dilin en sık kullanılan 30 kelimesinden oluşan başlangıç listesine döndürür. Bu sözlüğe eklediğiniz kelimeler silinir; diğer dillerdeki sözlükleriniz etkilenmez. Önce "Dışa Aktar" sekmesinden yedek almanızı öneririz.
              </p>
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  onClose();
                }}
                className="px-4 py-2 bg-amber-700 text-white text-xs font-semibold rounded-xl hover:bg-amber-800 cursor-pointer shadow-xs"
              >
                Evet, Varsayılanlara Sıfırla
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {lang.name} sözlüğünde {words.length} kelime kayıtlı
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-200/60 dark:bg-stone-700 hover:bg-stone-300 rounded-lg cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
