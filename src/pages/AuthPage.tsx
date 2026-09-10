import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fn = mode === 'login' ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 dark:bg-sand-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center shadow-sm overflow-hidden mb-3">
            <img src="/Design_sem_nome__1_-removebg-preview.png" alt="CLARITY" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-sand-900 dark:text-white">CLARITY</h1>
          <p className="text-sm text-sand-400 mt-1">{t('organizeLife')}</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-1 p-1 mb-6 rounded-xl bg-sand-100 dark:bg-sand-800/60">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-sand-900 text-sand-900 dark:text-white shadow-sm'
                  : 'text-sand-500 dark:text-sand-400'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-white dark:bg-sand-900 text-sand-900 dark:text-white shadow-sm'
                  : 'text-sand-500 dark:text-sand-400'
              }`}
            >
              {t('signup')}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-sand-500 dark:text-sand-400 mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300 dark:text-sand-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="voce@email.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-sand-50 dark:bg-sand-800/60 border border-sand-200 dark:border-sand-700 text-sm text-sand-900 dark:text-white placeholder:text-sand-300 dark:placeholder:text-sand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-sand-500 dark:text-sand-400 mb-1.5">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300 dark:text-sand-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-sand-50 dark:bg-sand-800/60 border border-sand-200 dark:border-sand-700 text-sm text-sand-900 dark:text-white placeholder:text-sand-300 dark:placeholder:text-sand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                t('login')
              ) : (
                t('createAccount')
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-sand-400 mt-4">{t('authSubtitle')}</p>
      </div>
    </div>
  );
}
