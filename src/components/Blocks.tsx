import Link from 'next/link';
import { ReactNode } from 'react';
import type { Publication } from '@/lib/site/schema';
import { useSite } from '@/context/SiteContext';
import { findCategory } from '@/lib/categories';

/** Page container: sidebar + content on wide screens, stacked on phones. */
export function SidebarLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="relative mx-auto grid max-w-[1200px] gap-10 px-6 pb-16 pt-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
      {sidebar}
      <div className="flex min-w-0 flex-col gap-10">{children}</div>
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="soft m-0 font-display text-[34px] font-semibold leading-tight md:text-[38px]">{children}</h1>;
}

export function SectionHeading({ id, children, action }: { id: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-line pb-2">
      <h2 id={id} className="m-0 font-display text-[22px] font-semibold">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold text-accent-ink hover:underline">
      {children}
    </Link>
  );
}

/** Gold light motes behind the page (hidden in light mode). */
export function Motes() {
  return (
    <div aria-hidden="true" className="motes pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[4%] top-[110px] h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_18px_6px_rgba(226,180,76,0.3)]" />
      <span className="absolute right-[6%] top-[260px] h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_20px_7px_rgba(226,180,76,0.28)]" />
      <span className="absolute left-[46%] top-[760px] h-1 w-1 rounded-full bg-accent shadow-[0_0_14px_5px_rgba(226,180,76,0.25)]" />
      <span className="absolute right-[12%] top-[1180px] h-[5px] w-[5px] rounded-full bg-accent shadow-[0_0_16px_6px_rgba(226,180,76,0.25)]" />
    </div>
  );
}

export function CategoryTag({ slug, short = true }: { slug?: string | null; short?: boolean }) {
  const category = findCategory(slug);
  if (!category) return null;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${category.dot}`} />
      {short ? category.short : category.label}
    </span>
  );
}

export interface PostSummary {
  _id: string;
  slug: string;
  title: string;
  createdAt: string;
  category?: string;
  summary: string;
  minutes: number;
}

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-US', opts);

/** One compact post row (title, one-line summary, category, date or length). */
export function PostRow({ post, showDate = 'right' }: { post: PostSummary; showDate?: 'left' | 'right' }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={`/post/${post.slug}`}
        className={`group grid items-baseline gap-x-4 gap-y-1 py-3.5 text-ink ${
          showDate === 'left' ? 'grid-cols-[72px_minmax(0,1fr)] sm:grid-cols-[84px_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto]'
        }`}
      >
        {showDate === 'left' && (
          <span className="text-sm tabular-nums text-faint">{formatDate(post.createdAt, { month: 'short', day: 'numeric' })}</span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[17px] font-bold group-hover:text-accent-ink">{post.title}</span>
          {post.summary && <span className="text-sm text-muted">{post.summary}</span>}
        </span>
        <span className={`flex items-center gap-2 text-[13px] text-faint ${showDate === 'left' ? 'col-start-2 sm:col-start-auto' : ''}`}>
          <CategoryTag slug={post.category} />
          {post.category && <span aria-hidden="true">·</span>}
          {showDate === 'right' ? formatDate(post.createdAt) : `${post.minutes} min`}
        </span>
      </Link>
    </li>
  );
}

const pill =
  'inline-flex min-h-8 items-center rounded-full border border-line px-3 text-[13px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent-ink';

export function PublicationCard({ pub }: { pub: Publication }) {
  const { profile } = useSite();
  return (
    <article className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-surface p-4">
      <h3 className="m-0 text-[17px] font-bold leading-snug">{pub.title}</h3>
      <p className="m-0 text-sm leading-relaxed text-muted">
        {pub.authors.map((author, i) => (
          <span key={author}>
            {author === profile.authorName ? <strong className="text-ink">{author}</strong> : author}
            {i < pub.authors.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
      {(pub.venue || pub.status) && (
        <p className="m-0 text-sm italic text-accent-ink">{[pub.venue, pub.status].filter(Boolean).join(' · ')}</p>
      )}
      {pub.summary && <p className="m-0 text-sm leading-relaxed text-muted">{pub.summary}</p>}
      {pub.links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pub.links.map((link) =>
            link.href.startsWith('/') ? (
              <Link key={link.label} href={link.href} className={pill}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={pill}>
                {link.label}
              </a>
            )
          )}
        </div>
      )}
    </article>
  );
}
