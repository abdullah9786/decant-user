"use client";

import { useEffect } from "react";

interface Props {
  influencerId: string;
  username: string;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export default function StorefrontReferral({ influencerId, username }: Props) {
  useEffect(() => {
    try {
      const hasRefParam = new URLSearchParams(window.location.search).has("ref");

      const existing = localStorage.getItem("decume-ref");
      if (existing) {
        const ref = JSON.parse(existing);
        const isExpired = Date.now() - ref.timestamp > SEVEN_DAYS;

        if (!isExpired && !hasRefParam) {
          return;
        }
      }

      localStorage.setItem(
        "decume-ref",
        JSON.stringify({
          influencer_id: influencerId,
          username,
          timestamp: Date.now(),
        })
      );
    } catch {
      // localStorage may be unavailable in some contexts
    }
  }, [influencerId, username]);

  return null;
}
