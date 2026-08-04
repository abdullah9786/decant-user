"use client";

/**
 * App Router–friendly top progress indicator.
 *
 * `next-nprogress-bar` hooks `history.pushState` and calls NProgress.done()
 * immediately; Next.js fires pushState very early during soft navigations,
 * so the bar often never paints. This version starts on same-origin link
 * taps (not scroll drags) and ends when pathname/search finish updating.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 220;
const MAX_VISIBLE_MS = 10000;
const Z_BAR = 100050;
/** Ignore pointer drags beyond this — vertical scroll over product cards was starting the bar. */
const TAP_MOVE_THRESHOLD_PX = 10;

function routeKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

function isValidNavAnchor(
  a: HTMLAnchorElement,
  e?: Pick<PointerEvent, "metaKey" | "ctrlKey" | "shiftKey" | "altKey">,
): boolean {
  if (a.getAttribute("data-disable-nprogress") === "true") return false;
  if (a.target === "_blank") return false;
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
  const href = a.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return false;
  }
  let nextUrl: URL;
  try {
    nextUrl = new URL(href, window.location.origin);
  } catch {
    return false;
  }
  if (nextUrl.origin !== window.location.origin) return false;

  const current = routeKey(
    window.location.pathname,
    window.location.search.replace(/^\?/, ""),
  );
  const next = routeKey(nextUrl.pathname, nextUrl.search.replace(/^\?/, ""));
  return next !== current;
}

function navAnchorFromEvent(e: PointerEvent): HTMLAnchorElement | null {
  if (e.button !== 0) return null;
  const el = (e.target as HTMLElement | null)?.closest?.("a[href]");
  if (!el) return null;
  const interactive = (e.target as HTMLElement | null)?.closest?.(
    'button, [role="button"], input, select, textarea, label',
  );
  if (interactive && el.contains(interactive)) return null;
  const a = el as HTMLAnchorElement;
  if (!isValidNavAnchor(a, e)) return null;
  return a;
}

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const [active, setActive] = useState(false);
  const prevKey = useRef<string | null>(null);
  const navStartedAt = useRef(0);

  const key = routeKey(pathname, search);

  const finishNav = useCallback(() => {
    const elapsed = Date.now() - navStartedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    window.setTimeout(() => setActive(false), wait);
  }, []);

  useEffect(() => {
    if (prevKey.current === null) {
      prevKey.current = key;
      return;
    }
    if (prevKey.current === key) return;
    prevKey.current = key;
    finishNav();
  }, [key, finishNav]);

  // Safety net: if a click started the bar but no navigation ever completes
  // (cancelled nav, blocked route, etc.), force it off so it can't hang.
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setActive(false), MAX_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [active]);

  useEffect(() => {
    let pendingAnchor: HTMLAnchorElement | null = null;
    let startX = 0;
    let startY = 0;

    const clearPending = () => {
      pendingAnchor = null;
    };

    const startNav = () => {
      navStartedAt.current = Date.now();
      setActive(true);
    };

    const onPointerDown = (e: PointerEvent) => {
      const anchor = navAnchorFromEvent(e);
      if (!anchor) {
        clearPending();
        return;
      }
      pendingAnchor = anchor;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pendingAnchor) return;
      if (
        Math.hypot(e.clientX - startX, e.clientY - startY) > TAP_MOVE_THRESHOLD_PX
      ) {
        clearPending();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pendingAnchor) return;
      const anchor = pendingAnchor;
      clearPending();
      if (e.button !== 0) return;
      if (
        Math.hypot(e.clientX - startX, e.clientY - startY) > TAP_MOVE_THRESHOLD_PX
      ) {
        return;
      }
      const hit = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)
        ?.closest?.("a[href]");
      if (hit !== anchor) return;
      if (!isValidNavAnchor(anchor, e)) return;
      startNav();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", clearPending, true);
    window.addEventListener("scroll", clearPending, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", clearPending, true);
      window.removeEventListener("scroll", clearPending, true);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="decume-nav-progress pointer-events-none fixed top-0 left-0 right-0 overflow-hidden"
      style={{ height: 3, zIndex: Z_BAR }}
    >
      <div className="decume-nav-progress__track absolute inset-0 bg-emerald-600/15" />
      <div className="decume-nav-progress__bar absolute top-0 left-0 h-full w-[45%] rounded-none bg-emerald-600 shadow-[0_0_12px_rgba(5,150,105,0.45)]" />
    </div>
  );
}
