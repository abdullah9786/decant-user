"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, ArrowRight } from "lucide-react";
import { isDealChromeHidden } from "@/components/deal/constants";
import type { InstagramPromoOffer } from "@/lib/server/offers";

export default function InstagramPromoBanner({
  offer,
}: {
  offer: InstagramPromoOffer | null;
}) {
  const pathname = usePathname();

  if (!offer) return null;
  if (isDealChromeHidden(pathname)) return null;
  if (pathname === "/instagram-promo") return null;

  const message = offer.display?.checkout_label?.trim();
  const title = offer.name?.trim();
  if (!message && !title) return null;

  return (
    <div
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

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-950 transition-colors hover:bg-emerald-50 sm:text-[10px]"
          >
            Shop now
            <ArrowRight size={11} />
          </Link>
          <Link
            href="/instagram-promo"
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/85 border-b border-white/40 pb-0.5 transition-colors hover:text-white hover:border-white/70 sm:text-[10px]"
          >
            How to enter
          </Link>
        </div>
      </div>
    </div>
  );
}
