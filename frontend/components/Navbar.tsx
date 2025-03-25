import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    setIsAdminPage(router.pathname.startsWith('/admin'));
  }, [router.pathname, isAuthenticated]);

  return (
    <nav className="bg-[#0a1128] text-white py-3.5 px-4">
      <div className="max-w-[1325px] mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-idealy relative top-[2px]">
          NgJaBach
        </Link>
        <div className="flex items-center space-x-6">
          {isAdminPage && isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-md bg-[#0a1128] border border-[#1a263f] text-gray-400 text-base focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          )}
          <Link href="/" className="text-l font-normal text-gray-300 hover:text-white">
            Blog
          </Link>
          <Link href="/about" className="text-l font-normal text-gray-300 hover:text-white">
            About
          </Link>
          {isAuthenticated && (
            <Link href="/admin" className="text-l font-normal text-gray-300 hover:text-white">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}