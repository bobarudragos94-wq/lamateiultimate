"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 290;
const CURSOR_GAP = 22;
const VIEWPORT_MARGIN = 12;

/** True on devices with a real pointer — the preview is pointless on touch screens. */
export function supportsHoverPreview() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

/**
 * Floating product image that follows the cursor. Rendered in a portal so the
 * fixed positioning is not affected by transformed ancestors (e.g. card hover lift).
 * Shown to the right of the cursor; flips to the left near the viewport edge.
 */
export function CursorImagePreview({
  x,
  y,
  src,
  title,
}: {
  x: number;
  y: number;
  src: string;
  title: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  let left = x + CURSOR_GAP;
  if (left + PREVIEW_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    left = x - CURSOR_GAP - PREVIEW_WIDTH;
  }
  const top = Math.min(
    Math.max(y - PREVIEW_HEIGHT / 2, VIEWPORT_MARGIN),
    window.innerHeight - PREVIEW_HEIGHT - VIEWPORT_MARGIN
  );

  return createPortal(
    <div
      aria-hidden
      className="animate-scale-in pointer-events-none fixed z-50"
      style={{ left, top, width: PREVIEW_WIDTH }}
    >
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/15">
        <div className="hazard-stripe h-1.5" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="aspect-square w-full object-cover" />
        <p className="line-clamp-2 border-t border-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700">
          {title}
        </p>
      </div>
    </div>,
    document.body
  );
}
