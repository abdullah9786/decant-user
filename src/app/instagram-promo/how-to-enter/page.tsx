import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Gift,
  Instagram,
  ShoppingBag,
  Video,
  CheckCircle2,
  Mail,
  ClipboardList,
} from "lucide-react";
import { fetchInstagramPromoSSR } from "@/lib/server/offers";
import {
  INSTAGRAM_PROMO_STEPS,
  INSTAGRAM_PROMO_SUBMIT_PATHS,
  buildInstagramPromoCopy,
  formatPromoEndDate,
  getInstagramPromoPrizes,
} from "@/lib/instagramPromo";

export const metadata: Metadata = {
  title: "How to Enter — Instagram Promo",
  description:
    "Learn how to enter the Decume Instagram promo — order, post your video, and submit for a chance to win a free decant.",
  alternates: { canonical: "https://decume.in/instagram-promo/how-to-enter" },
};

const STEP_ICONS = [ShoppingBag, Gift, Video, Instagram] as const;

export default async function InstagramPromoHowToEnterPage() {
  const offer = await fetchInstagramPromoSSR();
  if (!offer) notFound();

  const title = offer.name?.trim() || "Win a Free Decant on Instagram";
  const tagline = offer.display?.checkout_label?.trim();
  const overview = buildInstagramPromoCopy(offer);
  const prizes = getInstagramPromoPrizes(offer);
  const config = offer.config || {};

  const minFollowers = Number(config.min_followers) || 100;
  const deadlineDays = Number(config.submission_deadline_days) || 14;
  const maxPosts = Number(config.max_posts_per_poster_account) || 3;
  const windowDays = Number(config.poster_limit_window_days) || 30;
  const mention = String(config.required_mention || "").trim();
  const hashtags = (config.required_hashtags || []).filter(Boolean);
  const promoEnds = formatPromoEndDate(offer.ends_at);

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="border-b border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[color:var(--accent-muted)]">
            <Instagram size={14} />
            Instagram promo
          </p>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl text-white">{title}</h1>
          {tagline ? (
            <p className="mt-4 text-sm md:text-base leading-relaxed text-[color:var(--accent-muted)] max-w-2xl">
              {tagline}
            </p>
          ) : null}
          {promoEnds ? (
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/70">
              Orders must be placed before {promoEnds}
            </p>
          ) : null}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            About this offer
          </h2>
          <p className="text-[15px] text-gray-700 leading-relaxed">{overview}</p>
        </section>

        {prizes.length > 0 ? (
          <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              What you can win
            </h2>
            <ul className="space-y-3">
              {prizes.map((label) => (
                <li
                  key={label}
                  className="flex items-start gap-3 text-sm text-emerald-950"
                >
                  <Gift size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Approved prizes ship to your order delivery address, not the poster&apos;s address.
            </p>
          </section>
        ) : null}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
            How to enter
          </h2>
          <ol className="space-y-4">
            {INSTAGRAM_PROMO_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[index] || CheckCircle2;
              return (
                <li
                  key={step.key}
                  className="flex gap-4 bg-white border border-gray-100 shadow-sm p-5 md:p-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">
                      Step {index + 1}
                    </p>
                    <h3 className="font-serif text-lg text-emerald-950">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            How to submit your reel
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            After your video is live on Instagram, use either option below to reach the submission
            form. Paste your reel or post link, add the poster&apos;s username, and send it for
            review.
          </p>
          <div className="space-y-4">
            {INSTAGRAM_PROMO_SUBMIT_PATHS.map((path) => {
              const Icon = path.key === "email" ? Mail : ClipboardList;
              return (
                <div
                  key={path.key}
                  className="flex gap-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 ring-1 ring-emerald-200">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-emerald-950">{path.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{path.body}</p>
                    {"href" in path && path.href ? (
                      <Link
                        href={path.href}
                        className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950"
                      >
                        {path.hrefLabel}
                        <ArrowRight size={11} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Rules & eligibility
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Opt in at checkout while the promo is live on a qualifying order.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Post from a public Instagram account with at least {minFollowers} followers.
              </span>
            </li>
            {mention ? (
              <li className="flex gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Mention {mention} in your post.</span>
              </li>
            ) : null}
            {hashtags.length > 0 ? (
              <li className="flex gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Include {hashtags.join(", ")}.</span>
              </li>
            ) : null}
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Submit within {deadlineDays} days of delivery — via{" "}
                <Link href="/orders" className="text-emerald-700 hover:underline">
                  My Orders
                </Link>{" "}
                or the link in your delivery email.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Up to {maxPosts} entries per Instagram account every {windowDays} days (each must
                be a different post URL).
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>One submission per order. You or a friend can post — you submit the link.</span>
            </li>
          </ul>
        </section>

        <section className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-950 text-white py-4 px-6 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
          >
            Shop & qualify
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/instagram-promo"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-emerald-200 bg-white text-emerald-950 py-4 px-6 text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-colors"
          >
            Submit your entry
            <ArrowRight size={14} />
          </Link>
        </section>

        <p className="text-center text-xs text-gray-400 pb-8">
          Already placed an order?{" "}
          <Link href="/instagram-promo" className="text-emerald-700 hover:underline">
            Check status or submit your video
          </Link>
        </p>
      </div>
    </div>
  );
}
