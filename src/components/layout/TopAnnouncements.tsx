"use client";

import { useState } from "react";
import type { InstagramPromoOffer } from "@/lib/server/offers";
import MysteryGiftBar from "@/components/cart/MysteryGiftBar";
import InstagramPromoBanner from "@/components/promo/InstagramPromoBanner";

type TopAnnouncementsProps = {
  instagramPromo: InstagramPromoOffer | null;
};

export default function TopAnnouncements({ instagramPromo }: TopAnnouncementsProps) {
  const instaActive = !!instagramPromo;
  const [instaVisible, setInstaVisible] = useState(instaActive);

  return (
    <>
      <MysteryGiftBar
        instaPromoActive={instaActive}
        instaPromoVisible={instaVisible}
      />
      <InstagramPromoBanner
        offer={instagramPromo}
        onVisibilityChange={setInstaVisible}
      />
    </>
  );
}
