const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, 
  content: { type: String, required: true }, 
  tags: { type: [String], default: [] }, 
  createdAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 }, 
});

blogSchema.pre('save', async function (next) {
  // console.log('Blog pre(save) - Before:', { title: this.title, slug: this.slug, content: this.content, tags: this.tags });

  if (!this.order && this.order !== 0) {
    const lastBlog = await mongoose.models.Blog.findOne().sort({ order: -1 });
    this.order = lastBlog ? lastBlog.order + 1 : 0;
  }

  // console.log('Blog pre(save) - After:', { title: this.title, slug: this.slug, content: this.content, tags: this.tags });
  next();
});

module.exports = mongoose.model('Blog', blogSchema);