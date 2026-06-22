"use client";

/**
 * App Router–friendly top progress indicator.
 *
 * `next-nprogress-bar` hooks `history.pushState` and calls NProgress.done()
 * immediately; Next.js fires pushState very early during soft navigations,
 * so the bar often never paints. This version starts on same-origin link
 * pointerdown and ends when pathname/search finish updating.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 220;
const MAX_VISIBLE_MS = 10000;
const Z_BAR = 100050;

function routeKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
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
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!el) return;
      // A control nested inside the link (size chips, qty +/-, add-to-cart)
      // handles the click in place and cancels navigation. Starting the bar
      // here would leave it running forever since the route never changes.
      const interactive = (e.target as HTMLElement | null)?.closest?.(
        'button, [role="button"], input, select, textarea, label',
      );
      if (interactive && el.contains(interactive)) return;
      const a = el as HTMLAnchorElement;
      if (a.getAttribute("data-disable-nprogress") === "true") return;
      if (a.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }
      let nextUrl: URL;
      try {
        nextUrl = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (nextUrl.origin !== window.location.origin) return;

      const current = routeKey(
        window.location.pathname,
        window.location.search.replace(/^\?/, ""),
      );
      const next = routeKey(nextUrl.pathname, nextUrl.search.replace(/^\?/, ""));
      if (next === current) return;

      navStartedAt.current = Date.now();
      setActive(true);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
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
