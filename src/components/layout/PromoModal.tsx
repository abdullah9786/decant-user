"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "decume-promo-dismissed-at";
const COOLDOWN_MS = 4 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 1500;
const EXCLUDED_PREFIXES = ["/cart", "/checkout"];

// Hardcoded promo content. Edit this block when you want to swap the
// featured product. Bump STORAGE_KEY (e.g. add "-v2") if you want every
// returning user to see the popup again after a content change.
const PROMO = {
  badge: "Iconic · Limited Decants",
  brand: "Maison Francis Kurkdjian",
  name: "Baccarat Rouge 540",
  tagline: "An elixir of light.",
  description:
    "A 70 ml retail bottle costs around a Lakh. With Decume, sample the icon from just 2 ml — hand-filled from a verified original bottle.",
  // Price contrast: the anchor that makes the decant feel like a no-brainer.
  // Update `decantFrom` once you finalise the 2 ml price (e.g. "₹699").
  bottlePrice: "₹1,00,000",
  bottleSize: "100 ml retail",
  decantFrom: "2 ml",
  decantSubtitle: "Decume Decant",
  notes: [
    { label: "Top", value: "Saffron · Jasmine" },
    { label: "Heart", value: "Amberwood · Ambergris" },
    { label: "Base", value: "Fir Resin · Cedar" },
  ],
  imageUrl:
    "https://ik.imagekit.io/smhon4suw/Maison_Francis_Kurkdjian_Baccarat_Rouge_540_6.8_oz.jpg_v=1770783807?updatedAt=1779109762950",
  ctaLabel: "Try the Icon",
  ctaHref: "https://decume.in/products/baccarat-rouge-540-extrait-de-parfum-maison-francis-kurkdjian?size=5&bottle=69dc05d2490f198e75a729a4",
};

export default function PromoModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) {
      setIsOpen(false);
      return;
    }

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    } catch {
      // localStorage can throw in private modes — treat as never-dismissed.
    }
    if (Date.now() - dismissedAt < COOLDOWN_MS) return;

    const id = setTimeout(() => setIsOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // see comment above
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-headline"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card. Capped to ~70vh on mobile and ~88vh on tablet+. Mobile drops
          the tagline, long description and note pyramid so everything fits
          without scrolling. Tablet/desktop show the full editorial layout. */}
      <div className="relative z-10 w-full max-w-4xl max-h-[70vh] sm:max-h-[88vh] flex flex-col overflow-hidden bg-emerald-950 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-500">
        {/* Decorative gold hairline frame */}
        <div className="pointer-events-none absolute inset-3 border border-amber-400/20 z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_55%)]" />

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close promotion"
          className="absolute top-4 right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/30 bg-emerald-950/80 hover:bg-amber-400 hover:text-emerald-950 text-amber-200 backdrop-blur flex items-center justify-center transition-all"
        >
          <X size={16} />
        </button>

        <div className="relative grid grid-cols-1 md:grid-cols-2 md:items-stretch flex-1 min-h-0">
          {/* Image side — cream "boutique" backdrop so the bottle is fully
              visible and the white product-photo background doesn't clash
              with the emerald content side. On desktop the height is driven
              by the content column via grid stretching (no fixed value), so
              the image always fills 100% of the modal's height. */}
          <div className="relative h-40 sm:h-56 md:h-auto md:min-h-full overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100/70">
            <Image
              src={PROMO.imageUrl}
              alt={`${PROMO.brand} ${PROMO.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-3 sm:p-6 md:p-10"
              priority={false}
            />
            {/* Subtle vignette adds depth without competing with the product. */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_55%,_rgba(0,0,0,0.08)_100%)]" />
          </div>

          {/* Content side. On md+ this column scrolls inside the capped card
              height so longer copy is reachable on short viewports. Mobile
              relies on hidden-on-mobile elements and never scrolls. */}
          <div className="relative p-5 sm:p-8 md:p-10 md:py-12 flex flex-col min-h-0 md:overflow-y-auto md:overscroll-contain">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start mb-3 sm:mb-5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-400/15 backdrop-blur border border-amber-300/40 text-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold">
                {PROMO.badge}
              </span>
            </div>

            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-amber-300 font-bold mb-1.5 sm:mb-3">
              {PROMO.brand}
            </p>

            <h2
              id="promo-modal-headline"
              className="font-serif text-2xl sm:text-4xl md:text-5xl leading-[1.05] text-white"
            >
              {PROMO.name}
            </h2>

            {/* Tagline + description + divider are hidden on mobile to keep
                the modal scroll-free. Tablet up gets the full editorial copy. */}
            <p className="hidden sm:block mt-4 font-serif italic text-base sm:text-lg text-amber-100/80">
              &ldquo;{PROMO.tagline}&rdquo;
            </p>

            <div className="hidden sm:block mt-5 h-px w-16 bg-amber-300/40" />

            <p className="hidden sm:block mt-5 text-sm leading-relaxed text-emerald-100/80">
              {PROMO.description}
            </p>

            {/* Price contrast — the killer hook. Always visible. */}
            <div className="mt-4 sm:mt-6 grid grid-cols-2 border-y border-amber-300/15">
              {/* Anchor: bottle price */}
              <div className="py-3 sm:py-4 pr-3 sm:pr-4 border-r border-amber-300/15">
                <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-200/50 font-bold mb-1 sm:mb-1.5">
                  Retail Bottle
                </p>
                <p
                  className="font-serif text-lg sm:text-2xl text-emerald-100/70 line-through decoration-emerald-100/30"
                  aria-label={`Retail price ${PROMO.bottlePrice}`}
                >
                  {PROMO.bottlePrice}
                </p>
                <p className="text-[9px] sm:text-[10px] text-emerald-300/50 mt-0.5 uppercase tracking-widest">
                  {PROMO.bottleSize}
                </p>
              </div>
              {/* Anchor break: decant entry */}
              <div className="py-3 sm:py-4 pl-3 sm:pl-4 relative">
                <p className="text-[9px] uppercase tracking-[0.3em] text-amber-300 font-bold mb-1 sm:mb-1.5">
                  {PROMO.decantSubtitle}
                </p>
                <p className="font-serif text-lg sm:text-2xl text-amber-300">
                  From{" "}
                  <span className="text-xl sm:text-3xl">{PROMO.decantFrom}</span>
                </p>
                <p className="text-[9px] sm:text-[10px] text-amber-200/60 mt-0.5 uppercase tracking-widest">
                  Hand-filled · Authentic
                </p>
              </div>
            </div>

            {/* Note pyramid — hidden on mobile to keep the modal scroll-free. */}
            <dl className="hidden sm:block mt-6 space-y-3">
              {PROMO.notes.map((n) => (
                <div
                  key={n.label}
                  className="flex items-baseline gap-4 border-b border-amber-300/10 pb-2 last:border-b-0"
                >
                  <dt className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 font-bold w-14 flex-shrink-0">
                    {n.label}
                  </dt>
                  <dd className="text-sm text-emerald-50/90 font-serif italic">
                    {n.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* CTA */}
            <div className="mt-4 sm:mt-7 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href={PROMO.ctaHref}
                onClick={dismiss}
                className="group flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 bg-amber-400 text-emerald-950 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] hover:bg-amber-300 transition-all"
              >
                <span>{PROMO.ctaLabel}</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="px-5 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-emerald-200/60 hover:text-amber-200 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
