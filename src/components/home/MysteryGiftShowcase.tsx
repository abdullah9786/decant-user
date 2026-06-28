import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_ACCENT, formatINR, type MysteryTier } from "@/lib/mysteryGift";

const BEAM_ANGLES = [-34, -17, 0, 17, 34];
const SPARKLES = [
  { top: "8%", left: "26%", size: 12, delay: "0s" },
  { top: "4%", left: "62%", size: 16, delay: "0.6s" },
  { top: "26%", left: "78%", size: 10, delay: "1.2s" },
  { top: "22%", left: "14%", size: 9, delay: "1.8s" },
];

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z"
        fill={color}
      />
    </svg>
  );
}

export default function MysteryGiftShowcase({ offer }: { offer: any }) {
  const tiers: MysteryTier[] = [...(offer?.config?.tiers || [])]
    .filter((t: MysteryTier) => Number(t?.min_subtotal) > 0)
    .sort(
      (a: MysteryTier, b: MysteryTier) =>
        Number(a.min_subtotal) - Number(b.min_subtotal),
    );

  if (!offer || tiers.length === 0) return null;

  const title = offer?.display?.title_gift || "Unlock a Mystery Gift";
  const accent =
    offer?.display?.box_color ||
    tiers[tiers.length - 1]?.accent_color ||
    DEFAULT_ACCENT;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_-20%,_rgba(255,255,255,0.16)_0%,_transparent_55%)]"
          />

          <div className="relative grid items-center gap-6 p-7 md:grid-cols-[minmax(0,300px)_1fr] md:gap-14 md:p-12">
            {/* Loot box stage (left) */}
            <div className="mgift-float relative mx-auto flex h-44 w-full max-w-[280px] items-end justify-center md:mt-10 md:h-52">
              {/* Light core */}
              <div
                className="mgift-glow absolute left-1/2 top-[34%] h-44 w-44 rounded-full blur-2xl"
                style={{
                  background: `radial-gradient(closest-side, ${accent}, transparent)`,
                }}
                aria-hidden
              />

              {/* Light beams */}
              {BEAM_ANGLES.map((rot, i) => (
                <span
                  key={rot}
                  className="mgift-beam absolute bottom-[44%] left-1/2 h-48 w-2.5 rounded-full"
                  style={
                    {
                      "--mgift-rot": `${rot}deg`,
                      background: `linear-gradient(to top, ${accent}00, ${accent}d9, ${accent}00)`,
                      mixBlendMode: "screen",
                      animationDelay: `${i * 0.18}s`,
                    } as React.CSSProperties
                  }
                  aria-hidden
                />
              ))}

              {/* Sparkles */}
              {SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className="mgift-twinkle absolute text-white"
                  style={{
                    top: s.top,
                    left: s.left,
                    animationDelay: s.delay,
                  }}
                  aria-hidden
                >
                  <Sparkle size={s.size} color="#ffffff" />
                </span>
              ))}

              {/* The box */}
              <div
                className="relative z-10 h-[96px] w-[156px]"
                style={{ perspective: "700px" }}
              >
                {/* Lid (tilted open) */}
                <div
                  className="mgift-lid absolute left-1/2 top-[-30px] h-8 w-[164px] rounded-md"
                  style={{
                    transformOrigin: "center bottom",
                    background: `linear-gradient(160deg, ${accent}80, ${accent}33)`,
                    border: `1px solid ${accent}80`,
                    boxShadow: `0 -6px 16px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  }}
                  aria-hidden
                >
                  {/* Bow knot */}
                  <span
                    className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px]"
                    style={{
                      background: `linear-gradient(135deg, #fff, ${accent})`,
                      boxShadow: `0 0 10px ${accent}`,
                    }}
                  />
                </div>

                {/* Body */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[80px] w-[156px] overflow-hidden rounded-lg"
                  style={{
                    background: `linear-gradient(165deg, ${accent}40, ${accent}10)`,
                    border: `1px solid ${accent}59`,
                    boxShadow: `inset 0 7px 16px ${accent}73, 0 18px 32px rgba(0,0,0,0.38)`,
                  }}
                >
                  {/* Bright opening edge */}
                  <div
                    className="absolute inset-x-2 top-0 h-1.5 rounded-b-full bg-white"
                    style={{ filter: "blur(2px)", opacity: 0.92 }}
                  />
                  {/* Vertical ribbon */}
                  <div
                    className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2"
                    style={{
                      background: `linear-gradient(to bottom, ${accent}, ${accent}b3)`,
                      boxShadow: `inset 1px 0 0 rgba(255,255,255,0.25), inset -1px 0 0 rgba(0,0,0,0.15)`,
                    }}
                  />
                </div>
              </div>

              {/* Ground shadow */}
              <div
                className="absolute bottom-1 left-1/2 h-3 w-32 -translate-x-1/2 rounded-[50%] bg-black/45 blur-md"
                aria-hidden
              />
            </div>

            {/* Content (right) */}
            <div className="text-center md:text-left">
              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <span className="h-px w-8 bg-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[color:var(--accent-muted)]">
                  The Decume Rewards
                </span>
              </div>

              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-[2.5rem]">
                {title}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[color:var(--accent-muted)] md:mx-0">
                Reach a spending milestone and a hand-picked mystery decant slips
                into your parcel — our quiet thank you for exploring more.
              </p>

              {/* Subtle tiers */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 md:justify-start">
                {tiers.map((t, i) => {
                  const dot = t.accent_color || DEFAULT_ACCENT;
                  return (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-2 text-[12.5px]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
                      />
                      <span className="font-medium text-white/85">
                        {t.name || `Tier ${i + 1}`}
                      </span>
                      <span className="text-white/45">
                        {formatINR(Number(t.min_subtotal))}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-950 transition-all hover:gap-3 hover:shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
                >
                  Start unlocking
                  <ArrowRight size={14} />
                </Link>
                <span className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--accent-muted)]">
                  One gift per order
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
