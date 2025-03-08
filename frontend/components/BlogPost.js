import ReactMarkdown from 'react-markdown';

export default function BlogPost({ blog }) {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <p className="text-gray-500 mb-6">{new Date(blog.createdAt).toLocaleDateString()}</p>
      <div className="prose">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>
    </div>
  );
}