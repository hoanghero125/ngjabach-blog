import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import SiteContentModel from '@/lib/models/SiteContent';
import { requireAuth } from '@/lib/auth';
import { getSiteContent, SITE_PAGES } from '@/lib/site/load';
import { validateSection } from '@/lib/site/validate';
import { DEFAULT_SITE } from '@/lib/site/defaults';
import { SECTION_KEYS } from '@/lib/site/schema';

// GET  /api/site                       -> all site content (public)
// PUT  /api/site { section, data }     -> save one section (admin only)

async function getSite(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    return res.status(200).json(await getSiteContent());
  } catch (err) {
    console.error('Site content read failed, serving defaults:', err);
    return res.status(200).json(DEFAULT_SITE);
  }
}

async function saveSection(req: NextApiRequest, res: NextApiResponse) {
  const { section, data } = (req.body || {}) as { section?: unknown; data?: unknown };
  if (typeof section !== 'string' || !(SECTION_KEYS as readonly string[]).includes(section)) {
    return res.status(400).json({ message: 'Unknown section' });
  }
  const result = validateSection(section, data);
  if ('error' in result) return res.status(400).json({ message: result.error });

  try {
    await dbConnect();
    await SiteContentModel.updateOne(
      { key: 'main' },
      { $set: { [`data.${section}`]: result.value, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error('Site content save failed:', err);
    return res.status(500).json({ message: 'Server error' });
  }

  // Rebuild the public pages now so the change shows up immediately.
  let refreshed = true;
  try {
    await Promise.all(SITE_PAGES.map((path) => res.revalidate(path)));
  } catch (err) {
    refreshed = false;
    console.warn('Page refresh after save failed (pages update within 5 minutes):', err);
  }
  return res.status(200).json({ section, data: result.value, refreshed });
}

const protectedSave = requireAuth(saveSection);

export const config = { api: { bodyParser: { sizeLimit: '512kb' } } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getSite(req, res);
  if (req.method === 'PUT') return protectedSave(req, res);
  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ message: 'Method not allowed' });
}
