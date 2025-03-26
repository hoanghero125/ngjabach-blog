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
  if (this.isModified('title') || !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') 
      .replace(/-+/g, '-'); 

    let slug = baseSlug;
    let count = 0;
    while (await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    this.slug = slug;
  }

  if (!this.order && this.order !== 0) {
    const lastBlog = await mongoose.models.Blog.findOne().sort({ order: -1 });
    this.order = lastBlog ? lastBlog.order + 1 : 0;
  }

  next();
});

module.exports = mongoose.model('Blog', blogSchema);