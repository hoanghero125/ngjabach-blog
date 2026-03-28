import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { Calendar, Clock, Tag, ArrowLeft, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

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

const extractToc = (content: string) => {
  return content
    .split('\n')
    .filter(line => /^#{1,3} /.test(line))
    .map(line => {
      const level = line.match(/^(#{1,3})/)?.[1].length || 1;
      const text = line.replace(/^#{1,3} /, '').replace(/[*_`[\]]/g, '').replace(/\(.*?\)/g, '').trim();
      const id = generateIdFromText(text);
      return { level, text, id };
    });
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

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    const text = preRef.current?.querySelector('code')?.textContent || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeChild = React.Children.toArray(children)[0] as React.ReactElement<{ className?: string }>;
  const langClass = codeChild?.props?.className || '';
  const lang = langClass.match(/language-(\w+)/)?.[1] || '';

  return (
    <div className="relative my-6 rounded-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-mono text-gray-500">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto p-4 m-0 text-sm leading-relaxed bg-gray-50">
        {children}
      </pre>
    </div>
  );
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [otherBlogs, setOtherBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const copyButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setReadingProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/blogs/slug/${slug}`);
        setBlog(res.data);
      } catch (err) {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherBlogs = async () => {
      try {
        const res = await axios.get('/api/blogs');
        const allBlogs = res.data;
        const filteredBlogs = allBlogs
          .filter((b: Blog) => b.slug !== slug)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setOtherBlogs(filteredBlogs);
      } catch (err) {
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
                <span>{calculateReadingTime(blog.content)} min read</span>
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
                  ref={copyButtonRef}
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
                remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
                rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
                components={{
                  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                  code: ({ className, children }) => {
                    const isBlock = className?.includes('language-') || className?.includes('hljs');
                    if (isBlock) return <code className={className}>{children}</code>;
                    return (
                      <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-rose-600">
                        {children}
                      </code>
                    );
                  },
                  img: ({ src, alt }) => (
                    <Image
                      src={src || ''}
                      alt={alt || 'Image'}
                      width={800}
                      height={400}
                      className="w-full h-auto rounded-lg"
                    />
                  ),
                  a: ({ href, children }) => {
                    if (href?.startsWith('#')) {
                      return (
                        <a
                          href={href}
                          className="text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            history.pushState(null, '', href);
                            document.getElementById(href.slice(1))?.scrollIntoView();
                          }}
                        >
                          {children}
                        </a>
                      );
                    }
                    return (
                      <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    );
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="border-collapse border border-gray-300 w-full">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-base">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2 text-base">{children}</td>
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
                              history.pushState(null, '', `#${headingId}`);
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
                              history.pushState(null, '', `#${headingId}`);
                            }}
                          >
                            <LinkIcon className="h-5 w-5 text-gray-500 hover:text-blue-500" />
                          </a>
                        </h2>
                      </div>
                    );
                  },
                  h3: ({ children }) => {
                    const headingId = generateIdFromText(children?.toString() || '');
                    return (
                      <div className="group relative">
                        <h3 id={headingId} className="text-2xl font-semibold text-gray-900 mt-5 mb-3">
                          {children}
                          <a
                            href={`#${headingId}`}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              history.pushState(null, '', `#${headingId}`);
                            }}
                          >
                            <LinkIcon className="inline h-4 w-4 text-gray-400 hover:text-blue-500" />
                          </a>
                        </h3>
                      </div>
                    );
                  },
                  h4: ({ children }) => {
                    const headingId = generateIdFromText(children?.toString() || '');
                    return (
                      <h4 id={headingId} className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                        {children}
                      </h4>
                    );
                  },
                  h5: ({ children }) => {
                    const headingId = generateIdFromText(children?.toString() || '');
                    return (
                      <h5 id={headingId} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                        {children}
                      </h5>
                    );
                  },
                  h6: ({ children }) => {
                    const headingId = generateIdFromText(children?.toString() || '');
                    return (
                      <h6 id={headingId} className="text-base font-semibold text-gray-500 mt-4 mb-2 uppercase tracking-wide">
                        {children}
                      </h6>
                    );
                  },
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-6 mb-4 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-6 mb-4 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-lg text-black leading-relaxed">{children}</li>
                  ),
                  hr: () => <hr className="my-8 border-gray-200" />,
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  del: ({ children }) => (
                    <del className="line-through text-gray-400">{children}</del>
                  ),
                  p: ({ children }) => (
                    <p className="leading-relaxed mb-6 text-lg text-black">{children}</p>
                  ),
                }}
              >
                {blog.content.replace(/<!--[\s\S]*?-->/g, '')}
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
