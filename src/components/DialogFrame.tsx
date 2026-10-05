import { useEffect, useRef, type ComponentProps } from "react";

const dialogs: HTMLElement[] = [];
const tabbables = (node: HTMLElement) => [...node.querySelectorAll<HTMLElement>(
  'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
)].filter((e) => e.getClientRects().length > 0 && !e.closest('[hidden],[inert]'));

/** A modal's content frame: focus on open, contain Tab/focus, Escape closes,
 * and restore the invoking control. A stack keeps nested tools independent. */
export function DialogFrame({ label, onDismiss, children, ...props }: ComponentProps<"div"> & {
  label: string; onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogs.push(node);
    const focusFirst = () => (tabbables(node)[0] ?? node).focus();
    focusFirst();
    const top = () => dialogs[dialogs.length - 1] === node;
    const key = (e: KeyboardEvent) => {
      if (!top()) return;
      if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); dismiss.current(); }
      if (e.key !== "Tab") return;
      const elements = tabbables(node);
      const first = elements[0] ?? node;
      const last = elements[elements.length - 1] ?? node;
      if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    const focus = (e: FocusEvent) => { if (top() && !node.contains(e.target as Node)) focusFirst(); };
    document.addEventListener("keydown", key, true);
    document.addEventListener("focusin", focus);
    return () => {
      dialogs.splice(dialogs.indexOf(node), 1);
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("focusin", focus);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <div {...props} ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>{children}</div>;
}
