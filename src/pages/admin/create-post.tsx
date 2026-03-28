import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Plus, X, Upload, Copy, Check } from 'lucide-react';
import slugify from 'slugify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

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
    <div className="relative my-4 rounded-lg overflow-hidden border border-gray-200">
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

const markdownPreviewOptions = {
  remarkPlugins: [remarkGfm, remarkMath, remarkEmoji],
  rehypePlugins: [rehypeRaw, rehypeKatex, rehypeHighlight],
  components: {
    pre: ({ children }: { children?: React.ReactNode }) => <CodeBlock>{children}</CodeBlock>,
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const isBlock = className?.includes('language-') || className?.includes('hljs');
      if (isBlock) return <code className={className}>{children}</code>;
      return (
        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-rose-600">
          {children}
        </code>
      );
    },
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-outside pl-6 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-outside pl-6 mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
    hr: () => <hr className="my-6 border-gray-200" />,
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    del: ({ children }: { children?: React.ReactNode }) => (
      <del className="line-through text-gray-400">{children}</del>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-gray-300 pl-6 italic my-4 text-gray-500">
        {children}
      </blockquote>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-4">
        <table className="border-collapse border border-gray-300 w-full">{children}</table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-sm">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border border-gray-300 px-4 py-2 text-sm">{children}</td>
    ),
  },
};

interface Blog {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
}

export default function CreatePost() {
  const [blog, setBlog] = useState<Blog>({ title: '', slug: '', content: '', tags: [] });
  const [token, setToken] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
    if (!storedToken) {
      router.push('/admin/login');
    } else if (id && router.isReady) {
      fetchBlog(id as string, storedToken);
    }
  }, [id, router.isReady, router]);

  const fetchBlog = async (blogId: string, authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const fetchedBlog = res.data;
      const slug = fetchedBlog.slug || slugify(fetchedBlog.title || 'untitled-post', { lower: true, strict: true });
      setBlog({ ...fetchedBlog, slug, tags: fetchedBlog.tags || [] });
    } catch (err: any) {
      console.error('Failed to fetch blog:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setBlog({ ...blog, content: value || '' });
  };

  const handleTitleChange = (title: string) => {
    const generatedSlug = title.trim()
      ? slugify(title, { lower: true, strict: true })
      : 'untitled-post';
    setBlog({ ...blog, title, slug: generatedSlug });
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setBlog({ ...blog, tags: [...blog.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBlog({ ...blog, tags: blog.tags.filter((tag) => tag !== tagToRemove) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlog({ ...blog, content: event.target?.result as string });
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async () => {
    if (!blog.slug) {
      setError('Please enter a title to generate a slug.');
      return;
    }

    const payload = {
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      tags: blog.tags,
    };

    try {
      setError(null);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (id) {
        await axios.put(`/api/blogs/${id}`, payload, config);
      } else {
        await axios.post('/api/blogs', payload, config);
      }
      router.push('/admin');
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
        return;
      }
      const errorMessage = err.response?.data?.message || 'Failed to save the post. Please try again.';
      setError(errorMessage);
    }
  };

  if (!token) return null;
  if (loading) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="bg-[#FAF9F6] p-4">
      <div className="max-w-[1325px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/admin"
            className="group inline-flex items-center gap-2 p-2 rounded-md bg-[#FAF9F6] hover:bg-white hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-md group-hover:bg-[#FAF9F6]">
              <ArrowLeft className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-black">Back to Admin Panel</span>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold font-medium rounded-lg hover:bg-gray-800 transition"
            >
              <Save className="h-4 w-4" />
              Save Post
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xl font-medium text-black mb-1">Post Title</label>
              <input
                type="text"
                placeholder="Enter post title..."
                value={blog.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3 border rounded-lg text-base border-gray-300 text-black"
              />
            </div>

            <div>
              <label className="block text-xl font-medium text-black mb-1">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full p-3 border rounded-lg text-base border-gray-300 text-black"
                />
                <button
                  onClick={handleAddTag}
                  className="flex items-center gap-2 px-3 py-3 bg-black text-white font-bold font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(blog.tags || []).map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-gray-200 text-black text-base px-2 py-2 rounded-full"
                  >
                    <span className="leading-none relative top-[-1.5px]">{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)} className="flex items-center justify-center text-red-500 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xl font-medium text-black">Content (Markdown)</label>
                <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 text-black">
                  <Upload className="h-4 w-4" />
                  Upload .md
                  <input
                    type="file"
                    accept=".md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div data-color-mode="light">
                <MDEditor
                  value={blog.content}
                  onChange={handleEditorChange}
                  preview="live"
                  height={650}
                  className="border border-gray-300 rounded-lg"
                  previewOptions={markdownPreviewOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
