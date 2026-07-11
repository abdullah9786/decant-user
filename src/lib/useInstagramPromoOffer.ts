"use client";

import { useEffect, useState } from "react";
import { offerApi } from "@/lib/api";
import type { InstagramPromoOffer } from "@/lib/server/offers";

export function useInstagramPromoOffer() {
  const [offer, setOffer] = useState<InstagramPromoOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    offerApi
      .getActive()
      .then((res) => {
        if (!alive) return;
        const promo = (res.data || []).find(
          (o: InstagramPromoOffer) => o.type === "instagram_promo" && o.is_active,
        );
        setOffer(promo || null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { offer, loading };
}
