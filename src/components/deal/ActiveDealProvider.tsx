'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { offerApi } from '@/lib/api';
import { normalizeIso } from './constants';
import { areAllProductsOutOfStock } from '@/lib/product/stock';

export interface DealVariant {
  size_ml: number;
  price: number;
  is_pack?: boolean;
  stock?: number;
  original_price?: number;
  sale_price?: number;
  discount_percent?: number;
  deal_id?: string | null;
}

export interface DealProduct {
  _id?: string;
  id?: string;
  name: string;
  brand?: string;
  image_url?: string;
  variants: DealVariant[];
  [key: string]: any;
}

export interface DealDisplay {
  headline?: string;
  subheadline?: string;
  marquee_text?: string;
  cta_label?: string;
  cta_href?: string;
  accent_color?: string;
  hero_image?: string;
}

export interface DealConfig {
  product_ids: string[];
  discount_percent: number;
  apply_to?: 'all' | 'decant' | 'pack';
}

export interface DealDoc {
  _id: string;
  type: 'daily_deal';
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  config: DealConfig;
  display: DealDisplay;
}

interface DealContextValue {
  deal: DealDoc | null;
  products: DealProduct[];
  msRemaining: number;
  isProductOnDeal: (productId: string) => boolean;
  /**
   * True iff a deal is active *and* every product in it is sold out.
   * Surfaces from a single place (rather than re-deriving in every
   * component) so the hero, banner, rail, marquee, and /deals/today
   * page all agree on when to flip into the "regret + wait" copy.
   */
  allOutOfStock: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

const DealContext = createContext<DealContextValue>({
  deal: null,
  products: [],
  msRemaining: 0,
  isProductOnDeal: () => false,
  allOutOfStock: false,
  loading: true,
  refetch: async () => {},
});

function computeMsRemaining(endsAt: string | undefined | null): number {
  if (!endsAt) return 0;
  // Backend datetimes ride in without a tz suffix; force UTC so we don't
  // misread them as the browser's local time.
  const t = new Date(normalizeIso(endsAt)).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, t - Date.now());
}

interface ActiveDealProviderProps {
  children: React.ReactNode;
  /**
   * Optional SSR-fetched payload. When provided, the provider boots with
   * the deal/products already populated, so the banner and marquee can
   * render during server-side rendering instead of popping in 1-2s after
   * hydration (which was causing visible CLS at the top of every page).
   */
  initialDeal?: DealDoc | null;
  initialProducts?: DealProduct[];
}

export function ActiveDealProvider({
  children,
  initialDeal = null,
  initialProducts = [],
}: ActiveDealProviderProps) {
  const [deal, setDeal] = useState<DealDoc | null>(initialDeal);
  const [products, setProducts] = useState<DealProduct[]>(initialProducts);
  // Note: we deliberately do NOT compute msRemaining from initialDeal in
  // the useState initializer — that would call Date.now() during SSR and
  // again during hydration, causing a mismatch. The effect below seeds it
  // on the client only.
  const [msRemaining, setMsRemaining] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(!initialDeal);
  const fetchInFlight = useRef<boolean>(false);

  const fetchDeal = useCallback(async () => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    try {
      const res = await offerApi.getDailyDeal();
      const data = res.data as { deal: DealDoc; products: DealProduct[] } | null;
      if (data && data.deal) {
        setDeal(data.deal);
        setProducts(data.products || []);
        setMsRemaining(computeMsRemaining(data.deal.ends_at));
      } else {
        setDeal(null);
        setProducts([]);
        setMsRemaining(0);
      }
    } catch {
      setDeal(null);
      setProducts([]);
      setMsRemaining(0);
    } finally {
      setLoading(false);
      fetchInFlight.current = false;
    }
  }, []);

  // First-paint behaviour:
  //  - If SSR seeded us with a deal, skip the initial fetch (saves a
  //    network round-trip) and just seed `msRemaining` on the client.
  //  - Otherwise, fetch from the API as before.
  useEffect(() => {
    if (initialDeal) {
      setMsRemaining(computeMsRemaining(initialDeal.ends_at));
      return;
    }
    fetchDeal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick the countdown once a second when there's an active deal. We don't
  // need sub-second precision; this is purely a UI countdown.
  useEffect(() => {
    if (!deal) return;
    const id = setInterval(() => {
      const remaining = computeMsRemaining(deal.ends_at);
      setMsRemaining(remaining);
      if (remaining <= 0) {
        // Window closed — pull the next deal (which may be `null`).
        fetchDeal();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deal, fetchDeal]);

  // Refetch when the tab regains focus so a user who left the tab open
  // through midnight sees the new deal as soon as they come back.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') fetchDeal();
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', fetchDeal);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', fetchDeal);
    };
  }, [fetchDeal]);

  const value = useMemo<DealContextValue>(() => {
    const idSet = new Set((deal?.config?.product_ids || []).map(String));
    return {
      deal,
      products,
      msRemaining,
      isProductOnDeal: (pid: string) => idSet.has(String(pid)),
      allOutOfStock: Boolean(deal) && areAllProductsOutOfStock(products),
      loading,
      refetch: fetchDeal,
    };
  }, [deal, products, msRemaining, loading, fetchDeal]);

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useActiveDeal() {
  return useContext(DealContext);
}
