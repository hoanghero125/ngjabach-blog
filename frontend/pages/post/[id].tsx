import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Blog {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function BlogPost() {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to fetch blog:', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className="px-4 py-4">
      {loading ? (
        <div className="max-w-[1325px] mx-auto">Loading...</div>
      ) : !blog ? (
        <div className="max-w-[1325px] mx-auto">Blog not found</div>
      ) : (
        <div className="max-w-[1325px] mx-auto">
          <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}