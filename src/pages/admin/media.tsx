import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { Check, Copy, FileText, Trash2, Upload } from 'lucide-react';
import { useRequireAuth } from '@/context/AuthContext';
import AdminNav from '@/components/admin/AdminNav';
import { errorClass, iconButton, primaryButton } from '@/components/admin/ui';
import { formatSize, isImage, MediaItem, uploadFile } from '@/lib/media-client';

export default function MediaAdmin() {
  const { status, handleUnauthorized } = useRequireAuth();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    axios
      .get<MediaItem[]>('/api/media')
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) return handleUnauthorized();
        setError('Could not load your files.');
      });
  }, [handleUnauthorized]);

  useEffect(() => {
    if (status === 'authenticated') load();
  }, [status, load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      try {
        await uploadFile(file);
      } catch (err) {
        problems.push((err as Error).message);
      }
    }
    setUploading(false);
    if (problems.length) setError(problems.join(' '));
    load();
  };

  const copyLink = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(isImage(item.contentType) ? `![${item.filename}](${item.url})` : item.url);
      setCopied(item.id);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setError('Copying is blocked by the browser.');
    }
  };

  const remove = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.filename}"? Pages that still use it will show a broken image or link.`)) return;
    try {
      await axios.delete(`/api/media/${item.id}`);
      setItems((list) => list?.filter((m) => m.id !== item.id) ?? null);
    } catch {
      setError('Could not delete the file.');
    }
  };

  if (status !== 'authenticated') return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-8">
      <Head>
        <title>Media · Admin</title>
      </Head>
      <h1 className="soft mb-4 font-display text-[34px] font-semibold">Admin</h1>
      <AdminNav />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Images (JPEG, PNG, WebP, GIF) and PDFs, up to 4 MB each. Large photos are shrunk automatically. “Copy” gives you markdown to paste into a post.
        </p>
        <button type="button" className={primaryButton} disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload files'}
        </button>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className={`${errorClass} mb-4`}>{error}</p>}
      {items === null && !error && <p className="text-muted">Loading…</p>}
      {items?.length === 0 && <p className="text-muted">No files yet.</p>}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items?.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-2.5">
            <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.filename}`}>
              {isImage(item.contentType) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              ) : (
                <span className="flex aspect-square w-full items-center justify-center rounded-lg bg-surface-2">
                  <FileText className="h-12 w-12 text-faint" />
                </span>
              )}
            </a>
            <p className="truncate text-xs font-semibold" title={item.filename}>
              {item.filename}
            </p>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs text-faint">{formatSize(item.size)}</span>
              <span className="flex">
                <button type="button" className={iconButton} aria-label={`Copy link to ${item.filename}`} onClick={() => copyLink(item)}>
                  {copied === item.id ? <Check className="h-4 w-4 text-cat-notes" /> : <Copy className="h-4 w-4" />}
                </button>
                <button type="button" className={`${iconButton} hover:text-danger`} aria-label={`Delete ${item.filename}`} onClick={() => remove(item)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
