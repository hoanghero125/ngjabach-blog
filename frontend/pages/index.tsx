import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Calendar, Tag } from 'lucide-react';
import { useFooterAnimation } from '../context/FooterAnimationContext';
import { useSearch } from '../context/SearchContext';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags: string[];
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const { searchQuery } = useSearch();
  const { setTriggerFooterAnimation } = useFooterAnimation();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        // console.log('Fetched blogs:', res.data);
        setBlogs(res.data);
        setDisplayedBlogs(res.data.slice(0, 5));
      } catch (err: any) {
        // console.error('Failed to fetch blogs:', err.response?.data || err.message);
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
    // console.log('Triggering footer animation');
    setTriggerFooterAnimation(true);
  };

  return (
    <div className="bg-[#FAF9F6] flex flex-col">
      <div className="container mx-auto p-4 flex-grow">
        <div className="max-w-[1325px] mx-auto">
          <h1 className="text-5xl font-bold mb-2">Blog</h1>
          <p className="text-gray-500 mb-6">
            Insights, tutorials, and deep dives into the world of artificial intelligence, machine learning, data science.
          </p>
          <section className={`w-full ${filteredBlogs.length <= visibleCount ? 'mb-12' : ''}`}>
            {filteredBlogs.length === 0 ? (
              <div className="flex justify-center items-center h-[50vh]">
                <p className="text-2xl text-black font-semibold">
                  Oops! Looks like your search broke the internet... or maybe we just don’t have that post yet! 😅
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {displayedBlogs.map((blog) => (
                    <Link href={`/post/${blog.slug}`} key={blog._id} className="block" prefetch>
                      <Card className="overflow-hidden rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <h2 className="text-xl font-bold">{blog.title}</h2>
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={blog.createdAt}>
                              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </time>
                          </div>
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-4">
                              <Tag className="h-4 w-4 text-gray-500" />
                              <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="rounded-full" 
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {filteredBlogs.length > visibleCount && (
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" onClick={handleLoadMore}>
                      Load More
                    </Button>
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