import Head from 'next/head';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Motes, PageTitle, PostRow } from '@/components/Blocks';
import { useSite } from '@/context/SiteContext';
import { CATEGORIES } from '@/lib/categories';
import { usePosts } from '@/lib/usePosts';

export default function BlogPage() {
  const { profile } = useSite();
  const { posts, status } = usePosts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [posts, query, category]);

  // Grouped by year, newest year first; within a year the admin-panel order is kept.
  const byYear = useMemo(() => {
    const groups = new Map<number, typeof filtered>();
    filtered.forEach((p) => {
      const year = new Date(p.createdAt).getFullYear();
      groups.set(year, [...(groups.get(year) || []), p]);
    });
    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const filterButton = (value: string, label: string, dot?: string) => (
    <button
      key={value}
      type="button"
      aria-pressed={category === value}
      onClick={() => setCategory(value)}
      className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm transition-colors ${
        category === value ? 'bg-nav-active font-bold text-ink' : 'text-ink hover:bg-chip'
      }`}
    >
      {dot && <span aria-hidden="true" className={`h-[9px] w-[9px] rounded-full ${dot}`} />}
      {label}
    </button>
  );

  return (
    <>
      <Head>
        <title>Blog · {profile.name}</title>
      </Head>
      <Motes />
      <div className="relative mx-auto grid w-full max-w-[1200px] gap-10 px-6 pb-16 pt-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Filter posts" className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="post-search" className="text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">
              Search
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                id="post-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title or tag"
                className="h-11 w-full rounded-[14px] border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-0.5" role="group" aria-label="Categories">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">Categories</p>
            {filterButton('all', 'All posts')}
            {CATEGORIES.map((c) => filterButton(c.slug, c.label, c.dot))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-2">
            <PageTitle>Blog</PageTitle>
            <p className="m-0 text-base leading-relaxed text-muted">
              Write-ups of my papers, notes on machine learning, and things I learn along the way.
            </p>
          </div>

          {status === 'loading' ? (
            <ul aria-busy="true" aria-label="Loading posts" className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
              ))}
            </ul>
          ) : status === 'error' ? (
            <p className="text-muted">Posts could not be loaded right now. Please refresh in a moment.</p>
          ) : byYear.length === 0 ? (
            <p className="text-muted">{posts.length === 0 ? 'No posts yet.' : 'No posts match this search.'}</p>
          ) : (
            byYear.map(([year, items]) => (
              <section key={year} aria-labelledby={`y-${year}`}>
                <h2 id={`y-${year}`} className="m-0 border-b border-line pb-2 text-[13px] font-bold tracking-[0.16em] text-accent-ink">
                  {year}
                </h2>
                <ul>
                  {items.map((post) => (
                    <PostRow key={post._id} post={post} showDate="left" />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
