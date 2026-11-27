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
// shows exactly what readers will see.

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
    <div className="relative my-6 rounded-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-mono text-gray-500">{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto p-4 m-0 text-sm leading-relaxed bg-gray-50">
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

function HeadingAnchor({ id, size = 'h-5 w-5', inline = false }: { id?: string; size?: string; inline?: boolean }) {
  if (!id) return null;
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className={
        inline
          ? 'ml-2 opacity-0 group-hover:opacity-100 transition-opacity'
          : 'absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity'
      }
      onClick={(e) => scrollToHash(e, `#${id}`)}
    >
      <LinkIcon className={`${inline ? 'inline ' : ''}${size} text-gray-400 hover:text-blue-500`} />
    </a>
  );
}

export const markdownComponents: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-') || className?.includes('hljs');
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-rose-600">{children}</code>
    );
  },
  // Plain <img>: next/image would crash on any host not allow-listed in
  // next.config.ts, and post images can come from anywhere.
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === 'string' ? src : ''} alt={alt || ''} loading="lazy" className="max-w-full h-auto rounded-lg my-4" />
  ),
  a: ({ href, children }) => {
    if (href?.startsWith('#')) {
      return (
        <a href={href} className="text-blue-500 hover:underline" onClick={(e) => scrollToHash(e, href)}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="border-collapse border border-gray-300 w-full">{children}</table>
    </div>
  ),
  th: ({ children, style }) => (
    <th style={style} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-base">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border border-gray-300 px-4 py-2 text-base">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-8 italic my-4 text-gray-500 [&_p]:!text-gray-500">
      {children}
    </blockquote>
  ),
  h1: ({ children, id }) => (
    <div className="group relative">
      <h1
        id={id}
        className="scroll-mt-4 text-4xl font-bold text-gray-900 mt-8 mb-4 pt-4 pb-2 pr-8 after:content-[''] after:block after:w-full after:h-[1px]! after:bg-gray-300 after:mt-4"
      >
        {children}
        <HeadingAnchor id={id} />
      </h1>
    </div>
  ),
  h2: ({ children, id }) => (
    <div className="group relative">
      <h2
        id={id}
        className="scroll-mt-4 text-3xl font-semibold text-gray-900 mt-6 mb-4 pt-4 pb-2 pr-8 after:content-[''] after:block after:w-full after:h-[1px]! after:bg-gray-300 after:mt-4"
      >
        {children}
        <HeadingAnchor id={id} />
      </h2>
    </div>
  ),
  h3: ({ children, id }) => (
    <div className="group relative">
      <h3 id={id} className="scroll-mt-4 text-2xl font-semibold text-gray-900 mt-5 mb-3">
        {children}
        <HeadingAnchor id={id} size="h-4 w-4" inline />
      </h3>
    </div>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="scroll-mt-4 text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h4>
  ),
  h5: ({ children, id }) => (
    <h5 id={id} className="scroll-mt-4 text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h5>
  ),
  h6: ({ children, id }) => (
    <h6 id={id} className="scroll-mt-4 text-base font-semibold text-gray-500 mt-4 mb-2 uppercase tracking-wide">
      {children}
    </h6>
  ),
  ul: ({ children }) => <ul className="list-disc list-outside pl-6 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside pl-6 mb-4 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-lg text-black leading-relaxed">{children}</li>,
  hr: () => <hr className="my-8 border-gray-200" />,
  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through text-gray-400">{children}</del>,
  p: ({ children }) => <p className="leading-relaxed mb-6 text-lg text-black">{children}</p>,
};
