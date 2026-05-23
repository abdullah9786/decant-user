"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { useActiveDeal, type DealProduct } from "@/components/deal/ActiveDealProvider";
import DealCountdown from "@/components/deal/DealCountdown";
import { DEAL_HIDDEN_PREFIXES, formatDealEnd } from "@/components/deal/constants";

const STORAGE_KEY = "decume-promo-dismissed-at";
const DEAL_STORAGE_PREFIX = "decume-deal-promo-dismissed-at:";
const COOLDOWN_MS = 4 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 1500;
const EXCLUDED_PREFIXES = DEAL_HIDDEN_PREFIXES;

// Fallback static promo for when no daily deal is active. Tuned around
// Baccarat Rouge 540 since that's our flagship hook.
const STATIC_PROMO = {
  badge: "Iconic · Limited Decants",
  brand: "Maison Francis Kurkdjian",
  name: "Baccarat Rouge 540",
  tagline: "An elixir of light.",
  description:
    "A 70 ml retail bottle costs around a Lakh. With Decume, sample the icon from just 2 ml — hand-filled from a verified original bottle.",
  bottlePrice: "₹70,000",
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
  ctaHref:
    "https://decume.in/products/baccarat-rouge-540-extrait-de-parfum-maison-francis-kurkdjian?size=5&bottle=69dc05d2490f198e75a729a4",
};

