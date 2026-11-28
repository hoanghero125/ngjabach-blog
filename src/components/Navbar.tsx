import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/research', label: 'Research' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/cv', label: 'CV' },
];

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || (href === '/blog' && pathname.startsWith('/post'));

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdminPage = router.pathname.startsWith('/admin');

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-accent-ink transition-colors hover:bg-chip"
    >
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );

  const linkClass = (active: boolean) =>
    `rounded-full px-3.5 py-2.5 text-[15px] transition-colors ${
      active ? 'bg-nav-active font-bold text-ink' : 'font-medium text-muted hover:text-ink'
    }`;

  return (
    <header className="relative z-10 border-b border-line bg-nav">
      <nav aria-label="Main" className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-6 py-2.5">
        <Link href="/" className="font-logo text-[30px] leading-none text-accent-ink">
          NgJaBach
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map(({ href, label }) => {
            const active = isActive(router.pathname, href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                {label}
              </Link>
            );
          })}
          {isAuthenticated && !isAdminPage && (
            <Link href="/admin" className={linkClass(false)}>
              Admin
            </Link>
          )}
          {isAuthenticated && isAdminPage && (
            <button
              type="button"
              onClick={logout}
              className="ml-1 inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[15px] font-semibold text-danger hover:bg-chip"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
          <span className="ml-1.5">{themeButton}</span>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {themeButton}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-chip"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-line px-6 pb-4 pt-2 md:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1">
            {LINKS.map(({ href, label }) => {
              const active = isActive(router.pathname, href);
              return (
                <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                  {label}
                </Link>
              );
            })}
            {isAuthenticated && !isAdminPage && (
              <Link href="/admin" className={linkClass(false)}>
                Admin
              </Link>
            )}
            {isAuthenticated && isAdminPage && (
              <button type="button" onClick={logout} className="rounded-full px-3.5 py-2.5 text-left text-[15px] font-semibold text-danger">
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
