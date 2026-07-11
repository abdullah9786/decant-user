"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Instagram } from "lucide-react";
import { isDealChromeHidden } from "@/components/deal/constants";
import type { InstagramPromoOffer } from "@/lib/server/offers";

type InstagramPromoBannerProps = {
  offer: InstagramPromoOffer | null;
  onVisibilityChange?: (visible: boolean) => void;
};

export default function InstagramPromoBanner({
  offer,
  onVisibilityChange,
}: InstagramPromoBannerProps) {
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  const hiddenRoute =
    isDealChromeHidden(pathname) ||
    pathname === "/instagram-promo" ||
    pathname === "/instagram-promo/how-to-enter";

  const message = offer?.display?.checkout_label?.trim();
  const title = offer?.name?.trim();
  const shouldRender = !!offer && !hiddenRoute && !!(message || title);

  useEffect(() => {
    if (!onVisibilityChange) return;
    if (!shouldRender) {
      onVisibilityChange(false);
      return;
    }

    const el = bannerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const mysteryH = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--mgift-bar-h") ||
          "0",
      );
      // Visible when the promo strip still sits below the sticky mystery bar.
      onVisibilityChange(rect.bottom > mysteryH + 1);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("mgift-bar-resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("mgift-bar-resize", update);
    };
  }, [onVisibilityChange, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      ref={bannerRef}
      className="relative w-full border-b border-emerald-100/30 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)]"
      role="region"
      aria-label="Instagram promo announcement"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-2.5 sm:flex-row sm:gap-4 sm:px-6 sm:py-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="hidden sm:inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <Instagram size={13} />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--accent-muted)] sm:text-[11px]">
            {title ? (
              <>
                <span className="text-white">{title}</span>
                {message ? (
                  <>
                    <span className="mx-2 hidden text-white/40 sm:inline">·</span>
                    <span className="mt-0.5 block font-medium normal-case tracking-normal text-[color:var(--accent-muted)] sm:mt-0 sm:inline sm:font-bold sm:uppercase sm:tracking-[0.18em]">
                      {message}
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <span className="text-white">{message}</span>
            )}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <Link
            href="/instagram-promo/how-to-enter"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-950 transition-colors hover:bg-emerald-50 sm:text-[10px]"
          >
            How to enter
          </Link>
          <Link
            href="/instagram-promo"
            className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/90 transition-colors hover:bg-white/10 sm:text-[10px]"
          >
            Submit entry
          </Link>
        </div>
      </div>
    </div>
  );
}
