import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Copy } from 'lucide-react';
import { CategoryTag, formatDate } from '@/components/Blocks';
import { profile } from '@/data/profile';
import { findCategory } from '@/lib/categories';
import { markdownComponents, rehypePlugins, remarkPlugins } from '@/lib/markdown';
import { excerpt, readingTime, stripComments } from '@/lib/text';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  category?: string;
  tags?: string[];
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [neighbours, setNeighbours] = useState<{ prev?: Blog; next?: Blog }>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof slug !== 'string') return;
    // Ignore responses that arrive after the reader has moved to another post.
    let cancelled = false;
    setLoading(true);

    axios
      .get<Blog>(`/api/blogs/slug/${encodeURIComponent(slug)}`)
      .then((res) => !cancelled && setBlog(res.data))
      .catch(() => !cancelled && setBlog(null))
      .finally(() => !cancelled && setLoading(false));

    axios
      .get<Blog[]>('/api/blogs')
      .then((res) => {
        if (cancelled) return;
        const i = res.data.findIndex((b) => b.slug === slug);
        setNeighbours(i === -1 ? {} : { prev: res.data[i + 1], next: res.data[i - 1] });
      })
      .catch(() => !cancelled && setNeighbours({}));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Build the table of contents from the rendered headings, then jump to #section links.
  useEffect(() => {
    if (!blog || !articleRef.current) return;
    const headings = [...articleRef.current.querySelectorAll<HTMLElement>('h2[id], h3[id]')];
    setToc(headings.map((h) => ({ id: h.id, text: h.textContent || '', level: h.tagName === 'H3' ? 3 : 2 })));

    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'smooth' });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [blog]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing to do.
    }
  };

  const category = findCategory(blog?.category);

  return (
    <>
      <div aria-hidden="true" className="fixed left-0 top-0 z-50 h-[3px] bg-accent transition-[width] duration-75" style={{ width: `${progress}%` }} />

      {loading ? (
        <div className="mx-auto w-full max-w-[720px] px-6 py-12">
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-surface" />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-surface" />
          <div className="mt-10 h-64 animate-pulse rounded-2xl bg-surface" />
        </div>
      ) : !blog ? (
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-6 py-16">
          <h1 className="font-display text-3xl font-semibold">Post not found</h1>
          <p className="text-muted">
            This post may have moved. <Link href="/blog" className="font-semibold text-accent-ink hover:underline">Browse all posts</Link>
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[1100px] justify-center gap-12 px-6 pb-16 pt-9">
          <Head>
            <title>{`${blog.title} · ${profile.name}`}</title>
            <meta name="description" content={excerpt(blog.content)} />
          </Head>

          <article className="min-w-0 max-w-[720px] flex-1">
            <nav aria-label="Breadcrumb" className="mb-3.5 text-sm text-faint">
              <Link href="/blog" className="font-semibold text-accent-ink hover:underline">
                Blog
              </Link>
              {category && (
                <>
                  {' '}
                  <span aria-hidden="true">/</span> {category.label}
                </>
              )}
            </nav>
            <h1 className="soft m-0 font-display text-[34px] font-semibold leading-tight md:text-[40px]">{blog.title}</h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-sm text-faint">
              <span>{formatDate(blog.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span aria-hidden="true">·</span>
              <span>{readingTime(blog.content)} min read</span>
              {category && (
                <span className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-bold text-ink">
                  <CategoryTag slug={blog.category} />
                </span>
              )}
              {(blog.tags || []).map((tag) => (
                <span key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-xs">
                  {tag}
                </span>
              ))}
              <button
                type="button"
                onClick={handleCopyLink}
                className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-muted hover:bg-chip hover:text-ink"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Link copied' : 'Copy link'}
              </button>
            </div>

            <div ref={articleRef} className="mt-8">
              <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={markdownComponents}>
                {stripComments(blog.content)}
              </ReactMarkdown>
            </div>

            <aside aria-label="About the author" className="mt-10 flex items-center gap-4 rounded-[20px] border border-line bg-surface p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.photo} alt="" className="h-16 w-16 rounded-[18px] border-2 border-accent object-cover" />
              <div className="min-w-0">
                <p className="m-0 font-bold">{profile.name}</p>
                <p className="m-0 mt-0.5 text-sm text-muted">
                  {profile.roles.join(' · ')}.{' '}
                  <Link href="/" className="font-semibold text-accent-ink hover:underline">
                    About me
                  </Link>
                </p>
              </div>
            </aside>

            {(neighbours.prev || neighbours.next) && (
              <nav aria-label="More posts" className="mt-4 grid gap-3 sm:grid-cols-2">
                {neighbours.prev ? (
                  <Link href={`/post/${neighbours.prev.slug}`} className="flex flex-col gap-1 rounded-2xl border border-line p-4 text-ink hover:border-accent">
                    <span className="text-[13px] text-faint">Previous</span>
                    <span className="font-bold">{neighbours.prev.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {neighbours.next && (
                  <Link href={`/post/${neighbours.next.slug}`} className="flex flex-col gap-1 rounded-2xl border border-line p-4 text-right text-ink hover:border-accent">
                    <span className="text-[13px] text-faint">Next</span>
                    <span className="font-bold">{neighbours.next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          {toc.length > 1 && (
            <nav aria-label="On this page" className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-[220px] shrink-0 self-start overflow-y-auto text-sm xl:block">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">On this page</p>
              <ol className="flex flex-col border-l-2 border-line">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`-ml-0.5 flex min-h-8 items-center border-l-2 py-1 pr-2 leading-snug ${
                        item.level === 3 ? 'pl-6' : 'pl-3'
                      } ${activeId === item.id ? 'border-accent font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      )}
    </>
  );
}
