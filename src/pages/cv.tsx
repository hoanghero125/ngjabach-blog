import Head from 'next/head';
import ProfileSidebar from '@/components/ProfileSidebar';
import { Motes, PageTitle, SectionHeading, SidebarLayout } from '@/components/Blocks';
import type { GetStaticProps } from 'next';
import { useSite } from '@/context/SiteContext';
import { loadSiteForPage } from '@/lib/site/load';
import type { RowEntry, TimelineEntry } from '@/lib/site/schema';

function Entries({ items }: { items: TimelineEntry[] }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.title + item.org} className="grid gap-x-6 gap-y-1 border-b border-dashed border-line py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="m-0 font-bold">{item.title}</p>
            <p className="m-0 mt-0.5 text-sm text-muted">{item.org}</p>
            {item.details && item.details.length > 0 && (
              <ul className="mb-0 mt-2 list-disc pl-[18px] text-sm leading-relaxed text-muted">
                {item.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="sm:text-right">
            <p className="m-0 text-sm font-semibold text-accent-ink">{item.period}</p>
            {item.location && <p className="m-0 mt-0.5 text-[13px] text-faint">{item.location}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Rows({ items }: { items: RowEntry[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.title + item.year} className="grid grid-cols-[minmax(0,1fr)_auto] gap-6 border-b border-dashed border-line py-3 text-[15px] last:border-b-0">
          <span>
            <strong>{item.title}</strong>
            {item.detail && <>, {item.detail}</>}
          </span>
          <span className="font-semibold text-accent-ink">{item.year}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CV() {
  const { profile, publications, education, researchExperience, workExperience, awards, service, skills } = useSite();
  const sections = [
    { id: 'education', label: 'Education', show: education.length > 0 },
    { id: 'research', label: 'Research experience', show: researchExperience.length > 0 },
    { id: 'work', label: 'Work experience', show: workExperience.length > 0 },
    { id: 'publications', label: 'Publications', show: publications.length > 0 },
    { id: 'awards', label: 'Honors & awards', show: awards.length > 0 },
    { id: 'service', label: 'Teaching & service', show: service.length > 0 },
    { id: 'skills', label: 'Skills', show: skills.length > 0 },
  ].filter((s) => s.show);

  return (
    <>
      <Head>
        <title>CV · {profile.name}</title>
      </Head>
      <Motes />
      <SidebarLayout
        sidebar={
          <ProfileSidebar showLinks={false} onCvPage>
            <p className="m-0 text-sm text-muted">
              <a href={`mailto:${profile.email}`} className="text-ink hover:text-accent-ink">
                {profile.email}
              </a>
            </p>
            <nav aria-label="CV sections" className="hidden flex-col border-l-2 border-line pl-3 text-sm lg:flex">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="flex min-h-[34px] items-center text-muted hover:text-ink">
                  {s.label}
                </a>
              ))}
            </nav>
          </ProfileSidebar>
        }
      >
        <PageTitle>Curriculum Vitae</PageTitle>

        {education.length > 0 && (
          <section id="education" aria-labelledby="ed-h" className="-mt-4">
            <SectionHeading id="ed-h">Education</SectionHeading>
            <Entries items={education} />
          </section>
        )}

        {researchExperience.length > 0 && (
          <section id="research" aria-labelledby="re-h">
            <SectionHeading id="re-h">Research experience</SectionHeading>
            <Entries items={researchExperience} />
          </section>
        )}

        {workExperience.length > 0 && (
          <section id="work" aria-labelledby="wo-h">
            <SectionHeading id="wo-h">Work experience</SectionHeading>
            <Entries items={workExperience} />
          </section>
        )}

        {publications.length > 0 && (
          <section id="publications" aria-labelledby="pu-h">
            <SectionHeading id="pu-h">Publications</SectionHeading>
            <ol className="mt-3 list-decimal pl-[22px] text-sm leading-relaxed text-muted">
              {publications.map((pub) => (
                <li key={pub.title} className="mb-2">
                  {pub.authors.map((author, i) => (
                    <span key={author}>
                      {author === profile.authorName ? <strong className="text-ink">{author}</strong> : author}
                      {i < pub.authors.length - 1 ? ', ' : '. '}
                    </span>
                  ))}
                  <span className="text-ink">{pub.title}.</span>{' '}
                  {(pub.venue || pub.status) && <em className="text-accent-ink">{[pub.venue, pub.status].filter(Boolean).join(', ')}, </em>}
                  {pub.year}.
                </li>
              ))}
            </ol>
          </section>
        )}

        {awards.length > 0 && (
          <section id="awards" aria-labelledby="aw-h">
            <SectionHeading id="aw-h">Honors &amp; awards</SectionHeading>
            <Rows items={awards} />
          </section>
        )}

        {service.length > 0 && (
          <section id="service" aria-labelledby="se-h">
            <SectionHeading id="se-h">Teaching &amp; service</SectionHeading>
            <Rows items={service} />
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" aria-labelledby="sk-h">
            <SectionHeading id="sk-h">Skills</SectionHeading>
            <div className="grid grid-cols-[minmax(0,1fr)] items-baseline gap-x-4 gap-y-2.5 pt-2 text-[15px] sm:grid-cols-[150px_minmax(0,1fr)]">
              {skills.map((group) => (
                <div key={group.group} className="contents">
                  <span className="font-semibold text-faint">{group.group}</span>
                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="rounded-full bg-chip px-2.5 py-0.5 text-[13px] font-semibold">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </SidebarLayout>
    </>
  );
}

// Rendered on the server from Admin → Site content; refreshed right after
// every admin save, and at least every 5 minutes.
export const getStaticProps: GetStaticProps = async () => ({
  props: { site: await loadSiteForPage() },
  revalidate: 300,
});
