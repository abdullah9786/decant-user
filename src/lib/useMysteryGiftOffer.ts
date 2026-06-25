"use client";

import { useEffect, useMemo, useState } from "react";
import { offerApi } from "@/lib/api";
import type { MysteryTier } from "@/lib/mysteryGift";

export function useMysteryGiftOffer() {
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
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

  return { offer, tiers, loading };
}
