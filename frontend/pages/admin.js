import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Admin() {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState(null);
  const [token, setToken] = useState(null); // Move token to state
  const router = useRouter();

  useEffect(() => {
    // Set token on client-side only
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);

    if (!storedToken) {
      router.push('/login');
    } else {
      fetchBlogs(storedToken);
    }
  }, [router]); // Depend only on router, token is now state

  const fetchBlogs = async (authToken) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBlogs(res.data);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        router.push('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${editId}`, { title, content }, config);
        setEditId(null);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, { title, content }, config);
      }
      setTitle('');
      setContent('');
      fetchBlogs(token);
    } catch (err) {
      console.error('Failed to save blog:', err);
    }
  };

  const handleEdit = (blog) => {
    setEditId(blog._id);
    setTitle(blog.title);
    setContent(blog.content);
  };

  const handleDelete = async (id) => {
    console.log('Delete clicked for ID:', id);
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response.data);
      fetchBlogs(token);
    } catch (err) {
      console.error('Failed to delete blog:', err.response?.data || err.message);
    }
  };

  if (!token) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Content (Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-40"
        />
        <button type="submit" className="p-2 bg-green-500 text-white rounded">
          {editId ? 'Update' : 'Add'} Post
        </button>
      </form>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div key={blog._id} className="p-4 bg-white rounded shadow flex justify-between">
            <span>{blog.title}</span>
            <div>
              <button onClick={() => handleEdit(blog)} className="mr-2 text-blue-500">Edit</button>
              <button onClick={() => handleDelete(blog._id)} className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}