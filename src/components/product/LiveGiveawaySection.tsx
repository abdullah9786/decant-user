"use client";

import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Instagram,
  ShoppingBag,
  Video,
} from "lucide-react";
import {
  buildInstagramPromoCopy,
  formatPromoEndDate,
  getInstagramPromoPrizes,
} from "@/lib/instagramPromo";
import { useInstagramPromoOffer } from "@/lib/useInstagramPromoOffer";

const PDP_STEPS = [
  {
    icon: ShoppingBag,
    label: "Order & opt in",
    title: "Order & opt in",
    body: "Add this scent to cart and tick the Instagram promo opt-in at checkout.",
  },
  {
    icon: Video,
    label: "Post after delivery",
    title: "Post after delivery",
    body: "Share a short video about Decume on Instagram once your order arrives.",
  },
  {
    icon: Instagram,
    label: "Submit entry",
    title: "Submit your entry",
    body: "Paste your reel link on our submission page for a chance to win.",
  },
] as const;

type LiveGiveawaySectionProps = {
  productName?: string;
};

export default function LiveGiveawaySection({ productName }: LiveGiveawaySectionProps) {
  const { offer, loading } = useInstagramPromoOffer();

  if (loading || !offer) return null;

  const title = offer.name?.trim() || "Win a Free Decant on Instagram";
  const tagline = offer.display?.checkout_label?.trim();
  const description = buildInstagramPromoCopy(offer);
  const prizes = getInstagramPromoPrizes(offer);
  const promoEnds = formatPromoEndDate(offer.ends_at);

  const hook = productName
    ? `Order ${productName} while this promo is live, opt in at checkout, then post on Instagram after delivery.`
    : "Order while this promo is live, opt in at checkout, then post on Instagram after delivery.";

  return (
    <section
      className="border-t border-emerald-100 bg-white py-6 md:py-12"
      aria-label="Live giveaway"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 hidden h-48 w-48 rounded-full bg-emerald-50 md:block"
          />

          <div className="relative border-b border-emerald-100 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-4 py-4 text-white md:px-8 md:py-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-200/90 md:gap-2 md:text-[10px] md:tracking-[0.35em]">
                  <Instagram size={13} className="shrink-0 md:hidden" />
                  <Instagram size={14} className="hidden shrink-0 md:block" />
                  Live giveaway
                </p>
                <h2 className="mt-1.5 font-serif text-xl leading-snug text-white md:mt-2 md:text-3xl md:leading-tight">
                  {title}
                </h2>
                {tagline ? (
                  <p className="mt-1.5 hidden max-w-2xl text-sm leading-relaxed text-emerald-100/85 md:block">
                    {tagline}
                  </p>
                ) : null}
              </div>
              {promoEnds ? (
                <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-100 md:px-3 md:py-1.5 md:text-[10px] md:tracking-widest">
                  Ends {promoEnds}
                </span>
              ) : null}
            </div>
          </div>

          <div className="relative grid gap-5 p-4 md:gap-8 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <p className="text-[13px] leading-snug text-emerald-950 md:text-sm md:leading-relaxed">
                {hook}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5 lg:hidden">
                {PDP_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <span
                      key={step.label}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2 py-1 text-[10px] font-medium text-emerald-800"
                    >
                      <Icon size={10} strokeWidth={1.75} />
                      {step.label}
                    </span>
                  );
                })}
              </div>

              <p className="mt-3 hidden text-sm leading-relaxed text-slate-600 md:block">
                {description}
              </p>

              {prizes.length > 0 ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-1.5 md:hidden">
                    {prizes.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white px-2 py-1 text-[10px] font-medium text-emerald-800"
                      >
                        <Gift size={10} strokeWidth={1.75} />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 hidden md:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      What you can win
                    </p>
                    <ul className="mt-3 space-y-2">
                      {prizes.map((label) => (
                        <li
                          key={label}
                          className="flex items-start gap-2.5 text-sm text-emerald-950"
                        >
                          <Gift
                            size={15}
                            className="mt-0.5 shrink-0 text-emerald-600"
                            strokeWidth={1.75}
                          />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}

              <div className="mt-4 flex flex-col gap-2 md:mt-6 md:flex-row md:flex-wrap md:gap-3">
                <Link
                  href="/instagram-promo/how-to-enter"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-950 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-emerald-900 md:px-5 md:py-3"
                >
                  How to enter
                  <ArrowRight size={12} />
                </Link>
                <Link
                  href="/instagram-promo"
                  className="inline-flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 underline decoration-emerald-300 underline-offset-2 transition-colors hover:text-emerald-950 md:rounded-lg md:border md:border-emerald-200 md:bg-white md:px-5 md:py-3 md:no-underline md:text-emerald-800 md:hover:bg-emerald-50"
                >
                  Check promo status
                </Link>
              </div>
            </div>

            <div className="hidden rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 md:p-6 lg:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Three simple steps
              </p>
              <ol className="mt-4 space-y-4">
                {PDP_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100">
                        <Icon size={14} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-emerald-950">
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 border-t border-emerald-100 pt-4 text-[11px] leading-relaxed text-slate-500">
                Opt in at checkout so your order qualifies. See full rules on the
                how-to-enter page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
