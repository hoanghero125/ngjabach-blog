import { Field, getSection, SectionKey } from './schema';

// Server-side checks for Admin → Site content. Everything sent by the browser
// is untrusted: wrong types, unknown keys, huge strings and dangerous links
// (javascript:, data:, //evil.com) are all rejected or dropped here.

type Result = { value: unknown } | { error: string };

const URL_RE = /^(https?:\/\/[^\s<>"']+|mailto:[^\s<>"']+|\/(?!\/)[^\s<>"']*)$/i;
const MEDIA_RE = /^(https:\/\/[^\s<>"']+|\/(?!\/)[^\s<>"']*)$/i;
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

function checkField(field: Field, raw: unknown, path: string): Result {
  const where = `${path}${field.label}`;
  const fail = (msg: string): Result => ({ error: `${where}: ${msg}` });

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'url':
    case 'email':
    case 'media':
    case 'select': {
      if (raw === undefined || raw === null) raw = '';
      if (typeof raw !== 'string') return fail('must be text');
      const value = raw.trim();
      if (!value) return field.required ? fail('is required') : { value: '' };
      if (field.max && value.length > field.max) return fail(`must be at most ${field.max} characters`);
      if (field.type === 'url' && !URL_RE.test(value)) return fail('must start with https://, http://, mailto: or /');
      if (field.type === 'media' && !MEDIA_RE.test(value)) return fail('must be an uploaded file or an https:// link');
      if (field.type === 'email' && !EMAIL_RE.test(value)) return fail('is not a valid email address');
      if (field.type === 'select' && !field.options?.includes(value)) return fail(`must be one of: ${field.options?.join(', ')}`);
      return { value };
    }
    case 'number': {
      if ((raw === '' || raw === undefined || raw === null) && !field.required) return { value: field.min ?? 0 };
      const n = typeof raw === 'string' ? Number(raw) : raw;
      if (typeof n !== 'number' || !Number.isInteger(n)) return fail('must be a whole number');
      if (field.min !== undefined && n < field.min) return fail(`must be at least ${field.min}`);
      if (field.max !== undefined && n > field.max) return fail(`must be at most ${field.max}`);
      return { value: n };
    }
    case 'checkbox':
      if (raw === undefined || raw === null) return { value: false };
      if (typeof raw !== 'boolean') return fail('must be on or off');
      return { value: raw };
    case 'lines': {
      if (raw === undefined || raw === null) raw = [];
      if (!Array.isArray(raw) || raw.some((x) => typeof x !== 'string')) return fail('must be a list of text lines');
      const lines = (raw as string[]).map((x) => x.trim()).filter(Boolean);
      if (field.required && lines.length === 0) return fail('needs at least one line');
      if (field.maxItems && lines.length > field.maxItems) return fail(`can have at most ${field.maxItems} lines`);
      const tooLong = lines.find((l) => field.max && l.length > field.max);
      if (tooLong) return fail(`each line must be at most ${field.max} characters`);
      return { value: lines };
    }
    case 'list': {
      if (raw === undefined || raw === null) raw = [];
      if (!Array.isArray(raw)) return fail('must be a list');
      if (field.maxItems && raw.length > field.maxItems) return fail(`can have at most ${field.maxItems} entries`);
      const items: unknown[] = [];
      for (let i = 0; i < raw.length; i++) {
        const r = checkObject(field.fields || [], raw[i], `${where} › ${field.itemLabel || 'entry'} ${i + 1} › `);
        if ('error' in r) return r;
        items.push(r.value);
      }
      return { value: items };
    }
    default:
      return fail('has an unknown type');
  }
}

function checkObject(fields: Field[], raw: unknown, path: string): Result {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: `${path}must be an object` };
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const r = checkField(field, (raw as Record<string, unknown>)[field.key], path);
    if ('error' in r) return r;
    out[field.key] = r.value;
  }
  return { value: out }; // unknown keys are dropped
}

/** Validates and normalises one section. Returns { value } or { error }. */
export function validateSection(key: string, data: unknown): Result {
  const section = getSection(key);
  if (!section) return { error: 'Unknown section' };
  if (section.kind === 'object') return checkObject(section.fields, data, `${section.label} › `);
  return checkField(
    { key: section.key, label: section.label, type: 'list', fields: section.fields, maxItems: section.maxItems, itemLabel: section.itemLabel },
    data,
    ''
  );
}

export type { SectionKey };
