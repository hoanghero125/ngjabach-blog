const dbConnect = require('../../../../lib/db');
const Blog = require('../../../../lib/models/Blog');
const { isSlug } = require('../../../../lib/validate');
const { getSessionUser } = require('../../../../lib/auth');

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
    // Drafts are only visible to the logged-in admin (preview).
    if (blog.published === false && !(await getSessionUser(req))) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(blog);
  } catch (err) {
    console.error('Get blog by slug error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
