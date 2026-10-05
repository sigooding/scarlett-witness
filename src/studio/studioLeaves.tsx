/**
 * Studio shared leaves — the small primitives every editor panel is built from.
 *
 * Extracted from Studio.tsx first and deliberately: it is 844KB in one file,
 * which is 1.7x Babel's 500KB ceiling, so the code generator deoptimises it and
 * Fast Refresh invalidates instead of hot-swapping. Panels are being pulled out
 * one at a time, and they ALL lean on these four. Moving them here first is
 * what stops each extracted panel from importing back into Studio.tsx and
 * creating a cycle (which would undo the hot-reload win the split is for).
 *
 * Nothing here is redesigned — this is a relocation, byte for byte.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { assetBackground } from "../assetPath";

/** Shared input styling. Used ~260x across the editors. */
export const inputCls =
  "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

/** A labelled inspector field. The workhorse — used ~570x. */
export function Field({
  label,
  children,
  tip,
}: {
  label: string;
  children: React.ReactNode;
  /** Optional hover hint — shown as a gold “?” next to the label. */
  tip?: string;
}) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-paper/50" title={tip} data-tip={tip}>
      <span className="inline-flex items-center gap-1">
        {label}
        {tip ? (
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gold/50 font-pulp text-[8px] normal-case tracking-normal text-gold/80" aria-hidden>
            ?
          </span>
        ) : null}
      </span>
      <div className="mt-0.5 normal-case tracking-normal">{children}</div>
    </label>
  );
}

/** Local-state text area that only commits to the story on blur / Enter /
 *  unmount. Keeping text in component state means typing doesn't re-render
 *  the inspector or clone the whole story on every keystroke — which was
 *  causing the beat line to drop focus / reject typing mid-edit. */
export function CommitTextArea({
  value,
  onCommit,
  className,
  rows = 4,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const latest = useRef({ text, onCommit });
  latest.current = { text, onCommit };
  const committed = useRef(value);
  useEffect(() => {
    if (ref.current && document.activeElement === ref.current) return;
    committed.current = value;
    latest.current.text = value;
    setText(value);
  }, [value]);
  const commit = useCallback(() => {
    const { text: next, onCommit: apply } = latest.current;
    if (next === committed.current) return;
    committed.current = next; // Ctrl+Enter + blur must commit only once.
    apply(next);
  }, []);
  useEffect(() => () => commit(), [commit]);
  useEffect(() => {
    if (text === value) return;
    const timer = window.setTimeout(commit, 500);
    return () => window.clearTimeout(timer);
  }, [text, value, commit]);
  return (
    <textarea
      ref={ref}
      aria-label={ariaLabel}
      className={className}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(e) => { latest.current.text = e.target.value; setText(e.target.value); }}
      onBlur={commit}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") commit();
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          commit();
          ref.current?.blur();
        }
      }}
    />
  );
}

export const sectionStateKey = (id: string) => `scarlet-studio-section-${id}`;

/** A collapsible inspector section. The open/closed state is persisted per-id in
 * localStorage, so authors can minimise the panels they rarely touch (the
 * workflow/readiness summaries, camera, foreground, lighting…) and keep the
 * inspector from getting cramped — their choices survive reloads.
 *
 * Sections default to MINIMISED so the inspector starts compact (authors expand
 * only what they need). `headerRight` lets callers render a small action (e.g.
 * a delete button) in the header without nesting a button inside the toggle. */
export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = false,
  hint,
  titleClass = "text-cyan-neon",
  className = "border border-noir-600/70 bg-noir-900/40",
  headerRight,
  controlledOpen,
  onToggle,
  draggable,
  dragOver,
  onDragStartHandle,
  onDragEnterHandle,
  onDragOverHandle,
  onDropHandle,
  onDragEndHandle,
}: {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hint?: string;
  titleClass?: string;
  className?: string;
  headerRight?: React.ReactNode;
  /** when supplied, open state is owned by the parent (no localStorage) */
  controlledOpen?: boolean;
  onToggle?: (next: boolean) => void;
  /** enable drag-to-reorder: true while a drag is over this card */
  draggable?: boolean;
  dragOver?: boolean;
  onDragStartHandle?: (e: React.DragEvent) => void;
  onDragEnterHandle?: (e: React.DragEvent) => void;
  onDragOverHandle?: (e: React.DragEvent) => void;
  onDropHandle?: (e: React.DragEvent) => void;
  onDragEndHandle?: (e: React.DragEvent) => void;
}) {
  const [localOpen, setLocalOpen] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(sectionStateKey(id));
      if (raw === "0") return false;
      if (raw === "1") return true;
    } catch {
      /* storage unavailable — fall back to the default */
    }
    return defaultOpen;
  });
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const toggle = () => {
    const next = !open;
    if (controlledOpen !== undefined) {
      onToggle?.(next);
      return;
    }
    setLocalOpen(next);
    try {
      localStorage.setItem(sectionStateKey(id), next ? "1" : "0");
    } catch {
      /* storage unavailable — state still toggles for this session */
    }
  };
  return (
    <div
      className={`${className} ${dragOver ? "ring-2 ring-gold bg-gold/10" : ""}`}
      onDragEnter={onDragEnterHandle}
      onDragOver={onDragOverHandle}
      onDrop={onDropHandle}
    >
      <div className="flex w-full items-center justify-between gap-2 px-2 py-1.5 hover:bg-noir-800/60">
        {draggable && (
          <span
            draggable
            onDragStart={onDragStartHandle}
            onDragEnd={onDragEndHandle}
            title="Drag to reorder"
            className="flex cursor-grab touch-none select-none items-center text-paper/35 hover:text-gold active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" aria-hidden>
              <circle cx="2" cy="2.5" r="1.3" fill="currentColor" />
              <circle cx="6" cy="2.5" r="1.3" fill="currentColor" />
              <circle cx="2" cy="7" r="1.3" fill="currentColor" />
              <circle cx="6" cy="7" r="1.3" fill="currentColor" />
              <circle cx="2" cy="11.5" r="1.3" fill="currentColor" />
              <circle cx="6" cy="11.5" r="1.3" fill="currentColor" />
            </svg>
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          title={open ? "Minimise this section" : "Maximise this section"}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className={`min-w-0 truncate font-pulp text-[9px] uppercase tracking-widest ${titleClass}`}>{title}</span>
          {hint && <span className="shrink-0 font-type text-[8px] uppercase tracking-wider text-paper/40">{hint}</span>}
          <span className="shrink-0 text-paper/50" aria-hidden>
            {open ? "▾" : "▸"}
          </span>
        </button>
        {headerRight && <div className="flex shrink-0 items-center gap-1">{headerRight}</div>}
      </div>
      {open && <div className="space-y-2 p-2">{children}</div>}
    </div>
  );
}

/* --- shared pure helpers, also used by the extracted panels --- */

export function bgStyle(bg: string): React.CSSProperties {
  const resolved = assetBackground(bg);
  if (resolved.startsWith("gradient:")) return { background: resolved.slice(9) };
  if (resolved.startsWith("video:")) return { background: "#0c0c14" };
  return { backgroundImage: `url(${resolved})`, backgroundSize: "cover", backgroundPosition: "center" };
}

/** Media fields store compact `asset:<id>` references (not base64 data URLs), so
 * the text input should stay blank for those and only show real paths/URLs. */
export function mediaField(v?: string): string {
  if (!v) return "";
  if (v.startsWith("data:") || v.startsWith("asset:") || v.startsWith("video:asset:")) return "";
  return v;
}
