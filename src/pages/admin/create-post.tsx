import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Plus, X, Upload, ImagePlus } from 'lucide-react';
import slugify from 'slugify';
import { useRequireAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { CATEGORIES } from '@/lib/categories';
import MediaPicker from '@/components/admin/MediaPicker';
import type { MediaItem } from '@/lib/media-client';
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
  category: string;
  published: boolean;
}

export default function CreatePost() {
  const { status, handleUnauthorized } = useRequireAuth();
  const { theme } = useTheme();
  const [blog, setBlog] = useState<Blog>({ title: '', slug: '', content: '', tags: [], category: '', published: false });
  const [picking, setPicking] = useState(false);
  // New posts follow the title until the slug is edited by hand. Existing posts
  // never change slug on their own, because that would break links to them.
  const [slugLocked, setSlugLocked] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Only a real post id (24 hex characters) is ever put into a request URL.
  const rawId = router.query.id;
  const id = typeof rawId === 'string' && /^[a-f0-9]{24}$/i.test(rawId) ? rawId : undefined;
  const invalidId = rawId !== undefined && !id;

  useEffect(() => {
    if (status !== 'authenticated' || !router.isReady || !id) return;
    let cancelled = false;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/blogs/${encodeURIComponent(id)}`);
        if (cancelled) return;
        const fetched = res.data;
        setBlog({
          _id: fetched._id,
          title: fetched.title || '',
          slug: fetched.slug || toSlug(fetched.title || 'untitled-post'),
          content: fetched.content || '',
          tags: fetched.tags || [],
          category: fetched.category || '',
          published: fetched.published !== false,
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

  // Puts an uploaded image (or a link to a PDF) where the cursor is in the editor.
  const insertMedia = (item: MediaItem) => {
    setPicking(false);
    const snippet = item.contentType.startsWith('image/')
      ? `![${item.filename.replace(/\.[^.]+$/, '')}](${item.url})`
      : `[${item.filename}](${item.url})`;
    const textarea = document.querySelector<HTMLTextAreaElement>('.w-md-editor-text-input');
    setBlog((b) => {
      // The textarea remembers its cursor position even after losing focus.
      const at = textarea ? Math.min(textarea.selectionStart, b.content.length) : b.content.length;
      const before = b.content.slice(0, at);
      const sep = before && !before.endsWith('\n') ? '\n\n' : '';
      return { ...b, content: `${before}${sep}${snippet}\n${b.content.slice(at)}` };
    });
  };

  const handleSave = async (publish: boolean) => {
    const slug = blog.slug.replace(/^-+|-+$/g, '');
    if (!blog.title.trim()) return setError('Please enter a title.');
    if (!slug) return setError('Please enter a URL slug.');
    if (!blog.content.trim()) return setError('Please write some content.');

    const payload = { title: blog.title, slug, content: blog.content, tags: blog.tags, category: blog.category, published: publish };
    setSaving(true);
    setError(null);
    try {
      if (id) {
        await axios.put(`/api/blogs/${encodeURIComponent(id)}`, payload);
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
  if (invalidId) {
    return (
      <div className="container mx-auto p-4">
        This edit link is not valid. <Link href="/admin" className="text-accent-ink hover:underline">Back to Admin Panel</Link>
      </div>
    );
  }
  if (loading) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="bg-bg p-4">
      <div className="mx-auto w-full max-w-[1200px] px-2 pt-4">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/admin"
            className="group inline-flex items-center gap-2 p-2 rounded-md bg-bg hover:bg-surface hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-surface rounded-md group-hover:bg-bg">
              <ArrowLeft className="h-4 w-4 text-accent-ink" />
            </div>
            <span className="text-ink">Back to Admin Panel</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${blog.published ? 'bg-cat-notes/20 text-ink' : 'border border-accent/60 bg-accent/10 text-accent-ink'}`}>
              {blog.published ? 'Published' : 'Draft'}
            </span>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 font-semibold text-ink transition hover:bg-chip disabled:opacity-60"
            >
              {blog.published ? 'Unpublish (make draft)' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-bold text-on-accent transition hover:opacity-90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : blog.published ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 border border-danger/40 bg-danger/10 text-danger rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="post-title" className="block text-xl font-medium text-ink mb-1">Post Title</label>
              <input
                id="post-title"
                type="text"
                placeholder="Enter post title..."
                value={blog.title}
                maxLength={300}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3 border rounded-lg text-base border-line bg-surface text-ink"
              />
            </div>

            <div>
              <label htmlFor="post-slug" className="block text-xl font-medium text-ink mb-1">URL</label>
              <div className="flex items-center rounded-lg border border-line overflow-hidden">
                <span className="px-3 py-3 bg-surface-2 text-muted text-base border-r border-line whitespace-nowrap">/post/</span>
                <input
                  id="post-slug"
                  type="text"
                  value={blog.slug}
                  maxLength={200}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full p-3 text-base bg-surface text-ink focus:outline-none"
                />
              </div>
              {id && (
                <p className="mt-1 text-sm text-muted">Changing the URL of a published post breaks links that point to it.</p>
              )}
            </div>

            <div>
              <label htmlFor="post-category" className="block text-xl font-medium text-ink mb-1">Category</label>
              <select
                id="post-category"
                value={blog.category}
                onChange={(e) => setBlog((b) => ({ ...b, category: e.target.value }))}
                className="w-full p-3 border rounded-lg text-base border-line bg-surface text-ink"
              >
                <option value="">No category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="post-tag" className="block text-xl font-medium text-ink mb-1">Tags</label>
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
                  className="w-full p-3 border rounded-lg text-base border-line bg-surface text-ink"
                />
                <button
                  type="button"
                  aria-label="Add tag"
                  onClick={handleAddTag}
                  className="flex items-center gap-2 px-3 py-3 bg-accent text-on-accent font-bold rounded-lg hover:opacity-90 transition"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {blog.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 bg-chip text-ink text-base px-2 py-2 rounded-full">
                    <span className="leading-none relative top-[-1.5px]">{tag}</span>
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => handleRemoveTag(tag)}
                      className="flex items-center justify-center text-danger hover:opacity-80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xl font-medium text-ink">Content (Markdown)</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPicking(true)} className="flex items-center gap-2 p-2 border border-line rounded-lg hover:bg-chip text-ink">
                    <ImagePlus className="h-4 w-4" />
                    Insert image / file
                  </button>
                  <label className="flex items-center gap-2 p-2 border border-line rounded-lg cursor-pointer hover:bg-chip text-ink">
                    <Upload className="h-4 w-4" />
                    Upload .md
                    <input type="file" accept=".md,text/markdown" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="editor-theme" data-color-mode={theme}>
                <MDEditor
                  value={blog.content}
                  onChange={(value) => setBlog((b) => ({ ...b, content: value || '' }))}
                  preview="live"
                  height={650}
                  className="border border-line rounded-lg"
                  previewOptions={markdownPreviewOptions}
                />
              </div>
              {picking && <MediaPicker accept="any" onClose={() => setPicking(false)} onSelect={insertMedia} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
