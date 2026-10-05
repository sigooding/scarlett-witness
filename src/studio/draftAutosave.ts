import { compactStoryMedia } from "../data/mediaLibrary";
import type { Story } from "../types";

export const draftKey = (id: string) => `scarlet-studio-draft-${id}`;
export type DraftSaveStatus = { state: "pending" | "saving" | "saved" | "error"; message?: string };
type Pending = { story: Story; timer?: ReturnType<typeof setTimeout>; saving?: Promise<boolean> };

/** Debounced normal saves, synchronous safety net on navigation/unload.
 * Work is keyed by story AND revision (entry identity), so a slow media
 * compaction cannot overwrite a newer edit, import, undo or deleted draft. */
export class DraftAutosave {
  private pending = new Map<string, Pending>();
  private activeId = "";
  private listener?: (status: DraftSaveStatus) => void;

  constructor(
    private storage: Pick<Storage, "setItem"> = localStorage,
    private compact: (story: Story) => Promise<Story> = compactStoryMedia,
    private delay = 800,
  ) {}

  subscribe(listener: (status: DraftSaveStatus) => void): () => void {
    this.listener = listener;
    return () => { if (this.listener === listener) this.listener = undefined; };
  }
  private notify(id: string, status: DraftSaveStatus) { if (id === this.activeId) this.listener?.(status); }
  snapshot(id: string): Story | undefined { return this.pending.get(id)?.story; }

  queue(story: Story): void {
    if (this.activeId && this.activeId !== story.id) this.flushSync(this.activeId);
    this.activeId = story.id;
    const previous = this.pending.get(story.id);
    if (previous?.story === story) return;
    if (previous?.timer) clearTimeout(previous.timer);
    const entry: Pending = { story };
    this.pending.set(story.id, entry);
    this.notify(story.id, { state: "pending" });
    entry.timer = setTimeout(() => { void this.save(entry); }, this.delay);
  }

  private write(story: Story) {
    const json = JSON.stringify(story);
    this.storage.setItem(draftKey(story.id), json);
  }

  private save(entry: Pending): Promise<boolean> {
    if (entry.timer) { clearTimeout(entry.timer); entry.timer = undefined; }
    if (entry.saving) return entry.saving;
    const id = entry.story.id;
    this.notify(id, { state: "saving" });
    entry.saving = (async () => {
      try {
        const compacted = await this.compact(entry.story);
        if (this.pending.get(id) !== entry) return true; // Superseded/deleted.
        this.write(compacted);
        this.pending.delete(id);
        this.notify(id, { state: "saved" });
        return true;
      } catch (error) {
        if (this.pending.get(id) !== entry) return true;
        this.notify(id, { state: "error", message: error instanceof Error ? error.message : String(error) });
        return false;
      } finally {
        entry.saving = undefined;
      }
    })();
    return entry.saving;
  }

  /** Keep a recoverable snapshot BEFORE leaving the document. Media uploads
   * normally already contain asset: refs; older inline media is compacted in
   * the background. If storage is full, the caller can block navigation and
   * offer Export instead of falsely claiming the draft is safe. */
  flushSync(onlyId?: string): boolean {
    let ok = true;
    for (const [id, entry] of this.pending) {
      if (onlyId && onlyId !== id) continue;
      try { this.write(entry.story); }
      catch (error) {
        ok = false;
        this.notify(id, { state: "error", message: error instanceof Error ? error.message : String(error) });
      }
      void this.save(entry);
    }
    return ok;
  }

  async flush(): Promise<boolean> {
    return (await Promise.all([...this.pending.values()].map((entry) => this.save(entry)))).every(Boolean);
  }

  /** Call after a deliberate delete, or a pending timer would resurrect it. */
  discard(id: string): void {
    const entry = this.pending.get(id);
    if (entry?.timer) clearTimeout(entry.timer);
    this.pending.delete(id);
  }
}
