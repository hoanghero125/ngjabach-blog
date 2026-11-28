import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Motes, PageTitle } from '@/components/Blocks';
import { profile, projects, type Project } from '@/data/profile';

const FILTERS: ('All' | Project['category'])[] = ['All', 'Research', 'Tools & apps'];

export default function Projects() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <Head>
        <title>Projects · {profile.name}</title>
      </Head>
      <Motes />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 pb-16 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-[640px] flex-col gap-2">
            <PageTitle>Projects</PageTitle>
            <p className="m-0 text-base leading-relaxed text-muted">Code, tools and demos from research and side work.</p>
          </div>
          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-10 rounded-full px-3.5 text-sm transition-colors ${
                  filter === f ? 'bg-accent font-bold text-on-accent' : 'border border-line bg-surface font-semibold text-ink hover:bg-chip'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project) => (
            <article key={project.name} className="flex flex-col gap-2 rounded-[22px] border border-line bg-surface p-5">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">{project.category}</p>
              <h2 className="m-0 text-lg font-bold">{project.name}</h2>
              <p className="m-0 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
              <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <li key={t} className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-semibold">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 pt-1 text-sm font-semibold">
                {project.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link key={link.label} href={link.href} className="text-accent-ink hover:underline">
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-accent-ink hover:underline">
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
