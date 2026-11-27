const dbConnect = require('../../../lib/db');
const Blog = require('../../../lib/models/Blog');
const { requireAuth } = require('../../../lib/auth');
const { isObjectId } = require('../../../lib/validate');
const { writeOrder } = require('../../../lib/blogs');

// PUT { ids: [...] } — the complete list of post ids, top of the page first.
// Saving the whole order in one request replaces the old pairwise swap
// endpoint, which got called on every drag step and could scramble the order.
async function reorder(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isObjectId) || new Set(ids).size !== ids.length) {
    return res.status(400).json({ message: 'ids must be a list of unique blog IDs' });
  }

  try {
    await dbConnect();
    const existing = await Blog.find().select('_id');
    const existingIds = new Set(existing.map((b) => String(b._id)));
    if (existingIds.size !== ids.length || !ids.every((id) => existingIds.has(id))) {
      return res.status(409).json({ message: 'The post list changed. Reload and try again.' });
    }
    await writeOrder(ids);
    return res.status(200).json({ message: 'Order saved' });
  } catch (err) {
    console.error('Reorder error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(reorder);
