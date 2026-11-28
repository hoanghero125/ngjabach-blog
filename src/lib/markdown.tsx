import React, { useRef, useState } from 'react';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy, Link as LinkIcon } from 'lucide-react';

// Shared by the public post page and the admin editor preview, so the preview
// shows exactly what readers will see. All colours come from the theme tokens.

// Raw HTML in posts is allowed, but it is cleaned first: scripts, event
// handlers (onclick=...), javascript: links, iframes and inline styles are
// removed. This is GitHub's own allow-list plus the classes math needs.
const sanitizeSchema = {
  ...defaultSchema,
  // Keep ids as written so in-page links (#section, footnotes) keep working.
  clobber: [],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./, 'math-inline', 'math-display']],
  },
};

export const remarkPlugins: PluggableList = [remarkGfm, remarkMath, remarkEmoji];

// Order matters: sanitize the author's HTML first, then add heading ids, math
// and code highlighting (which produce trusted markup).
export const rehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeSanitize, sanitizeSchema],
  rehypeSlug,
  rehypeKatex,
  rehypeHighlight,
];

export { readingTime, stripComments } from './text';

export function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = preRef.current?.querySelector('code')?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. non-HTTPS); nothing else to do.
    }
  };

  const codeChild = React.Children.toArray(children)[0] as React.ReactElement<{ className?: string }>;
  const langClass = codeChild?.props?.className || '';
  const lang = langClass.match(/language-([\w+#-]+)/)?.[1] || '';

  return (
    <div className="relative my-6 overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-1.5">
        <span className="font-mono text-xs text-faint">{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-muted transition-colors hover:text-ink"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-cat-notes" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="m-0 overflow-x-auto bg-code-bg p-4 font-mono text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

const scrollToHash = (e: React.MouseEvent, hash: string) => {
  e.preventDefault();
  history.pushState(null, '', hash);
  document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
};

function HeadingAnchor({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className="ml-2 inline-block align-middle opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      onClick={(e) => scrollToHash(e, `#${id}`)}
    >
      <LinkIcon className="h-4 w-4 text-faint hover:text-accent-ink" />
    </a>
  );
}

export const markdownComponents: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-') || className?.includes('hljs');
    if (isBlock) return <code className={className}>{children}</code>;
    return <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-[0.88em] text-code-inline">{children}</code>;
  },
  // Plain <img>: next/image would crash on any host not allow-listed in
  // next.config.ts, and post images can come from anywhere.
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === 'string' ? src : ''} alt={alt || ''} loading="lazy" className="my-4 h-auto max-w-full rounded-xl" />
  ),
  a: ({ href, children }) => {
    if (href?.startsWith('#')) {
      return (
        <a href={href} className="text-accent-ink underline decoration-line underline-offset-2 hover:decoration-accent" onClick={(e) => scrollToHash(e, href)}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} className="text-accent-ink underline decoration-line underline-offset-2 hover:decoration-accent" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-[15px]">{children}</table>
    </div>
  ),
  th: ({ children, style }) => (
    <th style={style} className="border-b border-line bg-surface-2 px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border-b border-line px-4 py-2">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-2xl border border-line bg-callout px-5 py-3 italic text-muted [&_p]:!mb-2 [&_p]:!text-muted [&_p:last-child]:!mb-0">
      {children}
    </blockquote>
  ),
  h1: ({ children, id }) => (
    <h2 id={id} className="group mb-3 mt-10 scroll-mt-6 border-b border-line pb-2 font-display text-[30px] font-semibold leading-snug text-ink">
      {children}
      <HeadingAnchor id={id} />
    </h2>
  ),
  h2: ({ children, id }) => (
    <h2 id={id} className="group mb-3 mt-10 scroll-mt-6 font-display text-[26px] font-semibold leading-snug text-ink">
      {children}
      <HeadingAnchor id={id} />
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="group mb-2 mt-7 scroll-mt-6 font-display text-[21px] font-semibold leading-snug text-ink">
      {children}
      <HeadingAnchor id={id} />
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="mb-2 mt-5 scroll-mt-6 text-lg font-bold text-ink">
      {children}
    </h4>
  ),
  h5: ({ children, id }) => (
    <h5 id={id} className="mb-2 mt-4 scroll-mt-6 text-base font-bold text-ink">
      {children}
    </h5>
  ),
  h6: ({ children, id }) => (
    <h6 id={id} className="mb-2 mt-4 scroll-mt-6 text-sm font-bold uppercase tracking-wide text-faint">
      {children}
    </h6>
  ),
  ul: ({ children }) => <ul className="mb-5 list-outside list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-5 list-outside list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li className="text-[18px] leading-relaxed text-ink">{children}</li>,
  hr: () => <hr className="my-8 border-line" />,
  strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="text-faint line-through">{children}</del>,
  p: ({ children }) => <p className="mb-5 text-[18px] leading-[1.75] text-ink">{children}</p>,
};
