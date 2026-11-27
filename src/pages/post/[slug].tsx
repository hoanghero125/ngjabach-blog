import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Calendar, Clock, Tag, ArrowLeft, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { markdownComponents, rehypePlugins, remarkPlugins, readingTime, stripComments } from '@/lib/markdown';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [otherBlogs, setOtherBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setReadingProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof slug !== 'string') return;
    // Ignore responses that arrive after the reader has moved to another post.
    let cancelled = false;

    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/blogs/slug/${encodeURIComponent(slug)}`);
        if (!cancelled) setBlog(res.data);
      } catch {
        if (!cancelled) setBlog(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchOtherBlogs = async () => {
      try {
        const res = await axios.get('/api/blogs');
        const others = (res.data as Blog[])
          .filter((b) => b.slug !== slug)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        if (!cancelled) setOtherBlogs(others);
      } catch {
        if (!cancelled) setOtherBlogs([]);
      }
    };

    fetchBlog();
    fetchOtherBlogs();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Jump to #section links once the post content (and its heading ids) exists.
  useEffect(() => {
    if (!blog) return;
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'smooth' });
  }, [blog]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${slug}`);
      setShowCopyPopup(true);
      setTimeout(() => setShowCopyPopup(false), 2000);
    } catch {
      // Clipboard blocked; nothing to do.
    }
  };

  return (
    <div className="bg-[#FAF9F6] py-8 px-4">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-blue-500 z-50 transition-[width] duration-75"
        style={{ width: `${readingProgress}%` }}
      />

      {loading ? (
        <div className="max-w-[1325px] mx-auto text-gray-500">Loading...</div>
      ) : !blog ? (
        <div className="max-w-[1325px] mx-auto text-red-500">Blog not found</div>
      ) : (
        <div className="max-w-[1325px] mx-auto">
          <Head>
            <title>{`${blog.title} | NgJaBach Blog`}</title>
          </Head>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 p-2 rounded-md bg-[#FAF9F6] hover:bg-white hover:shadow-sm transition-all mb-6"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg group-hover:bg-[#FAF9F6]">
              <ArrowLeft className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-black">Back to all posts</span>
          </Link>

          <div className="bg-white p-10 rounded-xl shadow-sm mb-8">
            <h1 className="text-5xl font-bold text-black mb-4">{blog.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="h-4 w-4" />
                <span>{readingTime(blog.content)} min read</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Tag className="h-4 w-4" />
                <div className="flex flex-wrap gap-1">
                  {(blog.tags && blog.tags.length > 0 ? blog.tags : ['General']).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-full text-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="ml-auto relative">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="relative group flex items-center justify-center w-8 h-8 text-gray-500 hover:text-blue-500 transition-colors"
                  title="Copy link"
                >
                  <div className="absolute inset-0 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Copy className="h-5 w-5 relative z-10" />
                </button>
                {showCopyPopup && (
                  <div className="absolute right-0 top-10 bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    Link copied!
                  </div>
                )}
              </div>
            </div>

            <div className="max-w-none">
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={markdownComponents}
              >
                {stripComments(blog.content)}
              </ReactMarkdown>
            </div>
          </div>

          {otherBlogs.length > 0 && <div>
            <h2 className="text-3xl font-bold mb-4">Other posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherBlogs.map((otherBlog) => (
                <Link
                  key={otherBlog._id}
                  href={`/post/${otherBlog.slug}`}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-2xl font-bold text-black mb-2">{otherBlog.title}</h3>
                  <p className="text-base text-gray-500 mb-2">
                    {new Date(otherBlog.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(otherBlog.tags || ['General']).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full">{tag}</Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>}
        </div>
      )}
    </div>
  );
}
