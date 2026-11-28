import Head from 'next/head';
import ProfileSidebar from '@/components/ProfileSidebar';
import { Motes, PageTitle, PublicationCard, SectionHeading, SidebarLayout } from '@/components/Blocks';
import { ongoingWork, profile, publications } from '@/data/profile';

export default function Research() {
  const published = publications.filter((p) => !p.status);
  const pending = publications.filter((p) => p.status);
  const years = [...new Set(published.map((p) => p.year))].sort((a, b) => b - a);

  const sections = [
    { id: 'interests', label: 'Research interests' },
    { id: 'pubs', label: 'Publications', show: publications.length > 0 },
    { id: 'ongoing', label: 'Ongoing work', show: ongoingWork.length > 0 },
  ].filter((s) => s.show !== false);

  return (
    <>
      <Head>
        <title>Research · {profile.name}</title>
      </Head>
      <Motes />
      <SidebarLayout
        sidebar={
          <ProfileSidebar showLinks={false}>
            <nav aria-label="On this page" className="flex flex-col border-l-2 border-line pl-3 text-sm">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="flex min-h-9 items-center text-muted hover:text-ink">
                  {s.label}
                </a>
              ))}
            </nav>
          </ProfileSidebar>
        }
      >
        <section id="interests" aria-labelledby="r-h" className="flex flex-col gap-3">
          <PageTitle>
            <span id="r-h">Research</span>
          </PageTitle>
          <p className="m-0 max-w-[720px] text-[17px] leading-relaxed text-muted">{profile.researchStatement}</p>
          <ul aria-label="Research interests" className="flex flex-wrap gap-2 pt-1">
            {profile.interests.map((interest) => (
              <li key={interest} className="rounded-full bg-chip px-3 py-1.5 text-[13px] font-semibold">
                {interest}
              </li>
            ))}
          </ul>
        </section>

        {publications.length > 0 && (
          <section id="pubs" aria-labelledby="p-h">
            <SectionHeading id="p-h">Publications</SectionHeading>
            {years.map((year) => (
              <div key={year}>
                <h3 className="mb-2.5 mt-5 text-[13px] font-bold uppercase tracking-[0.16em] text-accent-ink">{year}</h3>
                <div className="flex flex-col gap-3">
                  {published.filter((p) => p.year === year).map((pub) => (
                    <PublicationCard key={pub.title} pub={pub} />
                  ))}
                </div>
              </div>
            ))}
            {pending.length > 0 && (
              <div>
                <h3 className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-[0.16em] text-accent-ink">Under review / in preparation</h3>
                <div className="flex flex-col gap-3">
                  {pending.map((pub) => (
                    <PublicationCard key={pub.title} pub={pub} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {ongoingWork.length > 0 && (
          <section id="ongoing" aria-labelledby="o-h">
            <SectionHeading id="o-h">Ongoing work</SectionHeading>
            <div className="grid gap-3.5 pt-2 sm:grid-cols-2">
              {ongoingWork.map((w) => (
                <div key={w.name} className="flex flex-col gap-1.5 rounded-[18px] border border-line bg-surface p-4">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">{w.org}</p>
                  <h3 className="m-0 text-base font-bold">{w.name}</h3>
                  <p className="m-0 text-sm leading-relaxed text-muted">{w.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </SidebarLayout>
    </>
  );
}
