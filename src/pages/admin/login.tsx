import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      login(res.data.token);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center px-4 bg-[#FAF9F6]">
      <div className="w-full max-w-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-500 mb-4">Admin</p>
        <div className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors mt-1"
              style={{ backgroundColor: '#0a1128' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1f2c47')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0a1128')}
            >
              Sign in
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
