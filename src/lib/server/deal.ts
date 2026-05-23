import type { DealDoc, DealProduct } from '@/components/deal/ActiveDealProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Server-side fetch for the currently active daily deal. Used by the root
 * layout to seed `ActiveDealProvider` so the banner + marquee render during
 * SSR — eliminating the 1-2s "banner pops in and pushes content down" CLS
 * we were seeing.
 *
 * Cached for 60s via Next.js `revalidate` (ISR). The provider still refetches
 * on focus / visibility changes and on tick-zero, so editors flipping the
 * offer on/off in admin will still see updates within a minute.
 *
 * Returns null if the API is unreachable or no deal is active — callers
 * should treat this as "no deal" and render nothing.
 */
export async function fetchDailyDealSSR(): Promise<
  { deal: DealDoc; products: DealProduct[] } | null
> {
  try {
    const res = await fetch(`${API_URL}/offers/daily-deal/today`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.deal) return null;
    return data as { deal: DealDoc; products: DealProduct[] };
  } catch {
    // Backend unreachable during SSR (build time / network blip).
    // Fall through to client-side fetch path.
    return null;
  }
}
