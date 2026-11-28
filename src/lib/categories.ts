// Blog categories. Keep the slugs in sync with CATEGORY_SLUGS in src/lib/validate.js.

export const CATEGORIES = [
  { slug: 'paper-explainer', label: 'Paper explainers', short: 'Paper explainer', dot: 'bg-cat-paper' },
  { slug: 'ml-notes', label: 'ML notes & tutorials', short: 'ML notes', dot: 'bg-cat-notes' },
  { slug: 'paper-reading', label: 'Paper reading notes', short: 'Paper reading', dot: 'bg-cat-reading' },
  { slug: 'journey', label: 'Journey & personal', short: 'Journey', dot: 'bg-cat-life' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const findCategory = (slug?: string | null) => CATEGORIES.find((c) => c.slug === slug);
