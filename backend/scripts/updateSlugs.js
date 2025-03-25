const mongoose = require('mongoose');
const Blog = require('../models/Blog');
require('dotenv').config();

const updateSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const blogs = await Blog.find();
    for (const blog of blogs) {
      if (!blog.slug) {
        blog.slug = blog.title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        await blog.save();
        console.log(`Updated slug for blog: ${blog.title} -> ${blog.slug}`);
      }
    }

    console.log('All blogs updated with slugs');
  } catch (err) {
    console.error('Error updating slugs:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateSlugs();