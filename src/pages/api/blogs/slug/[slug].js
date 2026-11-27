const dbConnect = require('../../../../lib/db');
const Blog = require('../../../../lib/models/Blog');
const { isSlug } = require('../../../../lib/validate');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;
  if (!isSlug(slug)) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  try {
    await dbConnect();
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    return res.status(200).json(blog);
  } catch (err) {
    console.error('Get blog by slug error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
