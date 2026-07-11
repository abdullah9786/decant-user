import { CACHE_REVALIDATE_SECONDS } from "@/lib/cacheConfig";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type InstagramPromoOffer = {
  _id?: string;
  name?: string;
  type?: string;
  is_active?: boolean;
  ends_at?: string | null;
  display?: {
    checkout_label?: string;
    rules_copy?: string;
  };
  config?: {
    prize_templates?: { label?: string }[];
    submission_deadline_days?: number;
    min_followers?: number;
    required_mention?: string;
    required_hashtags?: string[];
    max_posts_per_poster_account?: number;
    poster_limit_window_days?: number;
  };
};

export async function fetchInstagramPromoSSR(): Promise<InstagramPromoOffer | null> {
  try {
    const res = await fetch(`${API_URL}/offers/active`, {
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (
      (data || []).find(
        (o: InstagramPromoOffer) => o.type === "instagram_promo" && o.is_active,
      ) || null
    );
  } catch {
    return null;
  }
}
