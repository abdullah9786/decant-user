"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Gift, PartyPopper, Trophy } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useMysteryGiftOffer } from "@/lib/useMysteryGiftOffer";
import { DEFAULT_ACCENT, formatINR } from "@/lib/mysteryGift";
import {
  isDealChromeHidden,
  deepenAccent,
  lightenAccent,
} from "@/components/deal/constants";

export default function MysteryGiftBar() {
  const { offer, tiers } = useMysteryGiftOffer();
  const subtotal = useCartStore((s) => s.totalPrice());
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => setMounted(true), []);

  const show =
    mounted &&
    !!offer &&
    tiers.length > 0 &&
    subtotal > 0 &&
    !isDealChromeHidden(pathname);

  // Publish the bar height so the (also-sticky) navbar can offset itself and
  // sit directly beneath it instead of overlapping. Collapses to 0 when hidden.
  useEffect(() => {
    const root = document.documentElement;
    const setVar = () => {
      const h = show && barRef.current ? barRef.current.offsetHeight : 0;
      root.style.setProperty("--mgift-bar-h", `${h}px`);
    };
    setVar();
    if (!show) return;
    window.addEventListener("resize", setVar);
    return () => {
      window.removeEventListener("resize", setVar);
      root.style.setProperty("--mgift-bar-h", "0px");
    };
  }, [show, subtotal, tiers.length]);

  if (!show) return null;

  const unlockedIdx = tiers.reduce(
    (acc, t, i) => (subtotal >= Number(t.min_subtotal) ? i : acc),
    -1,
  );
  const unlockedTier = unlockedIdx >= 0 ? tiers[unlockedIdx] : null;
  const nextTier =
    unlockedIdx + 1 < tiers.length ? tiers[unlockedIdx + 1] : null;

  // One full bar = one tier: progress is measured within the current segment
  // (the tier already unlocked -> the next one), so it resets and refills as
  // each tier is reached.
  const segStart = unlockedTier ? Number(unlockedTier.min_subtotal) : 0;
  const segEnd = nextTier ? Number(nextTier.min_subtotal) : segStart;
  const segPct =
    nextTier && segEnd > segStart
      ? Math.min(100, Math.max(0, ((subtotal - segStart) / (segEnd - segStart)) * 100))
      : 100;
  const remaining = nextTier ? Math.max(0, segEnd - subtotal) : 0;

  const accent =
    nextTier?.accent_color || unlockedTier?.accent_color || DEFAULT_ACCENT;
  const trackBg = deepenAccent(accent);
  const fillFrom = accent;
  const fillTo = lightenAccent(accent);

  let icon = <Gift size={13} />;
  let message: React.ReactNode;

  if (!unlockedTier && nextTier) {
    message = (
      <>
        Add <b>{formatINR(remaining)}</b> more to unlock <b>{nextTier.name}</b> —
        your free mystery gift
      </>
    );
  } else if (unlockedTier && nextTier) {
    icon = <PartyPopper size={13} />;
    message = (
      <>
        <b>{unlockedTier.name}</b> unlocked! Add <b>{formatINR(remaining)}</b>{" "}
        more to upgrade to <b>{nextTier.name}</b>
      </>
    );
  } else {
    icon = <Trophy size={13} />;
    message = (
      <>
        You&apos;ve unlocked our top mystery gift — <b>{unlockedTier?.name}</b>
      </>
    );
  }

  return (
    <Link
      ref={barRef}
      href="/cart"
      className="group sticky top-0 z-40 block w-full overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${lightenAccent(trackBg)}1a, transparent), ${trackBg}`,
        boxShadow:
          "inset 0 -1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}
      aria-label="Mystery gift progress"
    >
      {/* Progress fill — the right edge fades into the track so it reads as one
          continuous, glowing bar rather than two divided blocks. */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-700 ease-out"
        style={{
          width: `${segPct}%`,
          background: `linear-gradient(90deg, ${fillFrom} 0%, ${fillTo} 70%, ${fillTo}00 100%)`,
        }}
      >
        {/* glossy top sheen for depth */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.22), transparent)",
          }}
        />
        {/* soft glow pooled at the leading edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16"
          style={{
            background:
              "radial-gradient(60% 80% at 100% 50%, rgba(255,255,255,0.35), transparent 70%)",
          }}
        />
        {/* travelling sheen */}
        <span
          aria-hidden
          className="mgift-bar-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
          }}
        />
      </div>

      {/* Content (centered) */}
      <div
        className="relative z-10 flex items-center justify-center gap-2.5 px-9 py-2.5 text-center text-white"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
      >
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
          {icon}
        </span>
        <p className="text-[11px] font-semibold leading-tight tracking-tight sm:text-xs">
          {message}
        </p>
      </div>
    </Link>
  );
}
