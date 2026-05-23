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
  loading: boolean;
  refetch: () => Promise<void>;
}

const DealContext = createContext<DealContextValue>({
  deal: null,
  products: [],
  msRemaining: 0,
  isProductOnDeal: () => false,
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

export function ActiveDealProvider({ children }: { children: React.ReactNode }) {
  const [deal, setDeal] = useState<DealDoc | null>(null);
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [msRemaining, setMsRemaining] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

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
      loading,
      refetch: fetchDeal,
    };
  }, [deal, products, msRemaining, loading, fetchDeal]);

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useActiveDeal() {
  return useContext(DealContext);
}
