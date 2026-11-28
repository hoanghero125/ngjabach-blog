import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Media from '@/lib/models/Media';
import { requireAuth } from '@/lib/auth';
import { cleanFilename, MAX_UPLOAD_BYTES, readBody, sniffType } from '@/lib/media-server';

// GET  /api/media                       -> list uploads (admin only)
// POST /api/media?filename=photo.jpg    -> upload; body = the raw file (admin only)

export const config = { api: { bodyParser: false } };

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
}

const toItem = (doc: { _id: unknown; filename: string; contentType: string; size: number; createdAt: Date }): MediaItem => ({
  id: String(doc._id),
  url: `/api/media/${doc._id}`,
  filename: doc.filename,
  contentType: doc.contentType,
  size: doc.size,
  createdAt: new Date(doc.createdAt).toISOString(),
});

async function list(_req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    const docs = await Media.find().select('-data').sort({ createdAt: -1 }).limit(500).lean();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(docs.map((d) => toItem(d as unknown as Parameters<typeof toItem>[0])));
  } catch (err) {
    console.error('Media list error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function upload(req: NextApiRequest, res: NextApiResponse) {
  const body = await readBody(req);
  if (!body) return res.status(413).json({ message: `File is too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).` });
  const type = sniffType(body);
  if (!type) return res.status(415).json({ message: 'Only JPEG, PNG, WebP, GIF images and PDF files are allowed.' });

  try {
    await dbConnect();
    const doc = await Media.create({
      filename: cleanFilename(req.query.filename, type.ext),
      contentType: type.contentType,
      size: body.length,
      data: body,
    });
    return res.status(201).json(toItem(doc));
  } catch (err) {
    console.error('Media upload error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

const protectedList = requireAuth(list);
const protectedUpload = requireAuth(upload);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return protectedList(req, res);
  if (req.method === 'POST') return protectedUpload(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
