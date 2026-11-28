import Link from 'next/link';
import { useRouter } from 'next/router';

const TABS = [
  { href: '/admin', label: 'Posts' },
  { href: '/admin/content', label: 'Site content' },
  { href: '/admin/media', label: 'Media' },
];

export default function AdminNav() {
  const { pathname } = useRouter();
  return (
    <nav aria-label="Admin sections" className="mb-6 flex flex-wrap gap-1 border-b border-line">
      {TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href === '/admin' && pathname === '/admin/create-post');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[15px] transition-colors ${
              active ? 'border-accent font-bold text-ink' : 'border-transparent font-medium text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
