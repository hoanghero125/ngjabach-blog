import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import slugify from 'slugify';
import { useRequireAuth } from '@/context/AuthContext';
import type { MarkdownPreviewProps } from '@uiw/react-markdown-preview';
import { markdownComponents, rehypePlugins, remarkPlugins } from '@/lib/markdown';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false });

// Same plugins and styling as the public post page, so the preview is faithful.
// (The editor bundles an older react-markdown whose component types differ
// slightly; the components themselves are compatible.)
const markdownPreviewOptions: Omit<MarkdownPreviewProps, 'source'> = {
  remarkPlugins,
  rehypePlugins,
  components: markdownComponents as MarkdownPreviewProps['components'],
};

const MAX_TAGS = 20;
const toSlug = (text: string) => slugify(text, { lower: true, strict: true, trim: true });

interface Blog {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
}

export default function CreatePost() {
  const { status, handleUnauthorized } = useRequireAuth();
  const [blog, setBlog] = useState<Blog>({ title: '', slug: '', content: '', tags: [] });
  // New posts follow the title until the slug is edited by hand. Existing posts
  // never change slug on their own, because that would break links to them.
  const [slugLocked, setSlugLocked] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  useEffect(() => {
    if (status !== 'authenticated' || !router.isReady || !id) return;
    let cancelled = false;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/blogs/${id}`);
        if (cancelled) return;
        const fetched = res.data;
        setBlog({
          _id: fetched._id,
          title: fetched.title || '',
          slug: fetched.slug || toSlug(fetched.title || 'untitled-post'),
          content: fetched.content || '',
          tags: fetched.tags || [],
        });
        setSlugLocked(true);
      } catch {
        if (!cancelled) setError('Failed to load the post.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBlog();
    return () => {
      cancelled = true;
    };
  }, [status, router.isReady, id]);

  const handleTitleChange = (title: string) => {
    setBlog((b) => ({ ...b, title, slug: slugLocked ? b.slug : toSlug(title) }));
  };

  const handleSlugChange = (value: string) => {
    setSlugLocked(true);
    // Allow typing freely, keep only characters a slug may contain.
    setBlog((b) => ({ ...b, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }));
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (!tag) return;
    if (blog.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setNewTag('');
      return;
    }
    if (blog.tags.length >= MAX_TAGS) {
      setError(`At most ${MAX_TAGS} tags are allowed.`);
      return;
    }
    setBlog((b) => ({ ...b, tags: [...b.tags, tag.slice(0, 50)] }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBlog((b) => ({ ...b, tags: b.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-uploading the same file
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('Please choose a .md file.');
      return;
    }
    if (blog.content.trim() && !window.confirm('Replace the current content with this file?')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') setBlog((b) => ({ ...b, content: text }));
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    const slug = blog.slug.replace(/^-+|-+$/g, '');
    if (!blog.title.trim()) return setError('Please enter a title.');
    if (!slug) return setError('Please enter a URL slug.');
    if (!blog.content.trim()) return setError('Please write some content.');

    const payload = { title: blog.title, slug, content: blog.content, tags: blog.tags };
    setSaving(true);
    setError(null);
    try {
      if (id) {
        await axios.put(`/api/blogs/${id}`, payload);
      } else {
        await axios.post('/api/blogs', payload);
      }
      router.push('/admin');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || 'Failed to save the post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status !== 'authenticated') return null;
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
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Post'}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="post-title" className="block text-xl font-medium text-black mb-1">Post Title</label>
              <input
                id="post-title"
                type="text"
                placeholder="Enter post title..."
                value={blog.title}
                maxLength={300}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3 border rounded-lg text-base border-gray-300 text-black"
              />
            </div>

            <div>
              <label htmlFor="post-slug" className="block text-xl font-medium text-black mb-1">URL</label>
              <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-base border-r border-gray-300 whitespace-nowrap">/post/</span>
                <input
                  id="post-slug"
                  type="text"
                  value={blog.slug}
                  maxLength={200}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full p-3 text-base text-black focus:outline-none"
                />
              </div>
              {id && (
                <p className="mt-1 text-sm text-gray-500">Changing the URL of a published post breaks links that point to it.</p>
              )}
            </div>

            <div>
              <label htmlFor="post-tag" className="block text-xl font-medium text-black mb-1">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  id="post-tag"
                  type="text"
                  placeholder="Add a tag and press Enter..."
                  value={newTag}
                  maxLength={50}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full p-3 border rounded-lg text-base border-gray-300 text-black"
                />
                <button
                  type="button"
                  aria-label="Add tag"
                  onClick={handleAddTag}
                  className="flex items-center gap-2 px-3 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {blog.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 bg-gray-200 text-black text-base px-2 py-2 rounded-full">
                    <span className="leading-none relative top-[-1.5px]">{tag}</span>
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => handleRemoveTag(tag)}
                      className="flex items-center justify-center text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xl font-medium text-black">Content (Markdown)</span>
                <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 text-black">
                  <Upload className="h-4 w-4" />
                  Upload .md
                  <input type="file" accept=".md,text/markdown" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div data-color-mode="light">
                <MDEditor
                  value={blog.content}
                  onChange={(value) => setBlog((b) => ({ ...b, content: value || '' }))}
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
