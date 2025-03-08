import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Set initial token
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);

    // Update token on route change
    const handleRouteChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };

    // Update token on custom storage event
    const handleStorageUpdate = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    window.addEventListener('storageUpdated', handleStorageUpdate);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('storageUpdated', handleStorageUpdate);
    };
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">My Blog</Link>
        <div className="flex space-x-4">
          {token ? (
            <>
              <span className="text-sm">ngjabach</span>
              <button
                onClick={handleSignOut}
                className="text-sm bg-red-500 px-2 py-1 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/admin" className="text-sm">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}