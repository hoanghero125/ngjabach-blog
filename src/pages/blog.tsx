import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock } from 'lucide-react';
import { useFooterAnimation } from '@/context/FooterAnimationContext';
import { useSearch } from '@/context/SearchContext';
import { readingTime } from '@/lib/text';

const PAGE_SIZE = 5;

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags: string[];
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const { searchQuery } = useSearch();
  const { setTriggerFooterAnimation } = useFooterAnimation();

  useEffect(() => {
    let cancelled = false;
    axios
      .get('/api/blogs')
      .then((res) => {
        if (cancelled) return;
        setBlogs(res.data);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return blogs;
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(query) ||
        (blog.tags || []).some((tag) => tag.toLowerCase().includes(query))
    );
  }, [blogs, searchQuery]);

  // A new search starts again from the first page of results.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  const displayedBlogs = filteredBlogs.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((count) => count + PAGE_SIZE);
    setTriggerFooterAnimation(true);
  };

  return (
    <div className="bg-[#FAF9F6] flex flex-col">
      <div className="px-4 py-4 flex-grow">
        <div className="max-w-[1325px] mx-auto">
          <div className="mb-8 pt-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-500">Posts & Articles</span>
            <div className="flex items-end gap-4 mt-1 mb-3">
              <h1 className="text-6xl font-extrabold leading-none">Blog</h1>
              <div className="h-[2px] bg-gray-200 flex-grow mb-2" />
            </div>
            <p className="text-gray-500">
              Insights, tutorials, and deep dives into{' '}
              <span className="font-medium text-gray-700">artificial intelligence</span>,{' '}
              <span className="font-medium text-gray-700">machine learning</span>, and{' '}
              <span className="font-medium text-gray-700">data science</span>.
            </p>
          </div>
          <section className={`w-full ${filteredBlogs.length <= visibleCount ? 'mb-12' : ''}`}>
            {status === 'loading' ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading posts">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm px-6 py-7 animate-pulse">
                    <div className="h-8 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/3 mt-4" />
                  </div>
                ))}
              </div>
            ) : status === 'error' ? (
              <div className="flex justify-center items-center h-[50vh]">
                <p className="text-2xl text-black font-semibold">Couldn&apos;t load posts right now. Please refresh in a moment.</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="flex justify-center items-center h-[50vh]">
                <p className="text-2xl text-black font-semibold">
                  Oops! Looks like your search broke the internet... or maybe we just don&apos;t have that post yet! 😅
                </p>
              </div>
            ) : (
              <>
                {/* Featured post */}
                <Link href={`/post/${displayedBlogs[0].slug}`} key={displayedBlogs[0]._id} className="block mb-4" prefetch>
                  <Card className="overflow-hidden rounded-xl cursor-pointer">
                    <CardContent className="px-6 py-7 flex flex-col justify-between min-h-[100px]">
                      <h2 className="text-4xl font-bold text-black">{displayedBlogs[0].title}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={displayedBlogs[0].createdAt}>
                            {new Date(displayedBlogs[0].createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </time>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{readingTime(displayedBlogs[0].content)} min read</span>
                        </div>
                        {displayedBlogs[0].tags && displayedBlogs[0].tags.length > 0 && (
                          <>
                            <span>·</span>
                            <div className="flex flex-wrap gap-1.5">
                              {displayedBlogs[0].tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="rounded-full">{tag}</Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Remaining posts */}
                {displayedBlogs.length > 1 && (
                  <div className="space-y-4">
                    {displayedBlogs.slice(1).map((blog) => (
                      <Link href={`/post/${blog.slug}`} key={blog._id} className="block" prefetch>
                        <Card className="overflow-hidden rounded-xl cursor-pointer">
                          <CardContent className="px-6 py-7 flex flex-col justify-between min-h-[100px]">
                            <h2 className="text-3xl font-bold text-black flex-grow">{blog.title}</h2>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 mt-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <time dateTime={blog.createdAt}>
                                  {new Date(blog.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </time>
                              </div>
                              <span>·</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{readingTime(blog.content)} min read</span>
                              </div>
                              {blog.tags && blog.tags.length > 0 && (
                                <>
                                  <span>·</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {blog.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="rounded-full">{tag}</Badge>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {filteredBlogs.length > visibleCount && (
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" onClick={handleLoadMore}>Load More</Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
