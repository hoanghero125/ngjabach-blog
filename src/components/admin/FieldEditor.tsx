import { useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Plus, Trash2 } from 'lucide-react';
import type { Field } from '@/lib/site/schema';
import { emptyItem } from '@/lib/site/schema';
import MediaPicker from './MediaPicker';
import { helpClass, iconButton, inputClass, labelClass, secondaryButton } from './ui';

type Item = Record<string, unknown>;

/** One form control, chosen from the field's type in src/lib/site/schema.ts. */
export function FieldInput({ field, value, onChange, idPrefix }: { field: Field; value: unknown; onChange: (v: unknown) => void; idPrefix: string }) {
  const id = `${idPrefix}-${field.key}`;
  const [picking, setPicking] = useState(false);
  const label = (
    <label htmlFor={id} className={labelClass}>
      {field.label}
      {field.required && <span className="text-danger"> *</span>}
    </label>
  );
  const help = field.help && <p className={helpClass}>{field.help}</p>;
  const str = typeof value === 'string' ? value : value == null ? '' : String(value);

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          {label}
          <textarea id={id} rows={4} maxLength={field.max} value={str} onChange={(e) => onChange(e.target.value)} className={inputClass} />
          {help}
        </div>
      );
    case 'lines': {
      const lines = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          {label}
          <textarea
            id={id}
            rows={Math.min(10, Math.max(3, lines.length + 1))}
            value={lines.join('\n')}
            // Keep empty lines while typing; the server drops them on save.
            onChange={(e) => onChange(e.target.value.split('\n'))}
            className={inputClass}
          />
          {help}
        </div>
      );
    }
    case 'checkbox':
      return (
        <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          {field.label}
        </label>
      );
    case 'select':
      return (
        <div>
          {label}
          <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {!field.required && <option value="">—</option>}
            {field.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {help}
        </div>
      );
    case 'number':
      return (
        <div>
          {label}
          <input
            id={id}
            type="number"
            min={field.min}
            max={field.max}
            value={str}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClass}
          />
          {help}
        </div>
      );
    case 'media':
      return (
        <div>
          {label}
          <div className="flex flex-wrap items-center gap-3">
            {str && field.accept === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={str} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" />
            )}
            {str && field.accept === 'pdf' && (
              <a href={str} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline">
                <FileText className="h-4 w-4" /> Open current file
              </a>
            )}
            <input id={id} type="text" value={str} onChange={(e) => onChange(e.target.value)} placeholder="Upload or choose a file" className={`${inputClass} min-w-[200px] flex-1`} />
            <button type="button" className={secondaryButton} onClick={() => setPicking(true)}>
              Choose…
            </button>
            {str && !field.required && (
              <button type="button" className={secondaryButton} onClick={() => onChange('')}>
                Remove
              </button>
            )}
          </div>
          {help}
          {picking && (
            <MediaPicker
              accept={field.accept || 'any'}
              onClose={() => setPicking(false)}
              onSelect={(item) => {
                onChange(item.url);
                setPicking(false);
              }}
            />
          )}
        </div>
      );
    case 'list':
      return (
        <div>
          <p className={labelClass}>{field.label}</p>
          <ListEditor fields={field.fields || []} items={Array.isArray(value) ? (value as Item[]) : []} onChange={onChange} itemLabel={field.itemLabel || 'entry'} maxItems={field.maxItems} idPrefix={id} compact />
          {help}
        </div>
      );
    default:
      return (
        <div>
          {label}
          <input id={id} type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'} maxLength={field.max} value={str} onChange={(e) => onChange(e.target.value)} className={inputClass} />
          {help}
        </div>
      );
  }
}

/** The fields of one object, laid out two per row where they are short. */
export function ObjectEditor({ fields, value, onChange, idPrefix }: { fields: Field[]; value: Item; onChange: (v: Item) => void; idPrefix: string }) {
  const wide = (f: Field) => ['textarea', 'lines', 'list', 'media'].includes(f.type);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={wide(f) ? 'sm:col-span-2' : ''}>
          <FieldInput field={f} value={value[f.key]} idPrefix={idPrefix} onChange={(v) => onChange({ ...value, [f.key]: v })} />
        </div>
      ))}
    </div>
  );
}

/** A list of entries: add, remove and reorder. */
export function ListEditor({
  fields, items, onChange, itemLabel, maxItems, idPrefix, compact = false,
}: {
  fields: Field[];
  items: Item[];
  onChange: (v: Item[]) => void;
  itemLabel: string;
  maxItems?: number;
  idPrefix: string;
  compact?: boolean;
}) {
  const move = (from: number, to: number) => {
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };
  const summary = (item: Item) => {
    const first = fields.find((f) => f.type === 'text' || f.type === 'textarea');
    const v = first ? item[first.key] : '';
    return typeof v === 'string' && v.trim() ? v : `New ${itemLabel}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className={`rounded-xl border border-line ${compact ? 'bg-surface-2 p-3' : 'bg-surface p-4'}`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-bold">
              <span className="text-faint">{i + 1}.</span> {summary(item)}
            </p>
            <div className="flex shrink-0 items-center">
              <button type="button" className={iconButton} aria-label={`Move ${itemLabel} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" className={iconButton} aria-label={`Move ${itemLabel} down`} disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`${iconButton} hover:text-danger`}
                aria-label={`Remove ${itemLabel}`}
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ObjectEditor fields={fields} value={item} idPrefix={`${idPrefix}-${i}`} onChange={(v) => onChange(items.map((it, j) => (j === i ? v : it)))} />
        </div>
      ))}
      <button
        type="button"
        className={`${secondaryButton} self-start`}
        disabled={maxItems !== undefined && items.length >= maxItems}
        onClick={() => onChange([...items, emptyItem(fields)])}
      >
        <Plus className="h-4 w-4" /> Add {itemLabel}
      </button>
    </div>
  );
}
