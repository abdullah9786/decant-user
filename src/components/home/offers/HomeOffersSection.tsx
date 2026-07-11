import type { HomeOffer } from "@/lib/homeOffers";
import {
  filterHomeRewardsOffers,
  homeRewardsGridClass,
  offerId,
} from "@/lib/homeOffers";
import HomeOfferCard from "./HomeOfferCard";

type HomeOffersSectionProps = {
  offers: HomeOffer[];
};

export default function HomeOffersSection({ offers }: HomeOffersSectionProps) {
  const visible = filterHomeRewardsOffers(offers);
  if (visible.length === 0) return null;

  const single = visible.length === 1;

  return (
    <section className="py-8 md:py-12" aria-label="Rewards and giveaways">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 md:mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-700">
            Active offers
          </p>
          <h2 className="mt-1 font-serif text-2xl text-emerald-950 md:text-3xl">
            Rewards & giveaways
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            The best part? You can claim all our offers in a single order.
          </p>
        </div>

        <div className={homeRewardsGridClass(visible.length)}>
          {visible.map((offer) => (
            <HomeOfferCard
              key={offerId(offer)}
              offer={offer}
              expanded={single}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
