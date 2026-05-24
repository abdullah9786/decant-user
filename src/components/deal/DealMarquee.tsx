'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActiveDeal } from './ActiveDealProvider';
import { isDealChromeHidden } from './constants';

/**
 * Always-visible marquee strip (mobile and desktop). Pauses on hover via
 * CSS. Hidden on cart/checkout.
 *
 * Loop strategy: render two identical groups inside one flex track and
 * animate the track from translateX(0) to translateX(-50%). At the
 * keyframe boundary Group B has scrolled into Group A's starting slot,
 * so the snap-back to 0% is visually identical to the previous frame and
 * the loop reads as truly circular. Each group itself contains several
 * repeats of the message so the strip looks full on wide viewports too.
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

  // Repeats *inside one group*. Each group then gets duplicated below for
  // the loop to be seamless on wide screens (~half the track must always
  // exceed the viewport width).
  const repeats = Array.from({ length: 6 }, (_, i) => i);

  const group = (
    <div className="flex shrink-0">
      {repeats.map((i) => (
        <span
          key={i}
          className="flex items-center gap-3 px-6 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em]"
        >
          <span className="text-amber-200">★</span>
          <span>{text}</span>
        </span>
      ))}
    </div>
  );

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden text-white"
      style={{ background: `linear-gradient(90deg, ${accent}f2, ${accent})` }}
      aria-label="Today's daily deal"
    >
      {/* Track holds two identical groups. The `deal-marquee-track` class
          (defined in globals.css) drives the translate animation with a
          responsive duration and pauses on hover. */}
      <div className="deal-marquee-track flex whitespace-nowrap py-2 will-change-transform">
        {/* Group A — visible at animation start */}
        {group}
        {/* Group B — identical duplicate, scrolled into A's slot by end of
            the keyframe. aria-hidden because screen readers only need it
            once. */}
        <div aria-hidden="true" className="flex shrink-0">
          {repeats.map((i) => (
            <span
              key={`b-${i}`}
              className="flex items-center gap-3 px-6 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em]"
            >
              <span className="text-amber-200">★</span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
