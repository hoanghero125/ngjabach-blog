const Blog = require('./models/Blog');

// Appends -1, -2, ... until the slug is unused by any other post.
async function generateUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let count = 0;
  const filter = (s) => (excludeId ? { slug: s, _id: { $ne: excludeId } } : { slug: s });
  while (await Blog.exists(filter(slug))) {
    count++;
    slug = `${baseSlug}-${count}`;
  }
  return slug;
}

// Rewrites `order` so the given id list (top of the page first) is stored as
// n-1 ... 0, matching the descending sort used by GET /api/blogs.
async function writeOrder(idsTopFirst) {
  const n = idsTopFirst.length;
  if (n === 0) return;
  await Blog.bulkWrite(
    idsTopFirst.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: n - 1 - i } } },
    }))
  );
}

module.exports = { generateUniqueSlug, writeOrder };
