const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');

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

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ order: 1 });
    res.json(blogs);
  } catch (err) {
    // console.error('GET / error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: `Blog with slug "${req.params.slug}" not found` });
    }
    res.json(blog);
  } catch (err) {
    // console.error('GET /slug/:slug error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    // console.error('GET /:id - Invalid ObjectId:', id);
    return res.status(400).json({ message: 'Invalid blog ID', invalidId: id });
  }

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    // console.error('GET /:id error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    // console.log('POST / - Request body:', req.body); 
    const { title, slug, content, tags } = req.body;

    if (!title || !slug || !content) {
      // console.log('POST / - Validation failed:', { title, slug, content });
      return res.status(400).json({ message: 'Title, slug, and content are required' });
    }

    const trimmedSlug = slug.trim();
    // console.log('POST / - Trimmed slug:', trimmedSlug);
    // console.log('POST / - Generating unique slug for:', trimmedSlug);
    const uniqueSlug = await generateUniqueSlug(trimmedSlug);
    // console.log('POST / - Unique slug generated:', uniqueSlug);

    const blogData = {
      title,
      slug: uniqueSlug,
      content,
      tags: tags || [],
    };
    // console.log('POST / - Blog data before save:', blogData);

    const blog = new Blog(blogData);
    // console.log('POST / - Blog instance after creation:', blog);

    await blog.save();

    const blogCount = await Blog.countDocuments();
    blog.order = blogCount - 1;
    await blog.save();

    // console.log('POST / - Blog saved successfully:', blog);
    res.status(201).json(blog);
  } catch (err) {
    // console.error('POST / error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/swap/:id1/:id2', authMiddleware, async (req, res) => {
  const { id1, id2 } = req.params;
  // console.log('Requested swap between blogs:', { id1, id2 });

  if (!isValidObjectId(id1) || !isValidObjectId(id2)) {
    // console.error('PUT /swap/:id1/:id2 - Invalid ObjectId:', { id1, id2 });
    return res.status(400).json({ message: 'Invalid blog IDs', invalidIds: { id1, id2 } });
  }

  try {
    const blog1 = await Blog.findById(id1);
    const blog2 = await Blog.findById(id2);

    if (!blog1 || !blog2) {
      // console.error('PUT /swap/:id1/:id2 - One or both blogs not found:', { id1: !!blog1, id2: !!blog2 });
      return res.status(404).json({ message: 'One or both blogs not found' });
    }

    if (blog1.order == null || blog2.order == null) {
      // console.error('PUT /swap/:id1/:id2 - One or both blogs do not have order field:', { id1: blog1.order, id2: blog2.order });
      return res.status(400).json({ message: 'One or both blogs do not have order field. Please run migration script.' });
    }

    const tempOrder = blog1.order;
    blog1.order = blog2.order;
    blog2.order = tempOrder;

    await blog1.save();
    await blog2.save();

    // console.log('Swapped blog orders:', { id1: { order: blog1.order }, id2: { order: blog2.order } });
    res.json({ message: 'Blog positions swapped successfully' });
  } catch (err) {
    // console.error('PUT /swap/:id1/:id2 error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    // console.error('PUT /:id - Invalid ObjectId:', id);
    return res.status(400).json({ message: 'Invalid blog ID', invalidId: id });
  }

  try {
    // console.log('PUT /:id - Request body:', req.body); // Debug log
    const { title, slug, content, tags } = req.body;

    if (!title || !slug || !content) {
      // console.log('PUT /:id - Validation failed:', { title, slug, content });
      return res.status(400).json({ message: 'Title, slug, and content are required' });
    }

    const trimmedSlug = slug.trim();
    // console.log('PUT /:id - Trimmed slug:', trimmedSlug);

    // console.log('PUT /:id - Generating unique slug for:', trimmedSlug);
    const uniqueSlug = await generateUniqueSlug(trimmedSlug, id);
    // console.log('PUT /:id - Unique slug generated:', uniqueSlug);

    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, slug: uniqueSlug, content, tags: tags || [] },
      { new: true }
    );

    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    // console.error('PUT /:id error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    // console.error('DELETE /:id - Invalid ObjectId:', id);
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
    // console.error('DELETE /:id error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;