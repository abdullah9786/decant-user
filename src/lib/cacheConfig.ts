/** Fallback ISR window when on-demand revalidation is unavailable (24h). */
export const CACHE_REVALIDATE_SECONDS =
  process.env.NODE_ENV === "development" ? 60 : 86_400;

/** Shorter dev fallback for tagged fetches during local testing. */
export const DEV_CACHE_REVALIDATE_SECONDS = 60;

export function cacheFetchOptions(tags?: string[]) {
  const base = { revalidate: CACHE_REVALIDATE_SECONDS } as const;
  if (tags?.length) {
    return { next: { ...base, tags } };
  }
  return { next: base };
}
