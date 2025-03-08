const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');

router.get('/:id', async (req, res) => {
  try {
    console.log('Requested blog ID:', req.params.id); // Debug
    const blog = await Blog.findById(req.params.id);
    console.log('Found blog:', blog); // Debug
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('GET /:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find();
    console.log('All blogs:', blogs); // Debug
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = new Blog({ title, content });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;