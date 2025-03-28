import { useState, useEffect, RefObject } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowUp, ArrowDown, Edit, Trash, Plus, Calendar, Search, Tag } from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  tags?: string[];
  order: number;
}

const ItemType = 'BLOG';

interface DraggableBlogProps {
  blog: Blog;
  index: number;
  moveBlog: (fromIndex: number, toIndex: number) => void;
  handleEdit: (blog: Blog) => void;
  handleDelete: (id: string) => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const DraggableBlog = ({ blog, index, moveBlog, handleEdit, handleDelete, handleMoveUp, handleMoveDown, isFirst, isLast }: DraggableBlogProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveBlog(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const ref = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  const uniqueTags = [...new Set(blog.tags || ['General'])];

  return (
    <div
      ref={ref as unknown as RefObject<HTMLDivElement>}
      className={`p-4 border border-gray-200 rounded-lg flex justify-between items-start ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-black">{blog.title}</h3>
        <div className="flex items-center gap-6 mt-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-1 flex-wrap">
              {uniqueTags.map((tag, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  <span className="font-bold">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleMoveUp(index)}
          disabled={isFirst}
          className={`${
            isFirst ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 hover:text-blue-500'
          }`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleMoveDown(index)}
          disabled={isLast}
          className={`${
            isLast ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 hover:text-blue-500'
          }`}
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        <button onClick={() => handleEdit(blog)} className="text-gray-800 hover:text-blue-500">
          <Edit className="h-5 w-5" />
        </button>
        <button onClick={() => handleDelete(blog._id)} className="text-red-500 hover:text-red-600">
          <Trash className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default function Admin() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
    if (!storedToken) {
      router.push('/admin/login');
    } else {
      fetchBlogs(storedToken);
    }
  }, [router]);

  const fetchBlogs = async (authToken: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBlogs(res.data);
      setError(null);
    } catch (err: any) {
      // console.error('Failed to fetch blogs:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        router.push('/admin/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch blogs. Please try again.');
      }
    }
  };

  const handleEdit = (blog: Blog) => {
    router.push(`/admin/create-post?id=${blog._id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs(token!);
      setError(null);
    } catch (err: any) {
      // console.error('Failed to delete blog:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        router.push('/admin/login');
      } else {
        setError(err.response?.data?.message || 'Failed to delete blog. Please try again.');
      }
    }
  };

  const moveBlog = async (fromIndex: number, toIndex: number) => {
    const originalBlogs = [...blogs];
    const updatedBlogs = [...blogs];
    const [movedBlog] = updatedBlogs.splice(fromIndex, 1);
    updatedBlogs.splice(toIndex, 0, movedBlog);
    setBlogs(updatedBlogs);

    const id1 = originalBlogs[fromIndex]._id;
    const id2 = originalBlogs[toIndex]._id;
    // console.log('Swapping blogs:', { id1, fromIndex, id2, toIndex });

    try {
      const swapUrl = `${process.env.NEXT_PUBLIC_API_URL}/blogs/swap/${id1}/${id2}`;
      await axios.put(
        swapUrl,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setError(null);
    } catch (err: any) {
      // console.error('Failed to swap blog positions:', err.response?.data || err.message || err);
      let errorMessage = 'Failed to swap blog positions.';
      if (err.response?.status === 404) {
        errorMessage = 'Swap endpoint not found. Please check if the backend server is running and the API URL is correct.';
      } else if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        router.push('/admin/login');
        return;
      }
      const errorDetails = err.response?.data?.error || err.response?.data?.invalidIds || '';
      setError(`${errorMessage}${errorDetails ? `: ${JSON.stringify(errorDetails)}` : ''} Reverting changes.`);
      setBlogs(originalBlogs);
      if (err.response?.status === 500 || err.response?.status === 404) {
        fetchBlogs(token!);
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    moveBlog(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === blogs.length - 1) return;
    moveBlog(index, index + 1);
  };

  const filteredBlogs = blogs.filter(
    (blog: Blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags && blog.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (!token) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-[#FAF9F6] flex flex-col">
        <div className="container mx-auto px-4 pt-4 pb-8 flex-grow">
          <div className="max-w-[1325px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-5xl font-bold text-black">Admin Panel</h1>
              <Link href="/admin/create-post">
                <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                  <Plus className="h-5 w-5" />
                  <span className="text-base font-medium">Create New Post</span>
                </div>
              </Link>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts by title or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {filteredBlogs.map((blog: Blog, index: number) => (
                  <DraggableBlog
                    key={blog._id}
                    blog={blog}
                    index={index}
                    moveBlog={moveBlog}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleMoveUp={handleMoveUp}
                    handleMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === filteredBlogs.length - 1}
                  />
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500 rounded-lg">
                Showing {filteredBlogs.length} of {blogs.length} posts
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}