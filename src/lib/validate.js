// Input validation for the blog API. Every value from a request is untrusted:
// it may be a string, a number, an array or a MongoDB operator object such as
// {"$ne": null}. Only plain strings of sane length pass.

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const LIMITS = {
  title: 300,
  content: 500_000,
  tag: 50,
  tags: 20,
};

const isObjectId = (value) => typeof value === 'string' && OBJECT_ID_RE.test(value);

const isSlug = (value) => typeof value === 'string' && SLUG_RE.test(value);

// Returns { value } on success or { error } with a message for the client.
function validateBlogInput(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body' };
  const { title, slug, content, tags = [] } = body;

  if (typeof title !== 'string' || !title.trim()) return { error: 'Title is required' };
  if (title.trim().length > LIMITS.title) return { error: `Title must be at most ${LIMITS.title} characters` };

  if (typeof slug !== 'string' || !isSlug(slug.trim())) {
    return { error: 'Slug may only contain lowercase letters, numbers and hyphens' };
  }

  if (typeof content !== 'string' || !content.trim()) return { error: 'Content is required' };
  if (content.length > LIMITS.content) return { error: 'Content is too long' };

  if (!Array.isArray(tags) || tags.some((t) => typeof t !== 'string')) {
    return { error: 'Tags must be a list of text values' };
  }
  const cleanTags = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
  if (cleanTags.length > LIMITS.tags) return { error: `At most ${LIMITS.tags} tags are allowed` };
  if (cleanTags.some((t) => t.length > LIMITS.tag)) return { error: `Each tag must be at most ${LIMITS.tag} characters` };

  return {
    value: { title: title.trim(), slug: slug.trim(), content, tags: cleanTags },
  };
}

module.exports = { isObjectId, isSlug, validateBlogInput };
