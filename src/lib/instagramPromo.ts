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
    body: "Share a short unboxing or review video on Instagram from a public account that meets the follower requirement.",
  },
  {
    key: "submit",
    title: "Submit your reel link",
    body: "Come back to Decume with your order ID and paste your Instagram post or reel URL for review.",
  },
] as const;

export function buildInstagramPromoCopy(offer: InstagramPromoOffer): string {
  const days = Number(offer.config?.submission_deadline_days) || 14;
  const mention = String(offer.config?.required_mention || "").trim();
  const tags = (offer.config?.required_hashtags || []).filter(Boolean).join(" ");

  let copy =
    offer.display?.rules_copy?.trim() ||
    `Order while this promo is live, then post your unboxing on Instagram within ${days} days of delivery to enter our draw for a free decant.`;

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
