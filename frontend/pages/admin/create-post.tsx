import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import slugify from 'slugify';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}`, {
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
    // console.log('Data being sent to backend:', payload);

    try {
      setError(null);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (id) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, payload, config);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, payload, config);
      }
      router.push('/admin');
    } catch (err: any) {
      // console.error('Failed to save blog:', err.response?.data || err.message);
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}