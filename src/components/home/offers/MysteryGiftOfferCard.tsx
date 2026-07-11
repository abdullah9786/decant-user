import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { DEFAULT_ACCENT, formatINR } from "@/lib/mysteryGift";
import {
  getMysteryTiers,
  mysteryGiftAccent,
  mysteryGiftHook,
  mysteryGiftTitle,
} from "./mysteryGiftShared";
import {
  offerCardArticleClass,
  offerCardBodyClass,
  offerCardChipClass,
  offerCardEyebrowClass,
  offerCardPrimaryCtaClass,
  offerCardTitleClass,
} from "./offerCardShared";

type Props = {
  offer: any;
  expanded?: boolean;
  compact?: boolean;
};

export default function MysteryGiftOfferCard({
  offer,
  expanded = false,
  compact = false,
}: Props) {
  const tiers = getMysteryTiers(offer);
  if (!offer || tiers.length === 0) return null;

  const title = mysteryGiftTitle(offer);
  const accent = mysteryGiftAccent(offer, tiers);
  const hook = mysteryGiftHook(offer, tiers);

  if (compact) {
    const tierChips = tiers.slice(0, expanded ? tiers.length : 2);
    return (
      <article
        className={offerCardArticleClass(
          "border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)]",
        )}
      >
        <div className={offerCardBodyClass}>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <Gift size={17} className="text-white" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className={`${offerCardEyebrowClass} text-[color:var(--accent-muted)]`}>
                Mystery gift
              </p>
              <h2 className={`${offerCardTitleClass(expanded)} text-white`}>{title}</h2>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tierChips.map((t, i) => {
              const dot = t.accent_color || DEFAULT_ACCENT;
              return (
                <span
                  key={t.id}
                  className={`${offerCardChipClass} border-white/20 bg-white/10 text-white/90`}
                >
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={{ background: dot }}
                  />
                  {t.name || `Tier ${i + 1}`} · {formatINR(Number(t.min_subtotal))}
                </span>
              );
            })}
            {!expanded && tiers.length > 2 ? (
              <span className={`${offerCardChipClass} border-white/20 bg-white/10 text-white/70`}>
                +{tiers.length - 2} more
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-[color:var(--accent-muted)] line-clamp-2">
            {hook}
          </p>

          <div className="mt-auto pt-2">
            <Link
              href="/products"
              className={`${offerCardPrimaryCtaClass} w-full bg-white text-emerald-950 hover:bg-emerald-50`}
            >
              Shop to unlock
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_-20%,_rgba(255,255,255,0.16)_0%,_transparent_55%)]"
      />

      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-1 flex-col">
          <div
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"
            style={{ color: accent }}
          >
            <Gift size={20} className="text-white" strokeWidth={1.75} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[color:var(--accent-muted)]">
            The Decume Rewards
          </p>
          <h2
            className={`mt-2 font-serif leading-tight text-white ${
              expanded ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-2 text-sm leading-relaxed text-[color:var(--accent-muted)] ${
              expanded ? "max-w-lg" : "line-clamp-3"
            }`}
          >
            Reach a spending milestone and a hand-picked mystery decant slips into
            your parcel — our quiet thank you for exploring more.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {tiers.slice(0, expanded ? tiers.length : 3).map((t, i) => {
              const dot = t.accent_color || DEFAULT_ACCENT;
              return (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 text-[11px] md:text-xs"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
                  />
                  <span className="font-medium text-white/90">
                    {t.name || `Tier ${i + 1}`}
                  </span>
                  <span className="text-white/45">{formatINR(Number(t.min_subtotal))}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-auto pt-5">
            <Link
              href="/products"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-950 transition-all hover:shadow-lg sm:w-auto"
            >
              Start unlocking
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] sm:text-left">
              One gift per order
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
