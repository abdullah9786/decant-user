import type { HomeOffer } from "@/lib/homeOffers";
import MysteryGiftOfferCard from "./MysteryGiftOfferCard";
import InstagramPromoOfferCard from "./InstagramPromoOfferCard";
import FreeDecantOfferCard from "./FreeDecantOfferCard";
import DailyDealOfferCard from "./DailyDealOfferCard";
import GenericOfferCard from "./GenericOfferCard";

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
};

export default function HomeOfferCard({ offer, expanded = false }: Props) {
  switch (offer.type) {
    case "daily_deal":
      return <DailyDealOfferCard offer={offer} expanded={expanded} />;
    case "mystery_gift":
      return <MysteryGiftOfferCard offer={offer} expanded={expanded} />;
    case "instagram_promo":
      return <InstagramPromoOfferCard offer={offer} expanded={expanded} />;
    case "free_decant":
      return <FreeDecantOfferCard offer={offer} expanded={expanded} />;
    default:
      return <GenericOfferCard offer={offer} expanded={expanded} />;
  }
}
