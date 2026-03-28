import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isBlogPage, setIsBlogPage] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsAdminPage(router.pathname.startsWith('/admin'));
    setIsBlogPage(router.pathname === '/blog');
    setIsHomePage(router.pathname === '/');
  }, [router.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  const desktopRight = isAdminPage && isAuthenticated ? (
    <button
      onClick={logout}
      className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
    >
      <LogOut className="h-5 w-5" />
      <span>Sign Out</span>
    </button>
  ) : isBlogPage ? (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4 py-2 rounded-xl bg-[#0a1128] border border-[#1a263f] text-gray-400 text-base focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
    </div>
  ) : isHomePage ? (
    <Link href="/blog" className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[#1f2c47] text-white hover:bg-[#293955] transition-colors">
      <span>Blog</span>
    </Link>
  ) : null;

  return (
    <nav className="bg-[#0a1128] text-white py-3.5 px-4">
      <div className="max-w-[1325px] mx-auto flex justify-between items-center h-11">
        <Link href="/" className="text-3xl font-idealy relative top-[2px]">
          NgJaBach
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center space-x-6">
          {desktopRight}
          {isAuthenticated && !isAdminPage && (
            <Link href="/admin" className="text-l font-normal text-gray-300 hover:text-white">
              Admin
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-md hover:bg-[#1f2c47] transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden max-w-[1325px] mx-auto mt-3 pb-3 space-y-2 border-t border-[#1a263f] pt-3">
          {isBlogPage && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0a1128] border border-[#1a263f] text-gray-400 text-base focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          )}
          {isAdminPage && isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          ) : isHomePage ? (
            <Link href="/blog" className="block px-4 py-2 rounded-md bg-[#1f2c47] text-white hover:bg-[#293955] transition-colors text-center">
              Blog
            </Link>
          ) : null}
          {isAuthenticated && !isAdminPage && (
            <Link href="/admin" className="block px-1 py-1 text-gray-300 hover:text-white text-sm">
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
