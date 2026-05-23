// Paths where conversion-focused chrome (banners, marquee, promo modal) is
// suppressed because the user is already deep in the funnel. Anything that
// distracts from the cart/checkout flow lives here.
export const DEAL_HIDDEN_PREFIXES = ['/cart', '/checkout', '/order-success'];

export function isDealChromeHidden(pathname?: string | null): boolean {
  if (!pathname) return false;
  return DEAL_HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * MongoDB via Motor returns naive datetimes, and FastAPI's default encoder
 * serializes them without a `Z` / `±HH:MM` suffix. When that bare string
 * reaches `new Date(...)` in the browser, JS interprets it as *local time*
 * — for an IST user that lops 5h30m off the countdown.
 *
 * Backend always stores deal windows in UTC, so the safe fix is: if the
 * string carries no offset, append `Z` to force UTC interpretation.
 */
export function normalizeIso(iso: string | Date | null | undefined): string {
  if (iso == null) return '';
  if (iso instanceof Date) return iso.toISOString();
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) return iso;
  return `${iso}Z`;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------
// Admins can pick any hex as the deal accent (e.g., pastel pink, beige).
// When the accent is light, naive usage like `color: accent` on white surfaces
// or `bg-accent + text-white` on CTAs becomes unreadable. These helpers let
// every deal surface adapt without hard-coding fallbacks per component.

function parseHex(hex: string): [number, number, number] {
  const clean = (hex || '').replace('#', '').padEnd(6, '0').slice(0, 6);
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ];
}

function toHexByte(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

function yiq(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Picks black or white text for the strongest contrast on top of `hex`.
 * Threshold of 160 leaves room for mid-tone accents to still feel "branded"
 * with white text where readable, only flipping to black for clearly light
 * accents.
 */
export function readableOn(hex: string): '#0b0b0b' | '#ffffff' {
  const [r, g, b] = parseHex(hex);
  return yiq(r, g, b) >= 160 ? '#0b0b0b' : '#ffffff';
}

/**
 * Returns a darkened, on-brand version of the accent that's safe to use as
 * a *foreground* color on white surfaces or a CTA background under white
 * text. Iteratively mixes toward black until perceived luminance drops below
 * ~100 (well under the readable-on-white threshold). Idempotent for accents
 * that are already deep enough.
 */
export function deepenAccent(hex: string): string {
  let [r, g, b] = parseHex(hex);
  for (let i = 0; i < 8 && yiq(r, g, b) > 100; i++) {
    r *= 0.7;
    g *= 0.7;
    b *= 0.7;
  }
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

/**
 * Symmetric counterpart of `deepenAccent`: returns a lightened, on-brand
 * version of the accent that's safe to use as a *foreground* color on dark
 * surfaces (e.g. the daily-deal rail's near-black canvas). Iteratively mixes
 * toward white until perceived luminance climbs above ~160. Idempotent for
 * accents that are already light enough.
 */
export function lightenAccent(hex: string): string {
  let [r, g, b] = parseHex(hex);
  for (let i = 0; i < 8 && yiq(r, g, b) < 160; i++) {
    r = r + (255 - r) * 0.4;
    g = g + (255 - g) * 0.4;
    b = b + (255 - b) * 0.4;
  }
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

// ---------------------------------------------------------------------------
// Deal end-time formatting
// ---------------------------------------------------------------------------
// Offers are configured with arbitrary `starts_at` / `ends_at` in admin. They
// are NOT guaranteed to roll over at midnight, so user-facing copy must read
// from the actual end timestamp rather than referring to "midnight IST".

function istParts(d: Date): { y: number; m: number; day: number } {
  // toLocaleString with a timeZone gives us IST-anchored components without
  // pulling in a tz library. We round-trip through a string because JS Date
  // objects are always in the local tz internally.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value || '0');
  return { y: get('year'), m: get('month'), day: get('day') };
}

/**
 * Human-friendly relative end time, e.g. "today at 9:00 PM IST", "tomorrow
 * at 3:00 PM IST", or "Sun, Feb 4 at 6:00 PM IST". Returns "soon" for
 * invalid / missing timestamps so we never render "Invalid Date".
 *
 * Note: a previous version of the copy assumed all deals end at midnight IST.
 * They don't — admins can set any `ends_at` — so all user-facing strings
 * should funnel through this helper.
 */
export function formatDealEnd(endsAt: string | Date | null | undefined): string {
  if (endsAt == null) return 'soon';
  const iso = endsAt instanceof Date ? endsAt.toISOString() : normalizeIso(endsAt);
  const end = new Date(iso);
  if (isNaN(end.getTime())) return 'soon';

  const time = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(end);

  const now = istParts(new Date());
  const then = istParts(end);
  const dayDiff = Math.round(
    (Date.UTC(then.y, then.m - 1, then.day) - Date.UTC(now.y, now.m - 1, now.day)) /
      86_400_000,
  );

  if (dayDiff <= 0) return `today at ${time} IST`;
  if (dayDiff === 1) return `tomorrow at ${time} IST`;

  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(end);
  return `${date} at ${time} IST`;
}
