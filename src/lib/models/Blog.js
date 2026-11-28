const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  // One of the blog categories (src/lib/categories.ts), or '' for none.
  category: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  // Display position: the blog list shows the highest order first.
  order: { type: Number, default: 0 },
});

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
