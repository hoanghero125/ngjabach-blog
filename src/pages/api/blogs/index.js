const mongoose = require('mongoose');
const dbConnect = require('../../../lib/db');
const Blog = require('../../../lib/models/Blog');
const authMiddleware = require('../../../lib/middleware/auth');

const generateUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let count = 0;
  while (await Blog.findOne({ slug, _id: { $ne: excludeId } })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }
  return slug;
};

async function handler(req, res) {
  await dbConnect();
  
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const blogs = await Blog.find().sort({ order: -1 });
        res.json(blogs);
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
      break;

    case 'POST':
      try {
        const { title, slug, content, tags } = req.body;

        if (!title || !slug || !content) {
          return res.status(400).json({ message: 'Title, slug, and content are required' });
        }

        const trimmedSlug = slug.trim();
        const uniqueSlug = await generateUniqueSlug(trimmedSlug);

        const blogData = {
          title,
          slug: uniqueSlug,
          content,
          tags: tags || [],
        };

        const blog = new Blog(blogData);
        await blog.save();

        const blogCount = await Blog.countDocuments();
        blog.order = blogCount - 1;
        await blog.save();

        res.status(201).json(blog);
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default function apiHandler(req, res) {
  if (req.method === 'POST') {
    return authMiddleware(handler)(req, res);
  }
  return handler(req, res);
}