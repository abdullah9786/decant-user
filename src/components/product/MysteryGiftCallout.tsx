"use client";

import { Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import {
  DEFAULT_ACCENT,
  tierIcon,
  formatINR,
  resolveTierProgress,
} from "@/lib/mysteryGift";
import { useMysteryGiftOffer } from "@/lib/useMysteryGiftOffer";

export default function MysteryGiftCallout() {
  const { offer, tiers } = useMysteryGiftOffer();
  const subtotal = useCartStore((s) => s.totalPrice());

  if (!offer || tiers.length === 0) return null;

  const { unlockedTier, nextTier, remaining } = resolveTierProgress(
    tiers,
    subtotal,
  );

  const accent =
    unlockedTier?.accent_color || nextTier?.accent_color || DEFAULT_ACCENT;
  const Icon = tierIcon((unlockedTier || nextTier)?.icon);
  const isUnlocked = !!unlockedTier;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-3.5"
      style={{
        borderColor: `${accent}${isUnlocked ? "59" : "33"}`,
        background: `${accent}${isUnlocked ? "12" : "0a"}`,
      }}
    >
      <span
        className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: accent, boxShadow: `0 4px 12px ${accent}40` }}
      >
        <Icon size={16} />
        {isUnlocked && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white"
            style={{ color: accent }}
          >
            <Check size={11} strokeWidth={3.5} />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        {!isUnlocked && nextTier && (
          <p className="text-[12.5px] leading-snug text-emerald-950">
            Spend{" "}
            <span className="font-bold" style={{ color: accent }}>
              {formatINR(remaining)}
            </span>{" "}
            more to unlock{" "}
            <span className="font-semibold">{nextTier.name}</span> — a free
            mystery gift
          </p>
        )}

        {isUnlocked && nextTier && (
          <p className="text-[12.5px] leading-snug text-emerald-950">
            You&apos;ve unlocked{" "}
            <span className="font-bold" style={{ color: accent }}>
              {unlockedTier!.name}
            </span>
            . Spend{" "}
            <span className="font-bold" style={{ color: accent }}>
              {formatINR(remaining)}
            </span>{" "}
            more to upgrade to{" "}
            <span className="font-semibold">{nextTier.name}</span>.
          </p>
        )}

        {isUnlocked && !nextTier && (
          <p className="text-[12.5px] leading-snug text-emerald-950">
            You&apos;ve unlocked our top mystery gift —{" "}
            <span className="font-bold" style={{ color: accent }}>
              {unlockedTier!.name}
            </span>{" "}
            ships free with your order.
          </p>
        )}
      </div>
    </div>
  );
}
