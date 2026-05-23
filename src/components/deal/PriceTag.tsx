'use client';

interface PriceTagProps {
  originalPrice: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: {
    primary: 'text-sm font-bold',
    secondary: 'text-[11px]',
    pill: 'text-[9px] px-1.5 py-0.5',
  },
  md: {
    primary: 'text-base font-bold',
    secondary: 'text-xs',
    pill: 'text-[10px] px-2 py-0.5',
  },
  lg: {
    primary: 'text-2xl font-extrabold',
    secondary: 'text-sm',
    pill: 'text-xs px-2.5 py-1',
  },
};

function formatInr(n: number): string {
  if (!isFinite(n)) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Renders a price block. When `salePrice` is below `originalPrice` (i.e.
 * the variant matched an active daily deal), shows the sale price, a
 * struck-through original, and a discount pill. Otherwise just the price.
 */
export default function PriceTag({
  originalPrice,
  salePrice,
  discountPercent,
  size = 'md',
  className,
}: PriceTagProps) {
  const s = SIZE_MAP[size];
  const hasSale =
    typeof salePrice === 'number' &&
    salePrice >= 0 &&
    salePrice < originalPrice &&
    (discountPercent ?? 0) > 0;

  if (!hasSale) {
    return (
      <span className={`inline-flex items-baseline ${className ?? ''}`}>
        <span className={s.primary}>{formatInr(originalPrice)}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-baseline gap-2 ${className ?? ''}`}>
      <span className={`${s.primary} text-rose-600`}>{formatInr(salePrice as number)}</span>
      <span className={`${s.secondary} text-slate-400 line-through tabular-nums`}>
        {formatInr(originalPrice)}
      </span>
      <span
        className={`${s.pill} inline-flex items-center font-bold uppercase tracking-widest rounded-full bg-rose-50 text-rose-700 border border-rose-200`}
      >
        -{discountPercent}%
      </span>
    </span>
  );
}
