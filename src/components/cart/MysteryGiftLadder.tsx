"use client";

import { Gift, Sparkles, Trophy, Lock, Check } from "lucide-react";
import {
  DEFAULT_ACCENT,
  tierIcon,
  formatINR,
  useMysteryGiftOffer,
  resolveTierProgress,
} from "@/lib/mysteryGift";

export default function MysteryGiftLadder({ subtotal }: { subtotal: number }) {
  const { offer, tiers } = useMysteryGiftOffer();

  if (!offer || tiers.length === 0) return null;

  const { unlockedIdx, unlockedTier, nextTier, topThreshold, fillPct, remaining } =
    resolveTierProgress(tiers, subtotal);

  const title = offer?.display?.title_gift || "Unlock a Mystery Gift";
  const lockedPromptTpl =
    offer?.display?.locked_prompt || "Spend {remaining} more to unlock {next}";

  const nudge = nextTier
    ? lockedPromptTpl
        .replace("{remaining}", formatINR(remaining))
        .replace("{next}", nextTier.name || "the next tier")
    : null;

  const headerAccent = unlockedTier?.accent_color || nextTier?.accent_color || DEFAULT_ACCENT;

  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-2.5 text-white"
        style={{
          background: `linear-gradient(120deg, ${headerAccent}, ${headerAccent}cc)`,
        }}
      >
        <Gift size={18} />
        <div>
          <p className="text-sm font-bold leading-tight">{title}</p>
          {unlockedTier ? (
            <p className="text-[11px] opacity-90 leading-tight mt-0.5">
              {nextTier
                ? `You'll get: ${unlockedTier.name}`
                : `You'll get: ${unlockedTier.name} - our top gift!`}
            </p>
          ) : (
            <p className="text-[11px] opacity-90 leading-tight mt-0.5">
              Add more to unlock a free surprise
            </p>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress track with tier nodes */}
        <div className="pt-3">
          <div className="relative h-2 rounded-full bg-emerald-900/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, ${tiers[0].accent_color || DEFAULT_ACCENT}, ${headerAccent})`,
              }}
            />
            {tiers.map((t) => {
              const pos = Math.min(100, (Number(t.min_subtotal) / topThreshold) * 100);
              const reached = subtotal >= Number(t.min_subtotal);
              const accent = t.accent_color || DEFAULT_ACCENT;
              return (
                <div
                  key={t.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2"
                  style={{ left: `${pos}%` }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      background: reached ? accent : "#fff",
                      borderColor: reached ? accent : "rgba(6,78,59,0.2)",
                      boxShadow: reached ? `0 0 0 4px ${accent}33` : "none",
                    }}
                  >
                    {reached && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All tiers - only the top unlocked is the awarded gift */}
        <div className="space-y-2.5">
          {tiers.map((t, i) => {
            const Icon = tierIcon(t.icon);
            const reached = subtotal >= Number(t.min_subtotal);
            const isAwarded = i === unlockedIdx;
            const isPassed = reached && !isAwarded;
            const accent = t.accent_color || DEFAULT_ACCENT;
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border p-3 transition-all"
                style={{
                  borderColor: isAwarded ? accent : "rgba(6,78,59,0.1)",
                  background: isAwarded ? `${accent}0f` : "transparent",
                  opacity: isAwarded ? 1 : isPassed ? 0.7 : 0.6,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isAwarded
                      ? accent
                      : isPassed
                        ? "rgba(6,78,59,0.1)"
                        : "rgba(6,78,59,0.06)",
                    color: isAwarded ? "#fff" : "rgba(6,78,59,0.45)",
                    boxShadow: isAwarded ? `0 0 16px ${accent}66` : "none",
                  }}
                >
                  {isAwarded ? (
                    <Icon size={18} />
                  ) : isPassed ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <Lock size={15} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="font-serif text-[15px] leading-tight truncate"
                      style={{ color: isAwarded ? accent : "#064e3b" }}
                    >
                      {t.name || `Tier ${i + 1}`}
                    </p>
                    {isAwarded && (
                      <span
                        className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ background: accent }}
                      >
                        Your gift
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0 bg-emerald-900/10 text-emerald-900/55">
                        Passed
                      </span>
                    )}
                  </div>
                  {t.tagline ? (
                    <p className="text-[11px] text-emerald-950/50 truncate mt-0.5">{t.tagline}</p>
                  ) : null}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-950/40 font-bold">
                    {reached ? "Reached at" : "Unlock at"}
                  </p>
                  <p className="text-sm font-bold text-emerald-950">
                    {formatINR(Number(t.min_subtotal))}
                  </p>
                </div>
              </div>
            );
          })}
          <p className="text-[10.5px] text-emerald-950/50 flex items-center gap-1.5 pt-0.5">
            <Sparkles size={11} className="flex-shrink-0" />
            You receive only your highest unlocked tier - 1 gift per order
          </p>
        </div>

        {/* Nudge */}
        {nudge && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/70 px-4 py-3">
            <Sparkles size={15} className="text-emerald-700 flex-shrink-0" />
            <p className="text-[12px] font-semibold text-emerald-900">{nudge}</p>
          </div>
        )}
        {!nextTier && unlockedTier && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/70 px-4 py-3">
            <Trophy size={15} className="text-emerald-700 flex-shrink-0" />
            <p className="text-[12px] font-semibold text-emerald-900">
              You&apos;ve unlocked our top mystery gift. It ships free with your order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
