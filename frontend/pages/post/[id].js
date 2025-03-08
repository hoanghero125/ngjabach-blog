import axios from 'axios';

export default function BlogPost({ blog: initialBlog }) {
  if (!initialBlog) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading or Blog Not Found...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{initialBlog.title}</h1>
      <div className="prose">{initialBlog.content}</div>
    </div>
  );
}

export async function getStaticPaths() {
  // In development, avoid prerendering all paths to prevent build errors if backend is down
  return {
    paths: [], // No specific paths prerendered at build time
    fallback: 'blocking', // Generate pages on-demand at runtime
  };
}

export async function getStaticProps({ params }) {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`);
    if (!res.data) {
      return { notFound: true };
    }
    return {
      props: {
        blog: res.data, // Pass blog data (title, content, etc.) to the page
      },
      revalidate: 10, // Optional: Incremental Static Regeneration every 10 seconds
    };
  } catch (err) {
    console.error('Failed to fetch blog:', err.message);
    return { notFound: true }; // Return 404 if the blog isn’t found or API fails
  }
}