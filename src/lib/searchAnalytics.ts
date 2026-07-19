import { analyticsApi } from '@/lib/api';

const DEDUP_MS = 30_000;
const STORAGE_KEY = 'decume_last_search_log';

type SearchLogSource = 'navbar' | 'search_page';

/**
 * Log a search after debounce settles (type-ahead) or on submit.
 * Dedupes identical queries within 30s (navbar → /search double-fire).
 * Never blocks UI — failures are swallowed.
 */
export function logCommittedSearch(params: {
  query: string;
  result_count?: number;
  source: SearchLogSource;
}) {
  const trimmed = params.query.trim();
  if (trimmed.length < 1) return;

  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const last = raw ? JSON.parse(raw) : null;
      if (last?.q === normalized && Date.now() - (last.at || 0) < DEDUP_MS) {
        return;
      }
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ q: normalized, at: Date.now() }),
      );
    } catch {
      /* ignore storage errors */
    }
  }

  analyticsApi
    .logSearch({
      query: trimmed,
      result_count: params.result_count ?? 0,
      source: params.source,
    })
    .catch(() => {});
}
