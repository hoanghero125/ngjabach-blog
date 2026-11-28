import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/admin');
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.post('/api/auth/login', { username, password });
      setPassword('');
      login();
    } catch (err) {
      const code = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (code === 429) setError('Too many failed attempts. Please wait 15 minutes and try again.');
      else if (code === 401 || code === 400) setError('Invalid credentials');
      else setError('Could not sign in. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center px-4 bg-bg">
      <div className="w-full max-w-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-ink mb-4">Admin</p>
        <div className="bg-surface rounded-xl shadow-sm p-8">
          {error && (
            <div role="alert" className="mb-5 px-4 py-3 rounded-lg border border-danger/40 bg-danger/10 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-[0.15em] text-faint mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input
                  type="text"
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.15em] text-faint mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  required
                  maxLength={200}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-semibold rounded-lg transition-colors mt-1 bg-accent text-on-accent hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
