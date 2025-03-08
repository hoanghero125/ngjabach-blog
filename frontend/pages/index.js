import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        console.log('Fetched blogs:', res.data); // Debug
        setBlogs(res.data);
      } catch (err) {
        console.error('Failed to fetch blogs:', err.response?.data || err.message);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Blog</h1>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link href={`/post/${blog._id}`} key={blog._id} className="block">
            <div className="p-4 bg-white rounded shadow">{blog.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}