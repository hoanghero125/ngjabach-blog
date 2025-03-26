import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Eye, Save, Plus, X, Upload } from 'lucide-react';

interface Blog {
  _id?: string;
  title: string;
  content: string;
  tags: string[];
}

export default function CreatePost() {
  const [blog, setBlog] = useState<Blog>({ title: '', content: '', tags: [] });
  const [token, setToken] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
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
      // Đảm bảo tags luôn là mảng
      setBlog({ ...res.data, tags: res.data.tags || [] });
    } catch (err: any) {
      console.error('Failed to fetch blog:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setBlog({ ...blog, content: value || '' });
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
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (id) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, blog, config);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, blog, config);
      }
      router.push('/admin');
    } catch (err: any) {
      console.error('Failed to save blog:', err.response?.data || err.message);
    }
  };

  if (!token) return null;
  if (loading) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="bg-[#FAF9F6] min-h-screen p-4">
      <div className="max-w-[1325px] mx-auto">
        <div className="flex justify-between items-center mb-6">
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
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Save className="h-4 w-4" />
              Save Post
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
            <input
              type="text"
              placeholder="Enter post title..."
              value={blog.title}
              onChange={(e) => setBlog({ ...blog, title: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <button
                onClick={handleAddTag}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(blog.tags || []).map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full"
                >
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="text-red-500 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
            <div className="flex justify-end mb-2">
              <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100">
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
            {isPreview ? (
              <div className="p-4 bg-white border rounded-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {blog.content}
                </ReactMarkdown>
              </div>
            ) : (
              <MDEditor
                value={blog.content}
                onChange={handleEditorChange}
                style={{ height: '400px' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}