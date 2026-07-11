"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import DealCountdown from "@/components/deal/DealCountdown";
import { deepenAccent } from "@/components/deal/constants";
import type { HomeOffer } from "@/lib/homeOffers";

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
};

export default function DailyDealOfferCard({ offer, expanded = false }: Props) {
  const accent = offer.display?.accent_color?.trim() || "#dc2626";
  const deepAccent = deepenAccent(accent);
  const discount = Number(offer.config?.discount_percent) || 0;
  const productCount = ((offer.config?.product_ids as string[]) || []).filter(Boolean).length;

  const title = offer.display?.headline?.trim() || offer.name?.trim() || "Decume Daily";
  const subtitle =
    offer.display?.subheadline?.trim() ||
    (discount > 0 ? `${discount}% off — today only` : "Limited-time picks at special prices");
  const ctaLabel = offer.display?.cta_label?.trim() || "Shop today's deal";
  const ctaHref = offer.display?.cta_href?.trim() || "/deals/today";
  const marquee = offer.display?.marquee_text?.trim() || "";

  return (
    <article
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: `${deepAccent}33` }}
    >
      <div
        className="border-b border-white/10 px-4 py-2.5 text-white sm:px-5"
        style={{ backgroundColor: deepAccent }}
      >
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 line-clamp-2">
          <Flame size={13} className="shrink-0" />
          {marquee || "Decume Daily — limited window"}
        </p>
      </div>

      <div
        className="relative flex flex-1 flex-col bg-gradient-to-br from-white via-white to-red-50/30 p-5 md:p-6"
        style={{ color: deepAccent }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
          style={{ backgroundColor: `${accent}22` }}
        />

        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full ring-1"
          style={{ backgroundColor: `${accent}18`, color: deepAccent, borderColor: `${accent}33` }}
        >
          <Sparkles size={20} strokeWidth={1.75} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-80">
          Today&apos;s drop
        </p>
        <h2
          className={`mt-2 font-serif text-emerald-950 ${
            expanded ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-2 text-sm leading-relaxed text-slate-600 ${
            expanded ? "max-w-lg" : "line-clamp-3"
          }`}
        >
          {subtitle}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {discount > 0 ? (
            <span
              className="rounded-full border px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: deepAccent, borderColor: `${deepAccent}88` }}
            >
              Up to {discount}% off
            </span>
          ) : null}
          {productCount > 0 ? (
            <span className="rounded-full border border-emerald-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
              {productCount} deal {productCount === 1 ? "product" : "products"}
            </span>
          ) : null}
        </div>

        {offer.ends_at ? (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Ends in
            </p>
            <DealCountdown
              endsAt={offer.ends_at}
              compact
              className="mt-1 text-sm font-semibold text-emerald-950"
            />
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          <Link
            href={ctaHref}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: deepAccent }}
          >
            {ctaLabel}
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
