import Link from "next/link";
import { ArrowRight, Instagram, Gift, Video } from "lucide-react";
import type { HomeOffer } from "@/lib/homeOffers";

function buildDefaultCopy(offer: HomeOffer): string {
  const days = Number(offer.config?.submission_deadline_days) || 14;
  const mention = String(offer.config?.required_mention || "").trim();
  const tags = ((offer.config?.required_hashtags as string[]) || []).filter(Boolean).join(" ");

  let copy =
    `Order while this promo is live, then post your unboxing on Instagram within ${days} days of delivery to enter our draw for a free decant.`;

  if (mention || tags) {
    copy += " Remember to";
    if (mention) copy += ` mention ${mention}`;
    if (mention && tags) copy += " and";
    if (tags) copy += ` use ${tags}`;
    copy += ".";
  }

  return copy;
}

const STEPS = [
  { icon: Gift, label: "Order during the promo" },
  { icon: Video, label: "Post after delivery" },
  { icon: Instagram, label: "Submit your reel link" },
];

type Props = {
  offer: HomeOffer;
  expanded?: boolean;
};

export default function InstagramPromoOfferCard({ offer, expanded = false }: Props) {
  const title = offer.name?.trim() || "Win a Free Decant on Instagram";
  const description = offer.display?.rules_copy?.trim() || buildDefaultCopy(offer);
  const tagline = offer.display?.checkout_label?.trim() || "";

  const prizes = ((offer.config?.prize_templates as { label?: string }[]) || [])
    .map((t) => t.label?.trim())
    .filter(Boolean)
    .slice(0, expanded ? 5 : 2);

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
                href="/instagram-promo"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950 hover:border-emerald-800 transition-colors"
              >
                {expanded ? "Already ordered? Enter or check your entry" : "How to enter"}
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
