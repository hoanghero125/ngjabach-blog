import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Media from '@/lib/models/Media';
import { requireAuth } from '@/lib/auth';
import { isObjectId } from '@/lib/validate';

// GET    /api/media/<id>  -> the file itself (public, cached for a year)
// DELETE /api/media/<id>  -> remove it (admin only)

async function serve(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!isObjectId(id)) return res.status(404).end();
  try {
    await dbConnect();
    const doc = await Media.findOne({ _id: { $eq: id } });
    if (!doc) return res.status(404).end();
    res.setHeader('Content-Type', doc.contentType);
    res.setHeader('Content-Length', String(doc.data.length));
    res.setHeader('Content-Disposition', `inline; filename="${doc.filename}"`);
    // Files never change (a new upload gets a new id), so browsers may keep them.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).end(doc.data);
  } catch (err) {
    console.error('Media serve error:', err);
    return res.status(500).end();
  }
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid file id' });
  try {
    await dbConnect();
    const result = await Media.deleteOne({ _id: { $eq: id } });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'File not found' });
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('Media delete error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

const protectedRemove = requireAuth(remove);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') return serve(req, res);
  if (req.method === 'DELETE') return protectedRemove(req, res);
  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}
