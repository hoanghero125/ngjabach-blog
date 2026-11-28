import Head from 'next/head';
import Link from 'next/link';
import { Motes } from '@/components/Blocks';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page not found</title>
      </Head>
      <Motes />
      <div className="relative flex flex-grow items-center justify-center px-6 py-20">
        <div className="flex max-w-xl flex-col items-center gap-4 text-center">
          <p className="text-5xl text-accent-ink" aria-hidden="true">(╥﹏╥)</p>
          <h1 className="soft font-display text-4xl font-semibold">This page doesn&apos;t exist</h1>
          <p className="text-lg italic text-muted">&ldquo;This site ain&apos;t existed bozo&rdquo; — Dek</p>
          <Link href="/" className="mt-2 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:opacity-90">
            Back home
          </Link>
        </div>
      </div>
    </>
  );
}
