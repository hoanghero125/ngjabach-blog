import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Calendar } from 'lucide-react';
import { useFooterAnimation } from '../context/FooterAnimationContext';

interface Blog {
  _id: string;
  title: string;
  slug: string; // Thêm trường slug
  content: string;
  createdAt: string;
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const { setTriggerFooterAnimation } = useFooterAnimation();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        console.log('Fetched blogs:', res.data);
        setBlogs(res.data);
        setDisplayedBlogs(res.data.slice(0, 5));
      } catch (err: any) {
        console.error('Failed to fetch blogs:', err.response?.data || err.message);
        setBlogs([]);
        setDisplayedBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  const handleLoadMore = () => {
    const newVisibleCount = visibleCount + 5;
    setVisibleCount(newVisibleCount);
    setDisplayedBlogs(blogs.slice(0, newVisibleCount));
    console.log('Triggering footer animation');
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
          <section className={`w-full ${blogs.length <= visibleCount ? 'mb-12' : ''}`}>
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
                      <div className="flex flex-wrap gap-2 mt-4">
                        {['Deep Learning', 'Neural Networks'].map((tag, index) => (
                          <Badge key={index} variant="secondary" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {blogs.length > visibleCount && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={handleLoadMore}>
                  Load More
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}