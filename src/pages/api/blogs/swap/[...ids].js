const mongoose = require('mongoose');
const dbConnect = require('../../../../lib/db');
const Blog = require('../../../../lib/models/Blog');
const authMiddleware = require('../../../../lib/middleware/auth');

const isValidObjectId = (id) => {
  if (typeof id !== 'string') {
    return false;
  }
  return mongoose.Types.ObjectId.isValid(id);
};

async function handler(req, res) {
  await dbConnect();
  
  const { method } = req;
  const { ids } = req.query;

  if (method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!ids || ids.length !== 2) {
    return res.status(400).json({ message: 'Two blog IDs are required' });
  }

  const [id1, id2] = ids;

  if (!isValidObjectId(id1) || !isValidObjectId(id2)) {
    return res.status(400).json({ message: 'Invalid blog IDs', invalidIds: { id1, id2 } });
  }

  try {
    const blog1 = await Blog.findById(id1);
    const blog2 = await Blog.findById(id2);

    if (!blog1 || !blog2) {
      return res.status(404).json({ message: 'One or both blogs not found' });
    }

    if (blog1.order == null || blog2.order == null) {
      return res.status(400).json({ message: 'One or both blogs do not have order field. Please run migration script.' });
    }

    const tempOrder = blog1.order;
    blog1.order = blog2.order;
    blog2.order = tempOrder;

    await blog1.save();
    await blog2.save();

    res.json({ message: 'Blog positions swapped successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export default authMiddleware(handler);