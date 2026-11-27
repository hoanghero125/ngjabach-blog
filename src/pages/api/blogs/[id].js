const dbConnect = require('../../../lib/db');
const Blog = require('../../../lib/models/Blog');
const { requireAuth } = require('../../../lib/auth');
const { isObjectId, validateBlogInput } = require('../../../lib/validate');
const { generateUniqueSlug, writeOrder } = require('../../../lib/blogs');

async function getBlog(req, res, id) {
  try {
    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    return res.status(200).json(blog);
  } catch (err) {
    console.error('Get blog error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateBlog(req, res) {
  const { id } = req.query;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid blog ID' });
  const { value, error } = validateBlogInput(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    await dbConnect();
    const slug = await generateUniqueSlug(value.slug, id);
    // $eq makes the id a plain value, never a query operator.
    const blog = await Blog.findOneAndUpdate(
      { _id: { $eq: id } },
      { title: value.title, slug, content: value.content, tags: value.tags },
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    return res.status(200).json(blog);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A post with this slug already exists' });
    }
    console.error('Update blog error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteBlog(req, res) {
  const { id } = req.query;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid blog ID' });
  try {
    await dbConnect();
    const result = await Blog.deleteOne({ _id: { $eq: id } });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Blog not found' });

    // Close the gap left in the ordering.
    const remaining = await Blog.find().sort({ order: -1 }).select('_id');
    await writeOrder(remaining.map((b) => b._id));
    return res.status(200).json({ message: 'Blog deleted' });
  } catch (err) {
    console.error('Delete blog error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

const protectedUpdate = requireAuth(updateBlog);
const protectedDelete = requireAuth(deleteBlog);

export default function handler(req, res) {
  const { id } = req.query;
  if (!isObjectId(id)) {
    return res.status(400).json({ message: 'Invalid blog ID' });
  }
  switch (req.method) {
    case 'GET':
      return getBlog(req, res, id);
    case 'PUT':
      return protectedUpdate(req, res);
    case 'DELETE':
      return protectedDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
