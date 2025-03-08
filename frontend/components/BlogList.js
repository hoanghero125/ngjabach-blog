import Link from 'next/link';

export default function BlogList({ blogs }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            href={`/post/${blog._id}`}
            key={blog._id}
            className="block p-4 bg-white rounded shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-500 text-sm">{new Date(blog.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}