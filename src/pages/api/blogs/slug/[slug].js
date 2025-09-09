const dbConnect = require('../../../../lib/db');
const Blog = require('../../../../lib/models/Blog');

export default async function handler(req, res) {
  await dbConnect();
  
  const { method } = req;
  const { slug } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: `Blog with slug "${slug}" not found` });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}