import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { ExternalLink, RotateCcw, Save } from 'lucide-react';
import { useRequireAuth } from '@/context/AuthContext';
import AdminNav from '@/components/admin/AdminNav';
import { ListEditor, ObjectEditor } from '@/components/admin/FieldEditor';
import { errorClass, primaryButton, secondaryButton } from '@/components/admin/ui';
import { SECTIONS, SectionKey, SiteContent } from '@/lib/site/schema';

type Draft = Record<string, unknown>;

export default function SiteContentAdmin() {
  const { status, handleUnauthorized } = useRequireAuth();
  const [saved, setSaved] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [current, setCurrent] = useState<SectionKey>('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    axios
      .get<SiteContent>('/api/site')
      .then((res) => {
        setSaved(res.data);
        setDraft(JSON.parse(JSON.stringify(res.data)));
      })
      .catch(() => setLoadError('Could not load the site content. Please refresh.'));
  }, [status]);

  const dirty = useMemo(() => {
    if (!saved || !draft) return new Set<string>();
    return new Set(SECTIONS.filter((s) => JSON.stringify(draft[s.key]) !== JSON.stringify(saved[s.key])).map((s) => s.key));
  }, [saved, draft]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (dirty.size === 0) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const section = SECTIONS.find((s) => s.key === current)!;

  const save = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await axios.put('/api/site', { section: current, data: draft[current] });
      setSaved((s) => (s ? { ...s, [current]: res.data.data } : s));
      setDraft((d) => (d ? { ...d, [current]: res.data.data } : d));
      setMessage({
        kind: 'ok',
        text: res.data.refreshed ? 'Saved. The site is updated.' : 'Saved. The site will show it within 5 minutes.',
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) return handleUnauthorized();
      const text = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setMessage({ kind: 'error', text: text || 'Could not save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [current, draft, handleUnauthorized]);

  const discard = () => {
    if (!saved || !draft) return;
    setDraft({ ...draft, [current]: JSON.parse(JSON.stringify(saved[current])) });
    setMessage(null);
  };

  const switchTo = (key: SectionKey) => {
    setCurrent(key);
    setMessage(null);
  };

  if (status !== 'authenticated') return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-8">
      <Head>
        <title>Site content · Admin</title>
      </Head>
      <h1 className="soft mb-4 font-display text-[34px] font-semibold">Admin</h1>
      <AdminNav />

      {loadError && <p className={errorClass}>{loadError}</p>}
      {!draft && !loadError && <p className="text-muted">Loading…</p>}

      {draft && (
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Sections" className="flex flex-row flex-wrap gap-1 lg:sticky lg:top-6 lg:flex-col lg:self-start">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => switchTo(s.key)}
                aria-current={current === s.key ? 'true' : undefined}
                className={`flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 text-left text-sm ${
                  current === s.key ? 'bg-nav-active font-bold text-ink' : 'text-muted hover:bg-chip hover:text-ink'
                }`}
              >
                {s.label}
                {dirty.has(s.key) && <span className="h-2 w-2 rounded-full bg-accent" aria-label="unsaved changes" />}
              </button>
            ))}
          </nav>

          <section aria-labelledby="section-title" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="section-title" className="font-display text-2xl font-semibold">
                  {section.label}
                </h2>
                <p className="mt-1 text-sm text-muted">{section.description}</p>
              </div>
              <Link href={section.page} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline">
                View on site <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {section.kind === 'object' ? (
              <ObjectEditor
                fields={section.fields}
                value={(draft[current] as Draft) || {}}
                idPrefix={current}
                onChange={(v) => setDraft({ ...draft, [current]: v })}
              />
            ) : (
              <ListEditor
                fields={section.fields}
                items={(draft[current] as Draft[]) || []}
                itemLabel={section.itemLabel || 'entry'}
                maxItems={section.maxItems}
                idPrefix={current}
                onChange={(v) => setDraft({ ...draft, [current]: v })}
              />
            )}

            <div className="sticky bottom-0 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg py-4">
              <button type="button" className={primaryButton} disabled={saving || !dirty.has(current)} onClick={save}>
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : `Save ${section.label}`}
              </button>
              <button type="button" className={secondaryButton} disabled={saving || !dirty.has(current)} onClick={discard}>
                <RotateCcw className="h-4 w-4" /> Discard changes
              </button>
              {message && (
                <p role="status" className={`text-sm font-semibold ${message.kind === 'ok' ? 'text-cat-notes' : 'text-danger'}`}>
                  {message.text}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
