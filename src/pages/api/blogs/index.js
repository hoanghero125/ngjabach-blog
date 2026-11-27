const dbConnect = require('../../../lib/db');
const Blog = require('../../../lib/models/Blog');
const { requireAuth } = require('../../../lib/auth');
const { validateBlogInput } = require('../../../lib/validate');
const { generateUniqueSlug } = require('../../../lib/blogs');

async function listBlogs(req, res) {
  try {
    await dbConnect();
    const blogs = await Blog.find().sort({ order: -1 });
    return res.status(200).json(blogs);
  } catch (err) {
    console.error('List blogs error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function createBlog(req, res) {
  const { value, error } = validateBlogInput(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    await dbConnect();
    const slug = await generateUniqueSlug(value.slug);
    const top = await Blog.findOne().sort({ order: -1 }).select('order');
    const blog = await Blog.create({ ...value, slug, order: top ? top.order + 1 : 0 });
    return res.status(201).json(blog);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A post with this slug already exists' });
    }
    console.error('Create blog error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

const protectedCreate = requireAuth(createBlog);

export default function handler(req, res) {
  if (req.method === 'GET') return listBlogs(req, res);
  if (req.method === 'POST') return protectedCreate(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