// Format an INR amount without throwing on undefined.
function inr(n?: number | null): string {
  if (typeof n !== "number" || !isFinite(n)) return "";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// Pick the cheapest decant variant (if any) for the highlighted product —
// that's the entry-point price worth showing in the modal hook.
function entryVariant(product: DealProduct | undefined) {
  if (!product) return null;
  const decants = (product.variants || []).filter((v) => !v.is_pack);
  if (decants.length === 0) return product.variants?.[0] || null;
  return decants.reduce((min, v) => ((v.original_price ?? v.price) < (min.original_price ?? min.price) ? v : min));
}

// Pick the largest pack variant for "retail bottle" anchor pricing.
function packVariant(product: DealProduct | undefined) {
  if (!product) return null;
  const packs = (product.variants || []).filter((v) => v.is_pack);
  if (packs.length === 0) return null;
  return packs.reduce((max, v) => (v.size_ml > max.size_ml ? v : max));
}

export default function PromoModal() {
  const pathname = usePathname();
  const { deal, products } = useActiveDeal();
  const [isOpen, setIsOpen] = useState(false);

  // When a daily deal is active, the hero product is the first one in the
  // admin-configured list. Otherwise we fall back to the static Baccarat
  // Rouge 540 hook.
  const hero = products?.[0];
  const isDealMode = Boolean(deal && hero);

  // Use a deal-scoped cooldown key when a deal is active. That way, dismissing
  // yesterday's promo doesn't auto-dismiss today's new deal.
  const storageKey = useMemo(() => {
    if (deal) return `${DEAL_STORAGE_PREFIX}${deal._id}`;
    return STORAGE_KEY;
  }, [deal]);

  useEffect(() => {
    if (!pathname) return;
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) {
      setIsOpen(false);
      return;
    }

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(storageKey) || 0);
    } catch {
      // localStorage can throw in private modes — treat as never-dismissed.
    }
    if (Date.now() - dismissedAt < COOLDOWN_MS) return;

    const id = setTimeout(() => setIsOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(id);
  }, [pathname, storageKey]);

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
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // see comment above
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  // Compose the rendered fields based on whether a deal is active.
  //
  // `bottlePrice` / `bottleSize` are optional: when a deal's hero product has
  // no full-bottle ("pack") variant — e.g. a decant-only deal — there's no
  // meaningful retail anchor to strike through, so we omit them and the JSX
  // collapses to a single full-width "Today's deal" panel instead of
  // rendering a placeholder "Retail / RETAIL BOTTLE" column.
  let content: {
    badge: string;
    brand: string;
    name: string;
    tagline?: string;
    description?: string;
    bottlePrice?: string;
    bottleSize?: string;
    decantFrom: string;
    decantSubtitle: string;
    notes?: { label: string; value: string }[];
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
    accentColor?: string;
    endsAt?: string;
  };

  if (isDealMode && hero && deal) {
    const entry = entryVariant(hero);
    const pack = packVariant(hero);
    const discountPercent = deal.config?.discount_percent || 0;
    content = {
      badge: deal.display?.headline ? `${deal.display.headline} · Today Only` : "Decume Daily · Today Only",
      brand: hero.brand || "Decume",
      name: hero.name,
      tagline: deal.display?.subheadline,
      description:
        deal.display?.subheadline ||
        `${discountPercent}% off across selected fragrances. Ends ${formatDealEnd(deal.ends_at)} — claim it before it's gone.`,
      // Only surface the retail anchor when there's a real pack variant.
      // Otherwise these stay undefined and the JSX hides the left column.
      bottlePrice: pack ? inr(pack.original_price ?? pack.price) : undefined,
      bottleSize: pack ? `${pack.size_ml} ml retail` : undefined,
      decantFrom: entry ? `${entry.size_ml} ml @ ${inr(entry.sale_price ?? entry.price)}` : `${discountPercent}% OFF`,
      decantSubtitle: `Today · ${discountPercent}% OFF`,
      imageUrl: deal.display?.hero_image || hero.image_url || STATIC_PROMO.imageUrl,
      ctaLabel: deal.display?.cta_label || "Shop Today's Deal",
      ctaHref: deal.display?.cta_href || "/deals/today",
      accentColor: deal.display?.accent_color || "#dc2626",
      endsAt: deal.ends_at,
    };
  } else {
    content = {
      ...STATIC_PROMO,
    };
  }

  // Whether to render the dual "retail vs. deal" split, or collapse to a
  // single panel showing only the deal price.
  const hasRetailAnchor = Boolean(content.bottlePrice);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-headline"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismiss}
      />

      <div className="relative z-10 w-full max-w-4xl max-h-[70vh] sm:max-h-[88vh] flex flex-col overflow-hidden bg-emerald-950 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-3 border border-amber-400/20 z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_55%)]" />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close promotion"
          className="absolute top-4 right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/30 bg-emerald-950 hover:bg-amber-400 hover:text-emerald-950 text-amber-200 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="relative grid grid-cols-1 md:grid-cols-2 md:items-stretch flex-1 min-h-0">
          <div className="relative h-40 sm:h-56 md:h-auto md:min-h-full overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100/70">
            <Image
              src={content.imageUrl}
              alt={`${content.brand} ${content.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-3 sm:p-6 md:p-10"
              priority={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_55%,_rgba(0,0,0,0.08)_100%)]" />
          </div>

          <div className="relative p-5 sm:p-8 md:p-10 md:py-12 flex flex-col min-h-0 md:overflow-y-auto md:overscroll-contain">
            <div
              className="inline-flex items-center gap-2 self-start mb-3 sm:mb-5 px-2.5 py-1 sm:px-3 sm:py-1.5 border text-amber-200"
              style={
                content.accentColor
                  ? { backgroundColor: `${content.accentColor}26`, borderColor: `${content.accentColor}66` }
                  : { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(252,211,77,0.4)' }
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold">
                {content.badge}
              </span>
            </div>

            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-amber-300 font-bold mb-1.5 sm:mb-3">
              {content.brand}
            </p>

            <h2
              id="promo-modal-headline"
              className="font-serif text-2xl sm:text-4xl md:text-5xl leading-[1.05] text-white"
            >
              {content.name}
            </h2>

            {content.tagline && (
              <p className="hidden sm:block mt-4 font-serif italic text-base sm:text-lg text-amber-100/80">
                &ldquo;{content.tagline}&rdquo;
              </p>
            )}

            <div className="hidden sm:block mt-5 h-px w-16 bg-amber-300/40" />

            {content.description && (
              <p className="hidden sm:block mt-5 text-sm leading-relaxed text-emerald-100/80">
                {content.description}
              </p>
            )}

            <div
              className={`mt-4 sm:mt-6 border-y border-amber-300/15 ${
                hasRetailAnchor ? 'grid grid-cols-2' : ''
              }`}
            >
              {/* Left column: retail anchor — only shown when the hero
                  product actually has a full-bottle ("pack") variant. For
                  decant-only deals this column is omitted and the deal
                  panel takes the full width below. */}
              {hasRetailAnchor && (
                <div className="py-3 sm:py-4 pr-3 sm:pr-4 border-r border-amber-300/15">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-200/50 font-bold mb-1 sm:mb-1.5">
                    Retail Bottle
                  </p>
                  <p
                    className="font-serif text-lg sm:text-2xl text-emerald-100/70 line-through decoration-emerald-100/30"
                    aria-label={`Retail price ${content.bottlePrice}`}
                  >
                    {content.bottlePrice}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-emerald-300/50 mt-0.5 uppercase tracking-widest">
                    {content.bottleSize}
                  </p>
                </div>
              )}
              <div
                className={`py-3 sm:py-4 relative ${
                  hasRetailAnchor ? 'pl-3 sm:pl-4' : ''
                }`}
              >
                <p className="text-[9px] uppercase tracking-[0.3em] text-amber-300 font-bold mb-1 sm:mb-1.5">
                  {content.decantSubtitle}
                </p>
                <p className="font-serif text-lg sm:text-2xl text-amber-300">
                  From{" "}
                  <span className="text-xl sm:text-3xl">{content.decantFrom}</span>
                </p>
                <p className="text-[9px] sm:text-[10px] text-amber-200/60 mt-0.5 uppercase tracking-widest">
                  {isDealMode && content.endsAt
                    ? `Ends ${formatDealEnd(content.endsAt)}`
                    : "Hand-filled · Authentic"}
                </p>
              </div>
            </div>

            {isDealMode && content.endsAt && (
              <div className="mt-4 inline-flex items-center self-start px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200">
                <DealCountdown endsAt={content.endsAt} compact className="text-[11px]" />
              </div>
            )}

            {content.notes && (
              <dl className="hidden sm:block mt-6 space-y-3">
                {content.notes.map((n) => (
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
            )}

            <div className="mt-4 sm:mt-7 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href={content.ctaHref}
                onClick={dismiss}
                className="group flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 bg-amber-400 text-emerald-950 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] hover:bg-amber-300 transition-all"
              >
                <span>{content.ctaLabel}</span>
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
