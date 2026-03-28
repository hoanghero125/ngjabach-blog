import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock } from 'lucide-react';
import { useFooterAnimation } from '@/context/FooterAnimationContext';
import { useSearch } from '@/context/SearchContext';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags: string[];
}

const getReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const { searchQuery } = useSearch();
  const { setTriggerFooterAnimation } = useFooterAnimation();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('/api/blogs');
        setBlogs(res.data);
        setDisplayedBlogs(res.data.slice(0, 5));
      } catch (err: any) {
        setBlogs([]);
        setDisplayedBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(
      (blog: Blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.tags && blog.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [blogs, searchQuery]);

  useEffect(() => {
    setDisplayedBlogs(filteredBlogs.slice(0, visibleCount));
  }, [filteredBlogs, visibleCount]);

  const handleLoadMore = () => {
    const newVisibleCount = visibleCount + 5;
    setVisibleCount(newVisibleCount);
    setDisplayedBlogs(filteredBlogs.slice(0, newVisibleCount));
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
            {filteredBlogs.length === 0 ? (
              <div className="flex justify-center items-center h-[50vh]">
                <p className="text-2xl text-black font-semibold">
                  Oops! Looks like your search broke the internet... or maybe we just don't have that post yet! 😅
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
                          <span>{getReadingTime(displayedBlogs[0].content)} min read</span>
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
                                <span>{getReadingTime(blog.content)} min read</span>
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
