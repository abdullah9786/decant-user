import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import type { HomeOffer } from "@/lib/homeOffers";

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
};

export default function FreeDecantOfferCard({ offer, expanded = false }: Props) {
  const title = offer.display?.title?.trim() || offer.name?.trim() || "Free Decant";
  const subtitle =
    offer.display?.subtitle?.trim() ||
    "Pick a complimentary decant when your order qualifies.";
  const banner = offer.display?.banner_text?.trim() || "";

  const minMl = Number(offer.config?.min_qualifying_ml) || 10;
  const freeMl = Number(offer.config?.free_size_ml) || 2;
  const maxFree = offer.config?.max_free_per_order as number | null | undefined;

  return (
    <article className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 shadow-sm">
      {banner ? (
        <div className="border-b border-white/10 bg-[image:var(--accent-gradient)] px-4 py-2.5 text-[color:var(--accent-text)] sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--accent-muted)] line-clamp-2">
            {banner}
          </p>
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
        >
          <Gift size={20} strokeWidth={1.75} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-700">
          Cart perk
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

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
            {minMl}ml+ qualifies
          </span>
          <span className="rounded-full border border-emerald-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
            {freeMl}ml free
          </span>
          {maxFree != null && maxFree > 0 ? (
            <span className="rounded-full border border-emerald-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
              Up to {maxFree} per order
            </span>
          ) : null}
        </div>

        <div className="mt-auto space-y-2 pt-5">
          <Link
            href="/products?type=decant"
            className="block w-full rounded-lg border border-emerald-200/80 bg-white py-3 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-950 transition-colors hover:bg-emerald-50"
          >
            Shop decants
          </Link>
          <div className="text-center">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950 hover:border-emerald-800 transition-colors"
            >
              Pick your free decant in cart
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
