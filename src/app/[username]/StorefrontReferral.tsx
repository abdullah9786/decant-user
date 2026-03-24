"use client";

import { useEffect } from "react";

interface Props {
  influencerId: string;
  username: string;
}

export default function StorefrontReferral({ influencerId, username }: Props) {
  useEffect(() => {
    try {
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
