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
    <section className="overflow-x-hidden py-8 md:overflow-visible md:py-12" aria-label="Rewards and giveaways">
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

        {/* Mobile — left aligns with content; right bleeds to page edge */}
        <div className="md:hidden carousel-clip -mr-4 w-[calc(100%+1rem)] sm:-mr-6 sm:w-[calc(100%+1.5rem)]">
          <div className="carousel-scroll flex items-stretch gap-3 snap-x snap-mandatory pl-0 pr-4 pb-5 -mb-5 sm:pr-6">
            {visible.map((offer) => (
              <div
                key={offerId(offer)}
                className={`h-full shrink-0 snap-start ${
                  single
                    ? "w-full"
                    : "w-[calc((100%-0.75rem)/1.08)] max-w-sm"
                }`}
              >
                <HomeOfferCard offer={offer} compact />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 md:hidden">
          Swipe for more offers →
        </p>

        {/* Desktop — original grid layout */}
        <div className={`hidden md:grid ${homeRewardsGridClass(visible.length)}`}>
          {visible.map((offer) => (
            <HomeOfferCard
              key={offerId(offer)}
              offer={offer}
              expanded={single}
              compact={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
