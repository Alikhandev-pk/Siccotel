"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import type { Field } from "@/lib/cms/schemas";
import type { CmsImage } from "@/lib/cms/types";
import { MediaPicker, type MediaAsset } from "./MediaPicker";

type Value = Record<string, unknown>;

const inputCls = "w-full rounded border border-line-strong bg-white px-3 py-2 text-[0.9375rem] focus:border-ink focus:outline-none";

function emptyFor(fields: Field[]): Value {
  const out: Value = {};
  for (const f of fields) {
    if (f.type === "boolean") out[f.key] = false;
    else if (f.type === "number") out[f.key] = 0;
    else if (f.type === "strings" || f.type === "list" || f.type === "images") out[f.key] = [];
    else if (f.type === "group") out[f.key] = emptyFor(f.fields);
    else if (f.type === "image") out[f.key] = null;
    else out[f.key] = "";
  }
  return out;
}

function ImageField({ value, onChange, media, setMedia, optional }: { value: CmsImage | null; onChange: (v: CmsImage | null) => void; media: MediaAsset[]; setMedia: (fn: (m: MediaAsset[]) => MediaAsset[]) => void; optional?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-3 rounded border border-line bg-stone/60 p-3">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-white">
        {value?.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview of any stored or bundled image
          <img src={value.src} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <ImageIcon className="size-6 text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className="rounded border border-ink/20 bg-white px-3 py-1.5 text-sm font-semibold hover:border-ink">
            {value ? "Replace" : "Choose image"}
          </button>
          {value && optional && (
            <button type="button" onClick={() => onChange(null)} className="rounded px-3 py-1.5 text-sm text-accent hover:bg-white">
              Remove
            </button>
          )}
          {value && <span className="self-center text-xs text-muted">{value.width} × {value.height}</span>}
        </div>
        {value && (
          <label className="block text-sm">
            <span className="text-muted">Alt text (describe the image for screen readers)</span>
            <input className={`${inputCls} mt-1`} value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
          </label>
        )}
      </div>
      {open && (
        <MediaPicker
          media={media}
          onUploaded={(a) => setMedia((m) => [a, ...m])}
          onClose={() => setOpen(false)}
          onPick={(img) => {
            onChange({ ...img, alt: img.alt || value?.alt || "" });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function move<T>(arr: T[], i: number, d: number) {
  const next = [...arr];
  const j = i + d;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function FieldInput({ field, value, onChange, media, setMedia }: { field: Field; value: unknown; onChange: (v: unknown) => void; media: MediaAsset[]; setMedia: (fn: (m: MediaAsset[]) => MediaAsset[]) => void }) {
  const label = (
    <span className="mb-1 block text-sm font-semibold text-ink">
      {field.label}
      {field.help && <span className="mt-0.5 block text-xs font-normal text-muted">{field.help}</span>}
    </span>
  );
  switch (field.type) {
    case "text":
    case "url":
      return <label className="block">{label}<input className={inputCls} type={field.type === "url" ? "text" : "text"} inputMode={field.type === "url" ? "url" : undefined} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></label>;
    case "color":
      return (
        <label className="block">
          {label}
          <span className="flex gap-2">
            <input type="color" value={String(value || "#ffffff")} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded border border-line" />
            <input className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          </span>
        </label>
      );
    case "textarea":
      return <label className="block">{label}<textarea className={`${inputCls} min-h-28`} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></label>;
    case "number":
      return <label className="block">{label}<input className={inputCls} type="number" step={field.step ?? 1} value={Number(value ?? 0)} onChange={(e) => onChange(e.target.valueAsNumber || 0)} /></label>;
    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="size-4" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {field.label}
        </label>
      );
    case "image":
      return <div>{label}<ImageField value={(value as CmsImage) ?? null} onChange={onChange} media={media} setMedia={setMedia} optional={field.optional} /></div>;
    case "date":
      return <label className="block">{label}<input className={inputCls} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></label>;
    case "tags":
      return <div>{label}<TagsField value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} /></div>;
    case "focal":
      return null; // rendered by Fields, which can see the image it belongs to
    case "images": {
      const list = (Array.isArray(value) ? value : []) as CmsImage[];
      return (
        <div>
          {label}
          <div className="space-y-2">
            {list.map((img, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1"><ImageField value={img} onChange={(v) => onChange(v ? list.map((x, j) => (j === i ? v : x)) : list.filter((_, j) => j !== i))} media={media} setMedia={setMedia} optional /></div>
                <ItemControls onUp={() => onChange(move(list, i, -1))} onDown={() => onChange(move(list, i, 1))} onRemove={() => onChange(list.filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddImage media={media} setMedia={setMedia} onAdd={(img) => onChange([...list, img])} />
          </div>
        </div>
      );
    }
    case "strings": {
      const list = (Array.isArray(value) ? value : []) as string[];
      return (
        <div>
          {label}
          <div className="space-y-2">
            {list.map((s, i) => (
              <div key={i} className="flex gap-2">
                <textarea className={`${inputCls} min-h-11 flex-1`} rows={s.length > 90 ? 3 : 1} value={s} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
                {!field.fixed && <ItemControls onUp={() => onChange(move(list, i, -1))} onDown={() => onChange(move(list, i, 1))} onRemove={() => onChange(list.filter((_, j) => j !== i))} />}
              </div>
            ))}
            {!field.fixed && (
              <button type="button" onClick={() => onChange([...list, ""])} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                <Plus className="size-4" /> Add {field.item?.toLowerCase() ?? "item"}
              </button>
            )}
          </div>
        </div>
      );
    }
    case "list": {
      const list = (Array.isArray(value) ? value : []) as Value[];
      return (
        <div>
          {label}
          <div className="space-y-3">
            {list.map((item, i) => (
              <details key={i} className="rounded border border-line bg-white" open={list.length <= 4}>
                <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-semibold">
                  <span className="flex-1 truncate">{field.item} {i + 1}{field.titleKey && item[field.titleKey] ? `: ${String(item[field.titleKey])}` : ""}</span>
                  {!field.fixed && <ItemControls onUp={() => onChange(move(list, i, -1))} onDown={() => onChange(move(list, i, 1))} onRemove={() => onChange(list.filter((_, j) => j !== i))} />}
                </summary>
                <div className="space-y-4 border-t border-line p-3">
                  <Fields fields={field.fields} value={item} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} media={media} setMedia={setMedia} />
                </div>
              </details>
            ))}
            {!field.fixed && (
              <button type="button" onClick={() => onChange([...list, emptyFor(field.fields)])} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                <Plus className="size-4" /> Add {field.item.toLowerCase()}
              </button>
            )}
          </div>
        </div>
      );
    }
    case "group":
      return (
        <fieldset className="rounded-md border border-line bg-white p-4">
          <legend className="px-1 text-base font-semibold">{field.label}</legend>
          {field.help && <p className="-mt-1 mb-3 text-xs text-muted">{field.help}</p>}
          <div className="space-y-4">
            <Fields fields={field.fields} value={(value as Value) ?? {}} onChange={onChange} media={media} setMedia={setMedia} />
          </div>
        </fieldset>
      );
  }
}

function AddImage({ media, setMedia, onAdd }: { media: MediaAsset[]; setMedia: (fn: (m: MediaAsset[]) => MediaAsset[]) => void; onAdd: (img: CmsImage) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
        <Plus className="size-4" /> Add image
      </button>
      {open && <MediaPicker media={media} onUploaded={(a) => setMedia((m) => [a, ...m])} onClose={() => setOpen(false)} onPick={(img) => { onAdd(img); setOpen(false); }} />}
    </>
  );
}

function ItemControls({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  const cls = "inline-flex size-8 items-center justify-center rounded hover:bg-stone";
  return (
    <span className="flex shrink-0 items-start gap-0.5" onClick={(e) => e.preventDefault()}>
      <button type="button" aria-label="Move up" className={cls} onClick={onUp}><ArrowUp className="size-4" /></button>
      <button type="button" aria-label="Move down" className={cls} onClick={onDown}><ArrowDown className="size-4" /></button>
      <button type="button" aria-label="Remove" className={`${cls} text-accent`} onClick={() => confirm("Remove this item?") && onRemove()}><Trash2 className="size-4" /></button>
    </span>
  );
}

export function Fields({ fields, value, onChange, media, setMedia }: { fields: Field[]; value: Value; onChange: (v: Value) => void; media: MediaAsset[]; setMedia: (fn: (m: MediaAsset[]) => MediaAsset[]) => void }) {
  return (
    <>
      {fields.map((f) =>
        f.type === "focal" ? (
          <FocalField key={f.key} label={f.label} help={f.help} image={(value?.[f.imageKey] as CmsImage | null) ?? null} value={String(value?.[f.key] || "50% 50%")} onChange={(v) => onChange({ ...value, [f.key]: v })} />
        ) : (
          <FieldInput key={f.key} field={f} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} media={media} setMedia={setMedia} />
        ),
      )}
    </>
  );
}

function TagsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 40);
    if (tag && !value.includes(tag) && value.length < 20) onChange([...value, tag]);
    setDraft("");
  };
  return (
    <div className="rounded border border-line-strong bg-white p-2">
      <ul className="flex flex-wrap gap-1.5" aria-label="Keywords">
        {value.map((tag) => (
          <li key={tag} className="inline-flex items-center gap-1 rounded-full bg-stone px-2.5 py-1 text-sm">
            {tag}
            <button type="button" aria-label={`Remove keyword ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="inline-flex size-5 items-center justify-center rounded-full hover:bg-stone-2">
              ×
            </button>
          </li>
        ))}
        <li className="min-w-40 flex-1">
          <input
            aria-label="Add a keyword"
            value={draft}
            placeholder={value.length ? "Add another keyword" : "Add a keyword"}
            onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); add(draft); }
              if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
            }}
            onBlur={() => draft && add(draft)}
            className="w-full bg-transparent px-1 py-1 text-[0.9375rem] focus:outline-none"
          />
        </li>
      </ul>
    </div>
  );
}

const parsePosition = (v: string) => {
  const m = v.match(/^(\d{1,3}(?:\.\d+)?)% (\d{1,3}(?:\.\d+)?)%$/);
  return m ? { x: Math.min(100, Number(m[1])), y: Math.min(100, Number(m[2])) } : { x: 50, y: 50 };
};

/* eslint-disable @next/next/no-img-element -- previews of arbitrary stored images */
function FocalField({ label, help, image, value, onChange }: { label: string; help?: string; image: CmsImage | null; value: string; onChange: (v: string) => void }) {
  const { x, y } = parsePosition(value);
  const set = (nx: number, ny: number) => onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-ink">
        {label}
        {help && <span className="mt-0.5 block text-xs font-normal text-muted">{help}</span>}
      </span>
      {!image?.src ? (
        <p className="rounded border border-dashed border-line-strong p-3 text-sm text-muted">Choose a cover image to set its crop.</p>
      ) : (
        <div className="grid gap-4 rounded border border-line bg-stone/60 p-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div>
            <div
              role="presentation"
              className="relative cursor-crosshair overflow-hidden rounded border border-line"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                set(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
              }}
            >
              <img src={image.src} alt="" className="block w-full select-none" draggable={false} />
              <span aria-hidden className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow" style={{ left: `${x}%`, top: `${y}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <label className="block">Across: {Math.round(x)}%<input type="range" min={0} max={100} value={x} onChange={(e) => set(Number(e.target.value), y)} className="w-full" aria-label="Crop position across" /></label>
              <label className="block">Down: {Math.round(y)}%<input type="range" min={0} max={100} value={y} onChange={(e) => set(x, Number(e.target.value))} className="w-full" aria-label="Crop position down" /></label>
            </div>
            <button type="button" onClick={() => onChange("50% 50%")} className="mt-2 text-sm font-semibold text-accent">Reset to centre</button>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Card preview (16:10)</p>
            <div className="aspect-[16/10] overflow-hidden rounded border border-line" data-focal-preview="card">
              <img src={image.src} alt="" className="size-full object-cover" style={{ objectPosition: value }} />
            </div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Phone thumbnail</p>
            <div className="aspect-[16/10] w-[7.5rem] overflow-hidden rounded border border-line" data-focal-preview="thumb">
              <img src={image.src} alt="" className="size-full object-cover" style={{ objectPosition: value }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */
