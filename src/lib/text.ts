// Small text helpers kept separate from markdown.tsx so list pages don't
// download the whole markdown renderer.

// HTML comments are used as notes-to-self in posts; never render them.
// A plain scanner (not a regex): removes every <!-- ... --> block, and for an
// unclosed <!-- drops only the marker so the rest of the post still shows.
// This is not a security filter: rendered HTML is sanitized separately.
export const stripComments = (content: string): string => {
  let out = '';
  let i = 0;
  while (i < content.length) {
    const start = content.indexOf('<!--', i);
    if (start === -1) {
      out += content.slice(i);
      break;
    }
    out += content.slice(i, start);
    const end = content.indexOf('-->', start + 4);
    i = end === -1 ? start + 4 : end + 3;
  }
  return out;
};

// A one-line plain-text summary: the first real paragraph of the post.
export const excerpt = (content: string, max = 160): string => {
  const lines = stripComments(content)
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .map((l) => l.trim());
  const first =
    lines.find(
      (l) => l && !/^(#|\||>|---|\*\*\*|!\[|<|\$\$|[-*+] |\d+\. )/.test(l)
    ) || '';
  const text = first
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

// Words per minute, ignoring comments, fenced code blocks and link targets.
export const readingTime = (content: string): number => {
  const text = stripComments(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\]\([^)]*\)/g, ']');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
