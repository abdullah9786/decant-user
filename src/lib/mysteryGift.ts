"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Sparkles,
  Crown,
  Gem,
  Star,
  Award,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { offerApi } from "@/lib/api";

export interface MysteryTier {
  id: string;
  name: string;
  min_subtotal: number;
  accent_color?: string;
  icon?: string;
  tagline?: string;
}

export const ICONS: Record<string, LucideIcon> = {
  gift: Gift,
  sparkles: Sparkles,
  crown: Crown,
  gem: Gem,
  star: Star,
  award: Award,
  trophy: Trophy,
};

export const DEFAULT_ACCENT = "#7c3aed";

export function tierIcon(name?: string): LucideIcon {
  return ICONS[(name || "").toLowerCase()] || Gift;
}

export function formatINR(n: number): string {
  return `\u20b9${Math.round(n).toLocaleString("en-IN")}`;
}

export function useMysteryGiftOffer() {
  const [offer, setOffer] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    offerApi
      .getActive()
      .then((res) => {
        if (!alive) return;
        const mg = (res.data || []).find(
          (o: any) => o.type === "mystery_gift" && o.is_active,
        );
        setOffer(mg || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const tiers: MysteryTier[] = useMemo(() => {
    const raw: MysteryTier[] = offer?.config?.tiers || [];
    return [...raw]
      .filter((t) => Number(t?.min_subtotal) > 0)
      .sort((a, b) => Number(a.min_subtotal) - Number(b.min_subtotal));
  }, [offer]);

  return { offer, tiers };
}

export interface TierProgress {
  unlockedIdx: number;
  unlockedTier: MysteryTier | null;
  nextTier: MysteryTier | null;
  topThreshold: number;
  fillPct: number;
  remaining: number;
}

export function resolveTierProgress(
  tiers: MysteryTier[],
  subtotal: number,
): TierProgress {
  if (tiers.length === 0) {
    return {
      unlockedIdx: -1,
      unlockedTier: null,
      nextTier: null,
      topThreshold: 0,
      fillPct: 0,
      remaining: 0,
    };
  }

  const topThreshold = Number(tiers[tiers.length - 1].min_subtotal);
  const unlockedIdx = tiers.reduce(
    (acc, t, i) => (subtotal >= Number(t.min_subtotal) ? i : acc),
    -1,
  );
  const unlockedTier = unlockedIdx >= 0 ? tiers[unlockedIdx] : null;
  const nextTier =
    unlockedIdx + 1 < tiers.length ? tiers[unlockedIdx + 1] : null;

  const fillPct =
    topThreshold > 0 ? Math.min(100, (subtotal / topThreshold) * 100) : 0;
  const remaining = nextTier
    ? Math.max(0, Number(nextTier.min_subtotal) - subtotal)
    : 0;

  return {
    unlockedIdx,
    unlockedTier,
    nextTier,
    topThreshold,
    fillPct,
    remaining,
  };
}
