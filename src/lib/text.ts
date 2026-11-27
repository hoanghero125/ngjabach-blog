// Small text helpers kept separate from markdown.tsx so list pages don't
// download the whole markdown renderer.

// HTML comments are used as notes-to-self in posts; never render them.
export const stripComments = (content: string) =>
  content.replace(/<!--[\s\S]*?-->/g, '').replace(/<!--/g, '').replace(/-->/g, '');

// Words per minute, ignoring fenced code blocks and link targets.
export const readingTime = (content: string): number => {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
