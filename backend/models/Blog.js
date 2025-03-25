const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // Thêm trường slug, unique: true đã tự động tạo index
  content: { type: String, required: true }, // Markdown content
  createdAt: { type: Date, default: Date.now },
});

// Tự động tạo slug từ title trước khi lưu
blogSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, '-'); // Loại bỏ nhiều dấu gạch ngang liên tiếp

    // Xử lý slug trùng lặp
    let slug = baseSlug;
    let count = 0;
    while (await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    this.slug = slug;
  }
  next();
});

// Xóa dòng này vì unique: true đã tự động tạo index
// blogSchema.index({ slug: 1 });

module.exports = mongoose.model('Blog', blogSchema);