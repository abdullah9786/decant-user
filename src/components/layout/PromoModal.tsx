"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { useActiveDeal, type DealProduct } from "@/components/deal/ActiveDealProvider";
import { isProductOutOfStock } from "@/lib/product/stock";
import DealCountdown from "@/components/deal/DealCountdown";
import { DEAL_HIDDEN_PREFIXES, deepenAccent, formatDealEnd, lightenAccent } from "@/components/deal/constants";

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
  //
  // We deliberately pick the first *in-stock* product (rather than just
  // `products[0]`) so the modal never promotes something the user can't
  // actually buy. If every deal product is sold out, `hero` is undefined,
  // `isDealMode` becomes false, and we fall through to the static
  // Baccarat hook — which is the right behaviour: better to show a
  // non-deal evergreen pitch than push a sold-out card.
  const hero = products?.find((p) => !isProductOutOfStock(p));
  const isDealMode = Boolean(deal && hero);

  const dealTheme = useMemo(() => {
    if (!isDealMode || !deal) return null;
    const accent = deal.display?.accent_color || "#dc2626";
    const deep = deepenAccent(accent);
    const light = lightenAccent(accent);
    // White-based type hierarchy reads reliably on any accent canvas — tinted
    // accent text (lightAccent on deepAccent) fails for red-on-red palettes.
    const text = {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.92)",
      body: "rgba(255,255,255,0.88)",
      muted: "rgba(255,255,255,0.74)",
      faint: "rgba(255,255,255,0.62)",
      border: "rgba(255,255,255,0.22)",
      borderStrong: "rgba(255,255,255,0.38)",
    };
    return {
      accent,
      deep,
      light,
      text,
      shell: {
        backgroundColor: deep,
        backgroundImage: `
          radial-gradient(circle at 0% 0%, ${accent}55 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, ${accent}44 0%, transparent 55%),
          linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 100%)
        `,
      },
      frameBorder: text.borderStrong,
      close: {
        borderColor: text.borderStrong,
        backgroundColor: "rgba(0,0,0,0.35)",
        color: text.primary,
      },
      imageBg: `linear-gradient(to bottom right, #ffffff, ${accent}10, ${accent}18)`,
      contentScrim:
        "linear-gradient(105deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.38) 100%)",
      badge: {
        backgroundColor: "rgba(0,0,0,0.32)",
        borderColor: text.borderStrong,
        dotColor: light,
        textColor: text.primary,
      },
      brand: text.secondary,
      tagline: text.body,
      divider: text.borderStrong,
      body: text.body,
      muted: text.muted,
      faint: text.faint,
      highlight: text.primary,
      priceBorder: text.border,
      countdown: {
        backgroundColor: "rgba(0,0,0,0.35)",
        borderColor: text.borderStrong,
        color: text.primary,
      },
      cta: {
        backgroundColor: "#ffffff",
        color: deep,
      },
      ctaSecondary: {
        backgroundColor: "transparent",
        borderColor: text.borderStrong,
        color: text.secondary,
      },
      dismiss: text.muted,
      headlineShadow: "0 1px 3px rgba(0,0,0,0.45)",
    };
  }, [isDealMode, deal]);

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

      <div
        className={`relative z-10 w-full max-w-4xl max-h-[70vh] sm:max-h-[88vh] flex flex-col overflow-hidden text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-500${
          dealTheme ? "" : " bg-emerald-950"
        }`}
        style={dealTheme?.shell}
      >
        <div
          className={`pointer-events-none absolute inset-3 border z-10${
            dealTheme ? "" : " border-amber-400/20"
          }`}
          style={dealTheme ? { borderColor: dealTheme.frameBorder } : undefined}
        />
        {!dealTheme && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_55%)]" />
          </>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close promotion"
          className={`absolute top-4 right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-opacity hover:opacity-90${
            dealTheme
              ? ""
              : " border-amber-400/30 bg-emerald-950 hover:bg-amber-400 hover:text-emerald-950 text-amber-200 transition-colors"
          }`}
          style={dealTheme ? dealTheme.close : undefined}
        >
          <X size={16} />
        </button>

        <div className="relative grid grid-cols-1 md:grid-cols-2 md:items-stretch flex-1 min-h-0">
          <div
            className={`relative h-40 sm:h-56 md:h-auto md:min-h-full overflow-hidden${
              dealTheme ? "" : " bg-gradient-to-br from-amber-50 via-white to-amber-100/70"
            }`}
            style={dealTheme ? { background: dealTheme.imageBg } : undefined}
          >
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
            {dealTheme && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: dealTheme.contentScrim }}
              />
            )}
            <div className="relative z-[1] flex flex-col min-h-0 flex-1">
            <div
              className={`inline-flex items-center gap-2 self-start mb-3 sm:mb-5 px-2.5 py-1 sm:px-3 sm:py-1.5 border${
                dealTheme ? "" : " text-amber-200"
              }`}
              style={
                dealTheme
                  ? {
                      backgroundColor: dealTheme.badge.backgroundColor,
                      borderColor: dealTheme.badge.borderColor,
                      color: dealTheme.badge.textColor,
                    }
                  : { backgroundColor: "rgba(251,191,36,0.15)", borderColor: "rgba(252,211,77,0.4)" }
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse${
                  dealTheme ? "" : " bg-amber-300"
                }`}
                style={dealTheme ? { backgroundColor: dealTheme.badge.dotColor } : undefined}
              />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold">
                {content.badge}
              </span>
            </div>

            <p
              className={`text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-bold mb-1.5 sm:mb-3${
                dealTheme ? "" : " text-amber-300"
              }`}
              style={dealTheme ? { color: dealTheme.brand } : undefined}
            >
              {content.brand}
            </p>

            <h2
              id="promo-modal-headline"
              className="font-serif text-2xl sm:text-4xl md:text-5xl leading-[1.05] text-white"
              style={dealTheme ? { textShadow: dealTheme.headlineShadow } : undefined}
            >
              {content.name}
            </h2>

            {content.tagline && (
              <p
                className={`hidden sm:block mt-4 font-serif italic text-base sm:text-lg${
                  dealTheme ? "" : " text-amber-100/80"
                }`}
                style={dealTheme ? { color: dealTheme.tagline } : undefined}
              >
                &ldquo;{content.tagline}&rdquo;
              </p>
            )}

            <div
              className={`hidden sm:block mt-5 h-px w-16${dealTheme ? "" : " bg-amber-300/40"}`}
              style={dealTheme ? { backgroundColor: dealTheme.divider } : undefined}
            />

            {content.description && (
              <p
                className={`hidden sm:block mt-5 text-sm leading-relaxed${
                  dealTheme ? "" : " text-emerald-100/80"
                }`}
                style={dealTheme ? { color: dealTheme.body } : undefined}
              >
                {content.description}
              </p>
            )}

            <div
              className={`mt-4 sm:mt-6 border-y${
                hasRetailAnchor ? " grid grid-cols-2" : ""
              }${dealTheme ? "" : " border-amber-300/15"}`}
              style={dealTheme ? { borderColor: dealTheme.priceBorder } : undefined}
            >
              {/* Left column: retail anchor — only shown when the hero
                  product actually has a full-bottle ("pack") variant. For
                  decant-only deals this column is omitted and the deal
                  panel takes the full width below. */}
              {hasRetailAnchor && (
                <div
                  className={`py-3 sm:py-4 pr-3 sm:pr-4 border-r${
                    dealTheme ? "" : " border-amber-300/15"
                  }`}
                  style={dealTheme ? { borderColor: dealTheme.priceBorder } : undefined}
                >
                  <p
                    className={`text-[9px] uppercase tracking-[0.3em] font-bold mb-1 sm:mb-1.5${
                      dealTheme ? "" : " text-emerald-200/50"
                    }`}
                    style={dealTheme ? { color: dealTheme.muted } : undefined}
                  >
                    Retail Bottle
                  </p>
                  <p
                    className={`font-serif text-lg sm:text-2xl line-through${
                      dealTheme ? "" : " text-emerald-100/70 decoration-emerald-100/30"
                    }`}
                    style={
                      dealTheme
                        ? {
                            color: dealTheme.faint,
                            textDecorationColor: dealTheme.text.borderStrong,
                          }
                        : undefined
                    }
                    aria-label={`Retail price ${content.bottlePrice}`}
                  >
                    {content.bottlePrice}
                  </p>
                  <p
                    className={`text-[9px] sm:text-[10px] mt-0.5 uppercase tracking-widest${
                      dealTheme ? "" : " text-emerald-300/50"
                    }`}
                    style={dealTheme ? { color: dealTheme.muted } : undefined}
                  >
                    {content.bottleSize}
                  </p>
                </div>
              )}
              <div
                className={`py-3 sm:py-4 relative ${
                  hasRetailAnchor ? "pl-3 sm:pl-4" : ""
                }`}
              >
                <p
                  className={`text-[9px] uppercase tracking-[0.3em] font-bold mb-1 sm:mb-1.5${
                    dealTheme ? "" : " text-amber-300"
                  }`}
                  style={dealTheme ? { color: dealTheme.muted } : undefined}
                >
                  {content.decantSubtitle}
                </p>
                <p
                  className={`font-serif text-lg sm:text-2xl${
                    dealTheme ? "" : " text-amber-300"
                  }`}
                  style={dealTheme ? { color: dealTheme.highlight } : undefined}
                >
                  From{" "}
                  <span className="text-xl sm:text-3xl">{content.decantFrom}</span>
                </p>
                <p
                  className={`text-[9px] sm:text-[10px] mt-0.5 uppercase tracking-widest${
                    dealTheme ? "" : " text-amber-200/60"
                  }`}
                  style={dealTheme ? { color: dealTheme.muted } : undefined}
                >
                  {isDealMode && content.endsAt
                    ? `Ends ${formatDealEnd(content.endsAt)}`
                    : "Hand-filled · Authentic"}
                </p>
              </div>
            </div>

            {isDealMode && content.endsAt && (
              <div
                className={`mt-4 inline-flex items-center self-start px-3 py-1.5 rounded-full border${
                  dealTheme ? "" : " bg-amber-400/10 border-amber-300/30 text-amber-200"
                }`}
                style={dealTheme ? dealTheme.countdown : undefined}
              >
                <DealCountdown
                  endsAt={content.endsAt}
                  compact
                  className="text-[11px]"
                  tileBg={dealTheme?.deep}
                  tileFg="#ffffff"
                />
              </div>
            )}

            {content.notes && (
              <dl className="hidden sm:block mt-6 space-y-3">
                {content.notes.map((n) => (
                  <div
                    key={n.label}
                    className={`flex items-baseline gap-4 border-b pb-2 last:border-b-0${
                      dealTheme ? "" : " border-amber-300/10"
                    }`}
                    style={dealTheme ? { borderColor: dealTheme.priceBorder } : undefined}
                  >
                    <dt
                      className={`text-[10px] uppercase tracking-[0.3em] font-bold w-14 flex-shrink-0${
                        dealTheme ? "" : " text-amber-300/80"
                      }`}
                      style={dealTheme ? { color: dealTheme.muted } : undefined}
                    >
                      {n.label}
                    </dt>
                    <dd
                      className={`text-sm font-serif italic${
                        dealTheme ? "" : " text-emerald-50/90"
                      }`}
                      style={dealTheme ? { color: dealTheme.body } : undefined}
                    >
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
                className={`group flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] transition-all shadow-lg${
                  dealTheme ? " hover:brightness-95" : " bg-amber-400 text-emerald-950 hover:bg-amber-300"
                }`}
                style={
                  dealTheme
                    ? { ...dealTheme.cta, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }
                    : undefined
                }
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
                className={`px-5 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] transition-colors${
                  dealTheme ? " hover:text-white" : " text-emerald-200/60 hover:text-amber-200"
                }`}
                style={dealTheme ? { color: dealTheme.dismiss } : undefined}
              >
                Not Now
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
