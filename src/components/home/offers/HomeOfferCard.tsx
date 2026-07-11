import type { HomeOffer } from "@/lib/homeOffers";
import MysteryGiftOfferCard from "./MysteryGiftOfferCard";
import InstagramPromoOfferCard from "./InstagramPromoOfferCard";
import FreeDecantOfferCard from "./FreeDecantOfferCard";
import DailyDealOfferCard from "./DailyDealOfferCard";
import GenericOfferCard from "./GenericOfferCard";

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
  compact?: boolean;
};

export default function HomeOfferCard({ offer, expanded = false, compact = false }: Props) {
  switch (offer.type) {
    case "daily_deal":
      return <DailyDealOfferCard offer={offer} expanded={expanded} compact={compact} />;
    case "mystery_gift":
      return <MysteryGiftOfferCard offer={offer} expanded={expanded} compact={compact} />;
    case "instagram_promo":
      return <InstagramPromoOfferCard offer={offer} expanded={expanded} compact={compact} />;
    case "free_decant":
      return <FreeDecantOfferCard offer={offer} expanded={expanded} compact={compact} />;
    default:
      return <GenericOfferCard offer={offer} expanded={expanded} compact={compact} />;
  }
}
