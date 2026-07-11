import { DEFAULT_ACCENT, type MysteryTier } from "@/lib/mysteryGift";

export function getMysteryTiers(offer: any): MysteryTier[] {
  return [...(offer?.config?.tiers || [])]
    .filter((t: MysteryTier) => Number(t?.min_subtotal) > 0)
    .sort((a, b) => Number(a.min_subtotal) - Number(b.min_subtotal));
}

export function mysteryGiftAccent(offer: any, tiers: MysteryTier[]): string {
  return (
    offer?.display?.box_color ||
    tiers[tiers.length - 1]?.accent_color ||
    DEFAULT_ACCENT
  );
}

export function mysteryGiftTitle(offer: any): string {
  return offer?.display?.title_gift || "Unlock a Mystery Gift";
}
