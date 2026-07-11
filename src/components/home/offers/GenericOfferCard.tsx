import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { HomeOffer } from "@/lib/homeOffers";
import { offerTypeLabel } from "@/lib/homeOffers";
import {
  offerCardArticleClass,
  offerCardBodyClass,
  offerCardEyebrowClass,
  offerCardPrimaryCtaClass,
  offerCardTitleClass,
} from "./offerCardShared";

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
  compact?: boolean;
};

export default function GenericOfferCard({
  offer,
  expanded = false,
  compact = false,
}: Props) {
  const title =
    offer.display?.title?.trim() ||
    offer.display?.headline?.trim() ||
    offer.name?.trim() ||
    offerTypeLabel(offer.type);
  const subtitle =
    offer.display?.subtitle?.trim() ||
    offer.display?.subheadline?.trim() ||
    offer.display?.rules_copy?.trim() ||
    "An active promotion is running now — see details on site.";

  if (compact) {
    return (
      <article
        className={offerCardArticleClass(
          "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40",
        )}
      >
        <div className={offerCardBodyClass}>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
              <Tag size={17} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className={`${offerCardEyebrowClass} text-emerald-700`}>
                {offerTypeLabel(offer.type)}
              </p>
              <h2 className={`${offerCardTitleClass(expanded)} text-emerald-950`}>{title}</h2>
            </div>
          </div>

          <div className="mt-auto pt-3">
            <Link
              href="/products"
              className={`${offerCardPrimaryCtaClass} w-full border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50`}
            >
              Shop now
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 shadow-sm">
      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
          <Tag size={20} strokeWidth={1.75} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-700">
          {offerTypeLabel(offer.type)}
        </p>
        <h2
          className={`mt-2 font-serif text-emerald-950 ${
            expanded ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-2 text-sm leading-relaxed text-emerald-900/75 ${
            expanded ? "max-w-lg" : "line-clamp-3"
          }`}
        >
          {subtitle}
        </p>

        <div className="mt-auto pt-5">
          <Link
            href="/products"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200/80 bg-white py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-950 transition-colors hover:bg-emerald-50"
          >
            Shop now
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
