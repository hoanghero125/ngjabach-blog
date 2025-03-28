const mongoose = require('mongoose');
const Blog = require('../models/Blog');
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('Connected to MongoDB');

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established properly');
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    const blogs = await Blog.find().sort({ createdAt: 1 });
    console.log(`Found ${blogs.length} blogs`);

    if (blogs.length === 0) {
      console.log('No blogs found to migrate');
      return;
    }

    for (let i = 0; i < blogs.length; i++) {
      blogs[i].order = i;
      await blogs[i].save();
      console.log(`Updated blog ID ${blogs[i]._id} with order ${i}`);
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrate();