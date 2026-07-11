import type { InstagramPromoOffer } from "@/lib/server/offers";

export const INSTAGRAM_PROMO_STEPS = [
  {
    key: "order",
    title: "Place your order during the promo",
    body: "Shop on Decume while this Instagram promo is live. Opt in at checkout so your order qualifies.",
  },
  {
    key: "deliver",
    title: "Wait for delivery",
    body: "Once your order is marked delivered, you can post and submit your entry.",
  },
  {
    key: "post",
    title: "Post on Instagram",
    body: "Share a short video about Decume on Instagram — unboxing, review, styling, or anything you like — from a public account that meets the follower requirement.",
  },
  {
    key: "submit",
    title: "Submit your reel link",
    body: "Open the submission page, paste your Instagram post or reel URL, and enter the account that posted it. We review every entry after you submit.",
  },
] as const;

export const INSTAGRAM_PROMO_SUBMIT_PATHS = [
  {
    key: "orders",
    title: "From My Orders",
    body: "Once your order is delivered, go to My Orders, open the order, and tap the Instagram promo link. It opens the submission form with your order ID ready.",
    href: "/orders",
    hrefLabel: "Go to My Orders",
  },
  {
    key: "email",
    title: "From your delivery email",
    body: "When your order is marked delivered, we email you a promo invite with a Submit Promo Video button. Tap it to open the same submission page — no need to hunt for your order ID.",
  },
] as const;

export function buildInstagramPromoCopy(offer: InstagramPromoOffer): string {
  const days = Number(offer.config?.submission_deadline_days) || 14;
  const mention = String(offer.config?.required_mention || "").trim();
  const tags = (offer.config?.required_hashtags || []).filter(Boolean).join(" ");

  let copy =
    offer.display?.rules_copy?.trim() ||
    `Order while this promo is live, then post a video about Decume on Instagram within ${days} days of delivery to enter our draw for a free decant.`;

  if (!offer.display?.rules_copy?.trim() && (mention || tags)) {
    copy += " Remember to";
    if (mention) copy += ` mention ${mention}`;
    if (mention && tags) copy += " and";
    if (tags) copy += ` use ${tags}`;
    copy += ".";
  }

  return copy;
}

export function getInstagramPromoPrizes(offer: InstagramPromoOffer): string[] {
  return (offer.config?.prize_templates || [])
    .map((t) => t.label?.trim())
    .filter(Boolean) as string[];
}

export function formatPromoEndDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = !iso.endsWith("Z") && !iso.includes("+") ? new Date(iso + "Z") : new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
