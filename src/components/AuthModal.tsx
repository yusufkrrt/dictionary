import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(mapAuthError(err.code || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, displayName.trim());
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(mapAuthError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const mapAuthError = (codeOrMessage: string) => {
    if (codeOrMessage.includes('invalid-credential') || codeOrMessage.includes('wrong-password') || codeOrMessage.includes('user-not-found')) {
      return 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.';
    }
    if (codeOrMessage.includes('email-already-in-use')) {
      return 'Bu e-posta adresi ile kayıtlı bir hesap zaten var. Giriş yapmayı deneyin.';
    }
    if (codeOrMessage.includes('invalid-email')) {
      return 'Lütfen geçerli bir e-posta adresi giriniz.';
    }
    if (codeOrMessage.includes('weak-password')) {
      return 'Şifre çok zayıf. Lütfen en az 6 karakterli bir şifre seçin.';
    }
    if (codeOrMessage.includes('too-many-requests')) {
      return 'Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.';
    }
    return 'Giriş yapılırken bir hata oluştu: ' + codeOrMessage;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 className="font-editorial text-lg font-bold">
            {mode === 'login' ? 'Giriş Yap' : 'Yeni Hesap Oluştur'}
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Kelimeleriniz Firebase Firestore bulut veritabanında hesabınıza özel olarak saklanır ve tüm cihazlarınızla senkronize olur.
          </p>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
            <span className="text-[11px] uppercase tracking-wider text-stone-400">veya</span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">
                  Adınız / Takma Ad
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Adınız veya kullanıcı adınız"
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 pt-2"
            >
              {isLoading ? (
                <span>İşlem yapılıyor...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Giriş Yap</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Hesap Oluştur</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="pt-2 text-center text-xs text-stone-500">
            {mode === 'login' ? (
              <span>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-stone-900 dark:text-stone-100 font-semibold hover:underline cursor-pointer"
                >
                  Kayıt Olun
                </button>
              </span>
            ) : (
              <span>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-stone-900 dark:text-stone-100 font-semibold hover:underline cursor-pointer"
                >
                  Giriş Yapın
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
