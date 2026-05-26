'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { useActiveDeal } from './ActiveDealProvider';
import DealCountdown from './DealCountdown';
import { deepenAccent, isDealChromeHidden, readableOn } from './constants';

// Per-day storage key so dismissals reset at midnight without us needing
// to track expiries explicitly.
function dismissKey(dealId: string) {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const day = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
  return `decume-deal-banner-dismissed:${dealId}:${day}`;
}

export default function DailyDealBanner() {
  const { deal, allOutOfStock } = useActiveDeal();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    if (!deal) return;
    try {
      setDismissed(localStorage.getItem(dismissKey(deal._id)) === '1');
    } catch {
      setDismissed(false);
    }
  }, [deal]);

  const fgOnAccent = useMemo(
    () => (deal ? readableOn(deal.display?.accent_color || '#dc2626') : '#ffffff'),
    [deal],
  );
  // Always-dark, on-theme color we can safely use under white text and as a
  // tile background for the countdown. Without this, a pale accent leaves us
  // with dark digits on dark tiles (rgba(0,0,0,0.85)) and a black CTA that
  // looks bolted on rather than themed.
  const deepAccent = useMemo(
    () => (deal ? deepenAccent(deal.display?.accent_color || '#dc2626') : '#0b0b0b'),
    [deal],
  );

  if (!deal) return null;
  if (isDealChromeHidden(pathname)) return null;
  if (dismissed) return null;

  const accent = deal.display?.accent_color || '#dc2626';
  const adminHeadline = deal.display?.headline || 'Decume Daily';
  const adminSubheadline =
    deal.display?.subheadline || `${deal.config?.discount_percent || 0}% OFF today`;
  const adminCtaHref = deal.display?.cta_href || '/deals/today';
  const adminCtaLabel = deal.display?.cta_label || "Shop Today's Deal";

  // When everything is sold out, flip the banner from "buy now" mode to
  // "you missed it, the next one is loaded" mode. Same accent, same
  // shape, same timer — only the words change so the chrome stays
  // visually consistent and the regret/anticipation tone takes over.
  const headline = allOutOfStock ? 'Sold Out' : adminHeadline;
  const subheadline = allOutOfStock
    ? 'Today\'s drop is gone — next deal in'
    : adminSubheadline;
  const ctaHref = allOutOfStock ? '/deals/today' : adminCtaHref;
  const ctaLabel = allOutOfStock ? 'See what you missed' : adminCtaLabel;

  function handleDismiss() {
    try {
      localStorage.setItem(dismissKey(deal!._id), '1');
    } catch {
      // ignore (private mode)
    }
    setDismissed(true);
  }

  return (
    <div
      // Hidden on phones (only the marquee shows there); the bigger banner
      // lives on tablet+ where there's room for the segmented timer.
      className="hidden sm:flex relative w-full items-center justify-center gap-5 px-12 py-3 overflow-hidden"
      style={{
        // Diagonal sweep + radial highlight so the strip never feels flat.
        background: `linear-gradient(115deg, ${accent} 0%, ${accent}d9 45%, ${accent} 100%)`,
        color: fgOnAccent,
      }}
      role="region"
      aria-label="Daily deal banner"
    >
      {/* Animated sheen across the banner — purely decorative, motion-reduced
          users skip it via Tailwind's motion-reduce: prefix. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 motion-reduce:hidden"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
          animation: 'deal-banner-sheen 5s linear infinite',
        }}
      />

      {/* Left cluster: brand mark + subheadline */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] bg-black/25"
          style={{ color: fgOnAccent }}
        >
          <Flame size={12} className="motion-reduce:animate-none animate-pulse" />
          {headline}
        </span>
        <p className="hidden md:block text-sm font-bold tracking-tight">
          {subheadline}
        </p>
      </div>

      {/* Center: segmented HH:MM:SS countdown — the conversion hook.
          Tiles use a deepened version of the accent so the timer reads on
          both dark and pastel banners, while still feeling on-brand. */}
      <DealCountdown
        endsAt={deal.ends_at}
        boxed
        tileBg={deepAccent}
        tileFg="#ffffff"
        className="shrink-0"
      />

      {/* Right cluster: CTA — same deepened accent + white text so it stays
          themed regardless of how light the banner background gets. */}
      <Link
        href={ctaHref}
        className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg ring-1 ring-black/10 transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: deepAccent,
          color: '#ffffff',
        }}
      >
        <Sparkles size={12} />
        <span>{ctaLabel}</span>
        <ArrowRight
          size={12}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss daily deal banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/15 transition-colors"
        style={{ color: fgOnAccent }}
      >
        <X size={14} />
      </button>

      <style jsx>{`
        @keyframes deal-banner-sheen {
          0% { transform: translateX(0); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
