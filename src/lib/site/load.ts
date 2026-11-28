// Server-only: reads Admin → Site content from MongoDB.
// Import this ONLY from getStaticProps / API routes (it pulls in mongoose).
import dbConnect from '@/lib/db';
import SiteContentModel from '@/lib/models/SiteContent';
import { DEFAULT_SITE } from './defaults';
import { SECTION_KEYS, SiteContent } from './schema';
import { validateSection } from './validate';

/**
 * Saved sections win; anything missing or no longer valid (e.g. after a
 * future schema change) falls back to the built-in default for that section,
 * so a bad save can never break a page.
 */
export function mergeWithDefaults(saved: Record<string, unknown> | null | undefined): SiteContent {
  const out = JSON.parse(JSON.stringify(DEFAULT_SITE)) as SiteContent;
  if (!saved) return out;
  for (const key of SECTION_KEYS) {
    if (saved[key] === undefined) continue;
    const result = validateSection(key, saved[key]);
    if ('error' in result) {
      console.warn(`Site content "${key}" is invalid, using the default: ${result.error}`);
      continue;
    }
    (out as unknown as Record<string, unknown>)[key] = result.value;
  }
  return out;
}

export async function getSiteContent(): Promise<SiteContent> {
  await dbConnect();
  const doc = await SiteContentModel.findOne({ key: 'main' }).lean();
  return mergeWithDefaults((doc as { data?: Record<string, unknown> } | null)?.data);
}

/**
 * For getStaticProps. At build time an unreachable database falls back to
 * the defaults (the page refreshes itself later). At runtime it throws, so
 * Next.js keeps serving the last good version of the page instead.
 */
export async function loadSiteForPage(): Promise<SiteContent> {
  try {
    return await getSiteContent();
  } catch (err) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Site content unavailable during build, using defaults.');
      return mergeWithDefaults(null);
    }
    throw err;
  }
}

/** Pages that show site content, refreshed right after an admin save. */
export const SITE_PAGES = ['/', '/research', '/projects', '/cv'];
