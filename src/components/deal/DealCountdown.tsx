'use client';

import { useEffect, useState } from 'react';
import { normalizeIso } from './constants';

interface DealCountdownProps {
  endsAt: string | Date;
  /** Inline single-line, e.g. "12m 04s left". Used inside chips/pills. */
  compact?: boolean;
  /** HH / MM / SS in segmented digit tiles. Used in marquee/banner/hero. */
  boxed?: boolean;
  /** Optional eyebrow label rendered above the tiles in `boxed` mode. */
  label?: string;
  /** Tile background. Defaults to translucent black on light, black tile on
   *  light. Pass `currentColor`-friendly hex for accent rendering. */
  tileBg?: string;
  /** Tile text color. */
  tileFg?: string;
  className?: string;
  /** Fires once when the countdown crosses zero. */
  onZero?: () => void;
}

function toMs(endsAt: string | Date): number {
  // Force UTC interpretation for naive backend strings — see normalizeIso.
  const t =
    typeof endsAt === 'string'
      ? new Date(normalizeIso(endsAt)).getTime()
      : endsAt.getTime();
  return isNaN(t) ? 0 : Math.max(0, t - Date.now());
}

function breakdown(ms: number) {
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Countdown to a daily-deal's end timestamp. Three render modes:
 *  - default: "Ends in Hh MMm SSs" line with a pulsing dot.
 *  - compact: same idea but inline-sized for chips/pills.
 *  - boxed:  segmented HH / MM / SS digit tiles plus a label slot.
 *
 * In all modes, when less than an hour remains the component flips into an
 * "urgent" palette (subtle red tint + faster pulse) to push conversion.
 * Respects `prefers-reduced-motion`.
 */
export default function DealCountdown({
  endsAt,
  compact,
  boxed,
  label,
  tileBg,
  tileFg,
  className,
  onZero,
}: DealCountdownProps) {
  // `ms` starts as `null` instead of calling `toMs(endsAt)` (which reads
  // `Date.now()`). The server and first client render therefore both emit
  // *nothing*, so React's hydration check passes. After mount the effect
  // below seeds the actual remaining time, and the ticking takes over.
  const [ms, setMs] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMs(toMs(endsAt));
    const id = setInterval(() => {
      const next = toMs(endsAt);
      setMs(next);
      if (next <= 0) {
        clearInterval(id);
        onZero?.();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Pre-hydration (ms === null) and expired (ms <= 0) both render nothing.
  if (ms == null || ms <= 0) return null;

  const { h, m, s } = breakdown(ms);
  // Conversion lever: anything under 60 minutes amps up the visuals.
  const urgent = h < 1;
  const veryUrgent = urgent && m < 10;

  if (boxed) {
    // Segmented HH MM SS — punchy, scannable, conversion-friendly.
    const bg = tileBg ?? '#0b0b0b';
    const fg = tileFg ?? '#ffffff';
    const tiles: { value: string; key: string }[] = [
      { value: pad(h), key: 'h' },
      { value: pad(m), key: 'm' },
      { value: pad(s), key: 's' },
    ];
    return (
      <div className={`inline-flex flex-col items-center ${className ?? ''}`}>
        {label && (
          <span
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.35em] mb-1.5 ${
              urgent ? 'text-rose-200' : 'opacity-90'
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full bg-current align-middle mr-1.5 ${
                reducedMotion ? '' : urgent ? 'animate-ping' : 'animate-pulse'
              }`}
              aria-hidden="true"
            />
            {label}
          </span>
        )}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {tiles.map((t, i) => (
            <span key={t.key} className="flex items-center gap-1 sm:gap-1.5">
              <span
                className={`relative inline-flex min-w-[34px] sm:min-w-[42px] items-center justify-center rounded-md px-2 py-1.5 sm:px-2.5 sm:py-2 font-bold tabular-nums text-base sm:text-lg shadow-inner ${
                  veryUrgent && !reducedMotion ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: bg,
                  color: fg,
                  letterSpacing: '0.05em',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 0 rgba(0,0,0,0.25)',
                }}
              >
                <span
                  // Re-keying on value forces a tick-flip animation each second.
                  key={t.value}
                  className={reducedMotion ? '' : 'inline-block animate-[deal-tick_400ms_ease-out]'}
                >
                  {t.value}
                </span>
              </span>
              {i < tiles.length - 1 && (
                <span
                  className={`text-base sm:text-lg font-bold ${
                    reducedMotion ? '' : 'animate-pulse'
                  }`}
                  style={{ color: fg, opacity: 0.7 }}
                  aria-hidden="true"
                >
                  :
                </span>
              )}
            </span>
          ))}
        </div>
        <div className="mt-1 flex justify-between w-full px-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] opacity-70">
          <span className="w-[34px] sm:w-[42px] text-center">Hrs</span>
          <span className="w-[34px] sm:w-[42px] text-center">Min</span>
          <span className="w-[34px] sm:w-[42px] text-center">Sec</span>
        </div>
        <style jsx>{`
          @keyframes deal-tick {
            0% { transform: translateY(-25%); opacity: 0; }
            60% { transform: translateY(2%); opacity: 1; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
        <span
          className={`h-1.5 w-1.5 rounded-full bg-current ${
            reducedMotion ? '' : urgent ? 'animate-ping' : 'animate-pulse'
          }`}
          aria-hidden="true"
        />
        <span className="tabular-nums font-bold">
          {h > 0 ? `${h}h ` : ''}
          {pad(m)}m {pad(s)}s
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <span
        className={`h-2 w-2 rounded-full bg-current ${
          reducedMotion ? '' : urgent ? 'animate-ping' : 'animate-pulse'
        }`}
        aria-hidden="true"
      />
      <span className="tabular-nums font-bold uppercase tracking-widest text-[11px]">
        Ends in {h > 0 ? `${h}h ` : ''}{pad(m)}m {pad(s)}s
      </span>
    </span>
  );
}
