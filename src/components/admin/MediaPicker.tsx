import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FileText, Upload, X } from 'lucide-react';
import { formatSize, isImage, MediaItem, uploadFile } from '@/lib/media-client';
import { errorClass, iconButton, primaryButton } from './ui';

interface Props {
  accept: 'image' | 'pdf' | 'any';
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}

const matches = (item: MediaItem, accept: Props['accept']) =>
  accept === 'any' || (accept === 'image' ? isImage(item.contentType) : item.contentType === 'application/pdf');

/** A dialog to pick an uploaded file or upload a new one. */
export default function MediaPicker({ accept, onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios
      .get<MediaItem[]>('/api/media')
      .then((res) => setItems(res.data.filter((m) => matches(m, accept))))
      .catch(() => setError('Could not load your files.'));
  }, [accept]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      onSelect(await uploadFile(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a file"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Choose {accept === 'pdf' ? 'a PDF' : accept === 'image' ? 'an image' : 'a file'}</h2>
          <div className="flex items-center gap-2">
            <button type="button" className={primaryButton} disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload new'}
            </button>
            <button type="button" className={iconButton} aria-label="Close" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept={accept === 'pdf' ? 'application/pdf' : accept === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'image/jpeg,image/png,image/webp,image/gif,application/pdf'}
            onChange={(e) => {
              handleUpload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        {error && <p className={errorClass}>{error}</p>}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {items === null && !error && <p className="col-span-full text-sm text-muted">Loading…</p>}
          {items?.length === 0 && <p className="col-span-full text-sm text-muted">Nothing uploaded yet. Use “Upload new”.</p>}
          {items?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-2 text-left hover:border-accent"
            >
              {isImage(item.contentType) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              ) : (
                <span className="flex aspect-square w-full items-center justify-center rounded-lg bg-surface-2">
                  <FileText className="h-10 w-10 text-faint" />
                </span>
              )}
              <span className="truncate text-xs font-semibold">{item.filename}</span>
              <span className="text-xs text-faint">{formatSize(item.size)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
