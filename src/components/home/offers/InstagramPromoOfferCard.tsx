import Link from "next/link";
import { ArrowRight, Instagram, Gift, Video } from "lucide-react";
import type { HomeOffer } from "@/lib/homeOffers";
import { buildInstagramPromoCopy, getInstagramPromoPrizes } from "@/lib/instagramPromo";
import {
  offerCardArticleClass,
  offerCardBodyClass,
  offerCardChipClass,
  offerCardEyebrowClass,
  offerCardPrimaryCtaClass,
  offerCardSecondaryLinkClass,
  offerCardTitleClass,
} from "./offerCardShared";

const STEPS = [
  { icon: Gift, label: "Order during the promo" },
  { icon: Video, label: "Post after delivery" },
  { icon: Instagram, label: "Submit your reel link" },
];

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
  compact?: boolean;
};

export default function InstagramPromoOfferCard({
  offer,
  expanded = false,
  compact = false,
}: Props) {
  const title = offer.name?.trim() || "Win a Free Decant on Instagram";
  const description = buildInstagramPromoCopy(offer);
  const tagline = offer.display?.checkout_label?.trim() || "";
  const prizes = getInstagramPromoPrizes(offer).slice(0, expanded ? 5 : 2);

  if (compact) {
    return (
      <article
        className={offerCardArticleClass(
          "flex flex-col border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40",
        )}
      >
        {tagline ? (
          <div className="border-b border-white/10 bg-[image:var(--accent-gradient)] px-4 py-1.5">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent-muted)] line-clamp-1">
              <Instagram size={11} className="shrink-0 text-white" />
              {tagline}
            </p>
          </div>
        ) : null}

        <div className={offerCardBodyClass}>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
              <Instagram size={17} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className={`${offerCardEyebrowClass} text-emerald-700`}>Instagram promo</p>
              <h2 className={`${offerCardTitleClass(expanded)} text-emerald-950`}>{title}</h2>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className={`${offerCardChipClass} border-emerald-200/80 bg-white/80 text-emerald-800`}>
              Order · Post · Submit
            </span>
            {prizes.map((label) => (
              <span
                key={label}
                className={`${offerCardChipClass} border-emerald-200/80 bg-white/80 text-emerald-800`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-2 pt-3">
            <Link
              href="/products"
              className={`${offerCardPrimaryCtaClass} border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50`}
            >
              Shop & qualify
            </Link>
            <Link
              href="/instagram-promo/how-to-enter"
              className={`${offerCardSecondaryLinkClass} text-emerald-800 border-emerald-600/50 hover:text-emerald-950`}
            >
              How to enter
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 shadow-sm">
      {tagline ? (
        <div className="border-b border-white/10 bg-[image:var(--accent-gradient)] px-4 py-2.5 text-[color:var(--accent-text)] sm:px-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--accent-muted)] line-clamp-2">
            <Instagram size={13} className="shrink-0 text-white" />
            {tagline}
          </p>
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl"
        />

        <div className="relative flex flex-1 flex-col">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-700">
            <Instagram size={13} />
            Live giveaway
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
              expanded ? "max-w-2xl" : "line-clamp-4"
            }`}
          >
            {description}
          </p>

          {expanded ? (
            <ul className="mt-4 space-y-2">
              {STEPS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-emerald-950/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon size={13} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {STEPS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-emerald-800"
                >
                  <Icon size={11} />
                  {label}
                </span>
              ))}
            </div>
          )}

          {prizes.length > 0 && (
            <p className="mt-3 text-xs font-medium text-emerald-800/80">
              Prizes: {prizes.join(" · ")}
            </p>
          )}

          <div className="mt-auto space-y-2 pt-5">
            <Link
              href="/products"
              className="block w-full rounded-lg border border-emerald-200/80 bg-white py-3 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-950 transition-colors hover:bg-emerald-50"
            >
              Shop & qualify
            </Link>
            <div className="text-center">
              <Link
                href="/instagram-promo/how-to-enter"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950 hover:border-emerald-800 transition-colors"
              >
                {expanded ? "Read full details" : "How to enter"}
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
