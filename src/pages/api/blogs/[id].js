const mongoose = require('mongoose');
const dbConnect = require('../../../lib/db');
const Blog = require('../../../lib/models/Blog');
const authMiddleware = require('../../../lib/middleware/auth');

const isValidObjectId = (id) => {
  if (typeof id !== 'string') {
    return false;
  }
  return mongoose.Types.ObjectId.isValid(id);
};

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
  const { id } = req.query;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid blog ID', invalidId: id });
  }

  switch (method) {
    case 'GET':
      try {
        const blog = await Blog.findById(id);
        if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
      break;

    case 'PUT':
      try {
        const { title, slug, content, tags } = req.body;

        if (!title || !slug || !content) {
          return res.status(400).json({ message: 'Title, slug, and content are required' });
        }

        const trimmedSlug = slug.trim();
        const uniqueSlug = await generateUniqueSlug(trimmedSlug, id);

        const blog = await Blog.findByIdAndUpdate(
          id,
          { title, slug: uniqueSlug, content, tags: tags || [] },
          { new: true }
        );

        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
      break;

    case 'DELETE':
      try {
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        await Blog.deleteOne({ _id: id });

        const remainingBlogs = await Blog.find().sort({ order: 1 });
        for (let i = 0; i < remainingBlogs.length; i++) {
          remainingBlogs[i].order = i;
          await remainingBlogs[i].save();
        }

        res.json({ message: 'Blog deleted and orders updated' });
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default function apiHandler(req, res) {
  if (req.method === 'PUT' || req.method === 'DELETE') {
    return authMiddleware(handler)(req, res);
  }
  return handler(req, res);
}