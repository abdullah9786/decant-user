"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Gift, PartyPopper, Trophy } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useMysteryGiftOffer } from "@/lib/useMysteryGiftOffer";
import { formatINR } from "@/lib/mysteryGift";
import { isDealChromeHidden } from "@/components/deal/constants";

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

  const segStart = unlockedTier ? Number(unlockedTier.min_subtotal) : 0;
  const segEnd = nextTier ? Number(nextTier.min_subtotal) : segStart;
  const segPct =
    nextTier && segEnd > segStart
      ? Math.min(100, Math.max(0, ((subtotal - segStart) / (segEnd - segStart)) * 100))
      : 100;
  const remaining = nextTier ? Math.max(0, segEnd - subtotal) : 0;

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
      className="group sticky top-0 z-40 block w-full border-b border-emerald-100/80 bg-white/95 backdrop-blur-sm"
      aria-label="Mystery gift progress"
    >
      <div className="relative flex items-center justify-center gap-2.5 px-4 py-2.5 text-center sm:px-9">
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          {icon}
        </span>
        <p className="text-[11px] font-medium leading-tight tracking-tight text-emerald-950 sm:text-xs">
          {message}
        </p>
      </div>

      {nextTier ? (
        <div
          className="h-0.5 w-full bg-emerald-100"
          role="progressbar"
          aria-valuenow={Math.round(segPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Mystery gift tier progress"
        >
          <div
            className="h-full bg-emerald-600 transition-[width] duration-700 ease-out"
            style={{ width: `${segPct}%` }}
          />
        </div>
      ) : null}
    </Link>
  );
}
