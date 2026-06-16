import type { DealDoc, DealProduct } from '@/components/deal/ActiveDealProvider';
import { CACHE_REVALIDATE_SECONDS } from '@/lib/cacheConfig';
import { DAILY_DEAL_CACHE_TAG } from '@/lib/cacheTags';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Server-side fetch for the currently active daily deal. Used by the root
 * layout to seed `ActiveDealProvider` so the banner + marquee render during
 * SSR — eliminating the ~1-2s "banner pops in" CLS.
 *
 * Cached for 24h with on-demand invalidation when admin saves an offer.
 * The provider still refetches on focus / visibility changes and on tick-zero.
 */
export async function fetchDailyDealSSR(): Promise<
  { deal: DealDoc; products: DealProduct[] } | null
> {
  try {
    const res = await fetch(`${API_URL}/offers/daily-deal/today`, {
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [DAILY_DEAL_CACHE_TAG],
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.deal) return null;
    return data as { deal: DealDoc; products: DealProduct[] };
  } catch {
    return null;
  }
}
