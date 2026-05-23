'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActiveDeal } from './ActiveDealProvider';
import { isDealChromeHidden } from './constants';

/**
 * Always-visible marquee strip (mobile and desktop). Pauses on hover via
 * CSS. Hidden on cart/checkout. The animation is keyframe-based so it
 * survives SSR; once mounted the deal's marquee text takes over.
 */
export default function DealMarquee() {
  const { deal } = useActiveDeal();
  const pathname = usePathname();

  if (!deal) return null;
  if (isDealChromeHidden(pathname)) return null;

  const accent = deal.display?.accent_color || '#dc2626';
  const text =
    deal.display?.marquee_text ||
    deal.display?.subheadline ||
    `${deal.config?.discount_percent || 0}% OFF today only`;
  const href = deal.display?.cta_href || '/deals/today';

  // Repeat the message a few times so the loop reads naturally regardless
  // of viewport width.
  const segments = Array.from({ length: 6 }, (_, i) => i);

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden text-white"
      style={{ background: `linear-gradient(90deg, ${accent}f2, ${accent})` }}
      aria-label="Today's daily deal"
    >
      <div
        className="flex whitespace-nowrap py-2 [animation:deal-marquee_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationPlayState: 'running' }}
      >
        {segments.map((i) => (
          <span
            key={i}
            className="flex items-center gap-3 px-6 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em]"
          >
            <span className="text-amber-200">★</span>
            <span>{text}</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes deal-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </Link>
  );
}
