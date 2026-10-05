import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { scrollStyle, type LayerScroll } from "./animation";

/** Measure only on image load / resize, never per frame. CSS scrolls by one
 * actual rendered tile, not background-position percentages (which move ZERO
 * pixels when an image and its box have the same dimensions). */
export function ScrollingLayer({ src, scroll, name, fit, flip = false }: {
  src: string;
  scroll: LayerScroll;
  name: string;
  fit: "cover" | "fill" | "contain" | "native";
  flip?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [sizes, setSizes] = useState({ tileX: 1, tileY: 1, boxX: 1, boxY: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const image = new Image();
    let disposed = false;
    const measure = () => {
      if (disposed || !image.naturalWidth || !el.clientWidth || !el.clientHeight) return;
      const boxX = el.clientWidth, boxY = el.clientHeight;
      const ratio = fit === "native" ? 1 : fit === "contain"
        ? Math.min(boxX / image.naturalWidth, boxY / image.naturalHeight)
        : Math.max(boxX / image.naturalWidth, boxY / image.naturalHeight);
      const tileX = fit === "fill" ? boxX : image.naturalWidth * ratio;
      const tileY = fit === "fill" ? boxY : image.naturalHeight * ratio;
      setSizes({ tileX, tileY, boxX, boxY });
    };
    image.onload = measure;
    image.src = src;
    if (image.complete) measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      disposed = true;
      image.onload = null;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [src, fit]);
  return <div
    ref={ref}
    data-scrolling-layer={name}
    className="h-full w-full"
    style={{
      backgroundRepeat: scroll.repeat === false ? "no-repeat" : "repeat",
      backgroundSize: "var(--scroll-tile-x) var(--scroll-tile-y)",
      backgroundPosition: "var(--scroll-start-x, 0px) var(--scroll-start-y, 0px)",
      ...scrollStyle(scroll, name, { reducedMotion, tileRatioX: sizes.tileX / sizes.boxX, tileRatioY: sizes.tileY / sizes.boxY }),
      backgroundImage: `url("${src.replace(/"/g, "%22")}")`,
      transform: flip ? "scaleX(-1)" : undefined,
      "--scroll-tile-x": `${sizes.tileX}px`,
      "--scroll-tile-y": `${sizes.tileY}px`,
      "--scroll-start-x": `${sizes.tileX * (Number.isFinite(scroll.offsetX) ? scroll.offsetX! : 0) / 100}px`,
      "--scroll-start-y": `${sizes.tileY * (Number.isFinite(scroll.offsetY) ? scroll.offsetY! : 0) / 100}px`,
    } as React.CSSProperties}
  />;
}
