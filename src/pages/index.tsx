import Head from 'next/head';
import Link from 'next/link';
import ProfileSidebar from '@/components/ProfileSidebar';
import { Motes, PageTitle, PostRow, PublicationCard, SectionHeading, SidebarLayout, TextLink } from '@/components/Blocks';
import type { GetStaticProps } from 'next';
import { useSite } from '@/context/SiteContext';
import { loadSiteForPage } from '@/lib/site/load';
import { usePosts } from '@/lib/usePosts';

export default function Home() {
  const { profile, news, publications } = useSite();
  const { posts, status } = usePosts();
  const selected = publications.filter((p) => p.selected);

  return (
    <>
      <Head>
        <title>{profile.name}</title>
      </Head>
      <Motes />
      <SidebarLayout sidebar={<ProfileSidebar />}>
        <section aria-labelledby="about-h" className="flex flex-col gap-3">
          <PageTitle>
            <span id="about-h">{profile.name}</span>
          </PageTitle>
          {profile.bio.map((paragraph) => (
            <p key={paragraph} className="m-0 max-w-[720px] text-[17px] leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
          {profile.interests.length > 0 && (
            <ul aria-label="Research interests" className="flex flex-wrap gap-2 pt-1">
              {profile.interests.map((interest) => (
                <li key={interest} className="rounded-full bg-chip px-3 py-1.5 text-[13px] font-semibold">
                  {interest}
                </li>
              ))}
            </ul>
          )}
        </section>

        {news.length > 0 && (
          <section aria-labelledby="news-h">
            <SectionHeading id="news-h">News</SectionHeading>
            <ul className="flex flex-col">
              {news.map((item) => (
                <li key={item.date + item.text} className="grid grid-cols-[84px_minmax(0,1fr)] gap-4 py-2 text-[15px] leading-relaxed">
                  <span className="font-semibold tabular-nums text-accent-ink">{item.date}</span>
                  {item.href ? (
                    <Link href={item.href} className="text-ink hover:text-accent-ink hover:underline">
                      {item.text}
                    </Link>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {selected.length > 0 && (
          <section aria-labelledby="pub-h">
            <SectionHeading id="pub-h" action={<TextLink href="/research">All research</TextLink>}>
              Selected publications
            </SectionHeading>
            <div className="flex flex-col gap-3 pt-2">
              {selected.map((pub) => (
                <PublicationCard key={pub.title} pub={pub} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="fresh-h">
          <SectionHeading id="fresh-h" action={<TextLink href="/blog">All posts</TextLink>}>
            Fresh from the shelves
          </SectionHeading>
          {status === 'loading' ? (
            <ul aria-busy="true" aria-label="Loading posts" className="flex flex-col gap-3 pt-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-12 animate-pulse rounded-xl bg-surface" />
              ))}
            </ul>
          ) : status === 'error' ? (
            <p className="text-muted">Posts could not be loaded right now.</p>
          ) : posts.length === 0 ? (
            <p className="text-muted">No posts yet.</p>
          ) : (
            <ul>
              {posts.slice(0, 3).map((post) => (
                <PostRow key={post._id} post={post} />
              ))}
            </ul>
          )}
        </section>
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
