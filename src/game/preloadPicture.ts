/**
 * Pictures fetched and decoded ahead of the beat that shows them.
 *
 * A beat's picture used to be mounted the moment its beat began, and the picture going out was dropped about a second later
 * whether or not the new one had arrived. On a first visit over a real connection (nothing is preloaded, the film's pictures are
 * a few hundred KB each) the new picture could still be loading then, and for that moment the scene's own picture, the first shot
 * of the scene, showed through: the "main background flickering over the beat images". Now a picture is mounted only once it is
 * decoded (the picture before it stays up until then), and the next few beats' pictures are fetched while the player reads. The
 * next-room lookahead in scenePreload.ts / mediaPreload.ts warms only the next line's insert and is switched off on a slow or
 * data-saving connection, which is exactly when a picture arrives late: the holding here is not.
 */
const ready = new Set<string>();
const pending = new Map<string, Promise<void>>();
/** The last few decoded images stay referenced so the browser keeps their bitmaps for the beat that is about to show them. */
const keep: HTMLImageElement[] = [];
const KEEP = 6;

const needsNoWait = (url: string) => !url || /^(gradient:|video:|emoji:)/.test(url) || typeof Image === "undefined";

/** True when the picture is already fetched and decoded (gradients and clips never wait). */
export function pictureReady(url: string): boolean {
  return needsNoWait(url) || ready.has(url);
}

/** Fetch and decode a picture. Never rejects: a broken picture or a slow one (after `timeoutMs`) must not hold the story up. */
export function preloadPicture(url: string, timeoutMs = 6000): Promise<void> {
  if (pictureReady(url)) return Promise.resolve();
  let settled = pending.get(url);
  if (!settled) {
    settled = new Promise<void>((resolve) => {
      const done = () => {
        ready.add(url);
        pending.delete(url);
        resolve();
      };
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        (typeof img.decode === "function" ? img.decode().catch(() => undefined) : Promise.resolve()).then(() => {
          keep.push(img);
          if (keep.length > KEEP) keep.shift();
          done();
        });
      };
      img.onerror = done;
      img.src = url;
    });
    pending.set(url, settled);
  }
  return Promise.race([settled, new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))]);
}
