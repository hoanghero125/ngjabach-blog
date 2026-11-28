// Server-only helpers for uploads (see src/pages/api/media).
import type { NextApiRequest } from 'next';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel's request limit is 4.5 MB

/** Reads the raw request body, or returns null if it exceeds `limit` bytes. */
export function readBody(req: NextApiRequest, limit = MAX_UPLOAD_BYTES): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let tooBig = false;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > limit) {
        tooBig = true;
        chunks.length = 0;
        return;
      }
      if (!tooBig) chunks.push(chunk);
    });
    req.on('end', () => resolve(tooBig ? null : Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Works out the real file type from its first bytes (never trusting the
 * browser's claim). Only these types are accepted; SVG and HTML are not,
 * because they can carry scripts.
 */
export function sniffType(buf: Buffer): { contentType: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { contentType: 'image/jpeg', ext: 'jpg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { contentType: 'image/png', ext: 'png' };
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return { contentType: 'image/gif', ext: 'gif' };
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return { contentType: 'image/webp', ext: 'webp' };
  if (buf.subarray(0, 5).toString('ascii') === '%PDF-') return { contentType: 'application/pdf', ext: 'pdf' };
  return null;
}

/** A safe file name: letters, digits, dot, dash, underscore; with the right extension. */
export function cleanFilename(raw: unknown, ext: string): string {
  const base = (typeof raw === 'string' ? raw : 'file')
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]*$/, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${base || 'file'}.${ext}`;
}
