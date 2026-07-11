import Link from "next/link";
import { Instagram, ArrowRight, Gift } from "lucide-react";
import { getPromoLink } from "@/lib/promoStatus";

const toneClasses = {
  cta: "text-emerald-700 border-emerald-600 hover:text-emerald-900 hover:border-emerald-800",
  active: "text-amber-700 border-amber-500 hover:text-amber-900 hover:border-amber-700",
  won: "text-emerald-700 border-emerald-600 hover:text-emerald-900 hover:border-emerald-800",
  muted: "text-gray-500 border-gray-400 hover:text-gray-700 hover:border-gray-600",
  pending: "text-gray-400 border-transparent",
};

type PromoOrderLinkProps = {
  order: {
    id?: string;
    _id?: string;
    instagram_promo_opt_in?: boolean;
    status?: string;
    promo_submission?: { status?: string } | null;
  };
  variant?: "inline" | "banner";
  className?: string;
};

export function PromoOrderLink({
  order,
  variant = "inline",
  className,
}: PromoOrderLinkProps) {
  const info = getPromoLink(order);
  if (!info) return null;

  const oid = order.id || order._id;
  const href = oid ? `/instagram-promo?orderId=${encodeURIComponent(oid)}` : "/instagram-promo";

  const cx = (...parts: (string | false | undefined)[]) =>
    parts.filter(Boolean).join(" ");

  if (variant === "banner" && info.href && info.tone === "cta") {
    return (
      <Link
        href={href}
        className={cx(
          "group block p-5 bg-gradient-to-r from-emerald-50 to-teal-50/80 border border-emerald-200/80 rounded-sm hover:border-emerald-400 hover:shadow-sm transition-all",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors">
            <Instagram size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-950">
              Win a free decant — post your Instagram video
            </p>
            <p className="mt-1 text-xs text-emerald-800/80 leading-relaxed">
              Share your unboxing on Instagram and enter our giveaway draw.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-600 pb-0.5 group-hover:text-emerald-900 group-hover:border-emerald-800 transition-colors">
              Enter the draw
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <Gift size={18} className="flex-shrink-0 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  const linkBase =
    "inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide border-b pb-0.5 transition-colors";

  if (!info.href) {
    return (
      <span className={cx(linkBase, toneClasses.pending, className)}>
        <Instagram size={13} className="opacity-50" />
        {info.label}
      </span>
    );
  }

  const Icon = info.tone === "won" ? Gift : Instagram;

  return (
    <Link
      href={href}
      className={cx(linkBase, toneClasses[info.tone], className)}
    >
      <Icon size={13} />
      {info.label}
      <ArrowRight size={12} className="opacity-70" />
    </Link>
  );
}
