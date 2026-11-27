import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// The session itself lives in an httpOnly cookie that JavaScript cannot read;
// this context only remembers what the server said about it.
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  status: AuthStatus;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  // Call when an API request returns 401 (session expired or revoked).
  handleUnauthorized: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const router = useRouter();

  useEffect(() => {
    // Older versions kept the token in localStorage, where any script could read it.
    try {
      localStorage.removeItem('token');
    } catch {
      // Storage unavailable; nothing to clean up.
    }

    let cancelled = false;
    axios
      .get('/api/auth/me')
      .then(() => !cancelled && setStatus('authenticated'))
      .catch(() => !cancelled && setStatus('unauthenticated'));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    setStatus('authenticated');
    router.push('/admin');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // The cookie is cleared server-side when reachable; the UI logs out regardless.
    } finally {
      // Leave the admin page first, so its "go to login" redirect doesn't fire.
      await router.push('/');
      setStatus('unauthenticated');
    }
  }, [router]);

  const handleUnauthorized = useCallback(() => {
    setStatus('unauthenticated');
    router.replace('/admin/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ status, isAuthenticated: status === 'authenticated', login, logout, handleUnauthorized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// For admin pages: sends logged-out visitors to the login page.
export const useRequireAuth = () => {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (auth.status === 'unauthenticated') router.replace('/admin/login');
  }, [auth.status, router]);
  return auth;
};
