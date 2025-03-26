const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');

// Hàm kiểm tra ObjectId hợp lệ
const isValidObjectId = (id) => {
  if (typeof id !== 'string') {
    return false;
  }
  return mongoose.Types.ObjectId.isValid(id);
};

// GET / - Lấy tất cả blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ order: 1 });
    res.json(blogs);
  } catch (err) {
    console.error('GET / error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /slug/:slug - Lấy blog theo slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: `Blog with slug "${req.params.slug}" not found` });
    }
    res.json(blog);
  } catch (err) {
    console.error('GET /slug/:slug error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /:id - Lấy blog theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.error('GET /:id - Invalid ObjectId:', id);
    return res.status(400).json({ message: 'Invalid blog ID', invalidId: id });
  }

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('GET /:id error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST / - Tạo blog mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = new Blog({ title, content });
    await blog.save();

    const blogCount = await Blog.countDocuments();
    blog.order = blogCount - 1;
    await blog.save();

    res.status(201).json(blog);
  } catch (err) {
    console.error('POST / error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /swap/:id1/:id2 - Hoán đổi vị trí hai blog
router.put('/swap/:id1/:id2', authMiddleware, async (req, res) => {
  const { id1, id2 } = req.params;
  console.log('Requested swap between blogs:', { id1, id2 });

  if (!isValidObjectId(id1) || !isValidObjectId(id2)) {
    console.error('PUT /swap/:id1/:id2 - Invalid ObjectId:', { id1, id2 });
    return res.status(400).json({ message: 'Invalid blog IDs', invalidIds: { id1, id2 } });
  }

  try {
    const blog1 = await Blog.findById(id1);
    const blog2 = await Blog.findById(id2);

    if (!blog1 || !blog2) {
      console.error('PUT /swap/:id1/:id2 - One or both blogs not found:', { id1: !!blog1, id2: !!blog2 });
      return res.status(404).json({ message: 'One or both blogs not found' });
    }

    if (blog1.order == null || blog2.order == null) {
      console.error('PUT /swap/:id1/:id2 - One or both blogs do not have order field:', { id1: blog1.order, id2: blog2.order });
      return res.status(400).json({ message: 'One or both blogs do not have order field. Please run migration script.' });
    }

    const tempOrder = blog1.order;
    blog1.order = blog2.order;
    blog2.order = tempOrder;

    await blog1.save();
    await blog2.save();

    console.log('Swapped blog orders:', { id1: { order: blog1.order }, id2: { order: blog2.order } });
    res.json({ message: 'Blog positions swapped successfully' });
  } catch (err) {
    console.error('PUT /swap/:id1/:id2 error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /:id - Cập nhật blog
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.error('PUT /:id - Invalid ObjectId:', id);
    return res.status(400).json({ message: 'Invalid blog ID', invalidId: id });
  }

  try {
    const { title, content } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    console.error('PUT /:id error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /:id - Xóa blog
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.error('DELETE /:id - Invalid ObjectId:', id);
    return res.status(400).json({ message: 'Invalid blog ID', invalidId: id });
  }

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
    console.error('DELETE /:id error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;