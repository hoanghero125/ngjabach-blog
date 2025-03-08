import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function BlogPost({ blog: initialBlog }) {
  const [blog, setBlog] = useState(initialBlog);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const fetchLatestBlog = async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`);
          setBlog(res.data);
        } catch (err) {
          console.error('Failed to fetch latest blog:', err.response?.data || err.message);
        }
      };
      fetchLatestBlog();
    }
  }, [id]);

  if (!blog) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading or Blog Not Found...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>
      <div className="prose">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`);
    if (!res.data) {
      return { notFound: true };
    }
    return {
      props: { blog: res.data },
      revalidate: 10, // Still useful for background updates
    };
  } catch (err) {
    console.error('Failed to fetch blog:', err.response?.data || err.message);
    return { notFound: true };
  }
}