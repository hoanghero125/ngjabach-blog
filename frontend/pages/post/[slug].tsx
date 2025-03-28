import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Calendar, Clock, Tag, ArrowLeft, Link as LinkIcon, Copy } from 'lucide-react';
import { Badge } from '../../components/ui/Badge'; 

const generateIdFromText = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-');
};

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [otherBlogs, setOtherBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/slug/${slug}`);
        setBlog(res.data);
      } catch (err) {
        // console.error('Failed to fetch blog:', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherBlogs = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        const allBlogs = res.data;
        const filteredBlogs = allBlogs
          .filter((b: Blog) => b.slug !== slug)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setOtherBlogs(filteredBlogs);
      } catch (err) {
        // console.error('Failed to fetch other blogs:', err);
        setOtherBlogs([]);
      }
    };

    fetchBlog();
    fetchOtherBlogs();
  }, [slug]);

  useEffect(() => {
    if (router.asPath.includes('#')) {
      const anchor = router.asPath.split('#')[1];
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [router.asPath]);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${slug}`;
    navigator.clipboard.writeText(postUrl);
    setShowCopyPopup(true);
    setTimeout(() => setShowCopyPopup(false), 2000);
  };

  return (
    <div className="bg-[#FAF9F6] py-8 px-4">
      {loading ? (
        <div className="max-w-[1325px] mx-auto text-gray-500">Loading...</div>
      ) : !blog ? (
        <div className="max-w-[1325px] mx-auto text-red-500">Blog not found</div>
      ) : (
        <div className="max-w-[1325px] mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 p-2 rounded-md bg-[#FAF9F6] hover:bg-white hover:shadow-sm transition-all mb-6"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg group-hover:bg-[#FAF9F6]">
              <ArrowLeft className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-black">Back to all posts</span>
          </Link>

          <div className="bg-white p-10 rounded-xl shadow-sm mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">{blog.title}</h1>

            <div className="flex items-baseline gap-2 mb-8">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar className="h-4 w-4 relative top-[1px]" />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="h-4 w-4 relative top-[1px]" />
                <span>{calculateReadingTime(blog.content)} min read</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Tag className="h-4 w-4 relative top-[1px]" />
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
              <hr className="border-gray-200 border-1 flex-grow relative top-[-2px]" />
              <div className="flex items-center gap-3 ml-auto">
                <div className="relative">
                  <button
                    ref={copyButtonRef}
                    onClick={handleCopyLink}
                    className="relative group flex items-center justify-center w-8 h-8 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Copy link"
                  >
                    <div className="absolute inset-0 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Copy className="h-5 w-5 relative z-10" />
                  </button>
                  {showCopyPopup && (
                    <div className="absolute right-0 top-10 bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg">
                      Link copied!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ src, alt }) => (
                    <Image
                      src={src || ''}
                      alt={alt || 'Image'}
                      width={800}
                      height={400}
                      className="w-full h-auto rounded-lg"
                    />
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <table className="border-collapse border border-gray-300 my-6">{children}</table>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-lg">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2 text-lg">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-8 italic my-4 text-gray-500 [&_p]:!text-gray-500">
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }) => {
                    const headingId = generateIdFromText(children?.toString() || '');
                    return (
                      <div className="group relative">
                        <h1
                          id={headingId}
                          className="text-4xl font-bold text-gray-900 mt-8 mb-4 pt-4 pb-2 after:content-[''] after:block after:w-full after:h-[1px]! after:bg-gray-300 after:mt-4"
                        >
                          {children}
                          <a
                            href={`#${headingId}`}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/post/${blog.slug}#${headingId}`, undefined, { scroll: false });
                              document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <LinkIcon className="h-5 w-5 text-gray-500 hover:text-blue-500" />
                          </a>
                        </h1>
                      </div>
                    );
                  },
                  h2: ({ children }) => {
                    const headingId = generateIdFromText(children?.toString() || '');
                    return (
                      <div className="group relative">
                        <h2
                          id={headingId}
                          className="text-3xl font-semibold text-gray-900 mt-6 mb-4 pt-4 pb-2 after:content-[''] after:block after:w-full after:h-[1px]! after:bg-gray-300 after:mt-4"
                        >
                          {children}
                          <a
                            href={`#${headingId}`}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/post/${blog.slug}#${headingId}`, undefined, { scroll: false });
                              document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <LinkIcon className="h-5 w-5 text-gray-500 hover:text-blue-500" />
                          </a>
                        </h2>
                      </div>
                    );
                  },
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="leading-relaxed mb-6 text-lg text-black">{children}</p>
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </div>

          <div>
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
                      <Badge
                        key={index}
                        variant="secondary"
                        className="rounded-full" 
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}