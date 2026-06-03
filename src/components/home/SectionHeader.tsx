import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
  /** Slightly smaller title for compact sections like Top Categories */
  compact?: boolean;
  className?: string;
}

/** Subtle title bar inside a `HomeSectionShell` — content stays in the panel below. */
export default function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = 'View all',
  compact = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={`section-header-block flex items-end justify-between gap-4 ${className}`}
    >
      <div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">
          {eyebrow}
        </div>
        <h2
          className={`font-serif text-emerald-950 mt-1 ${
            compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
          }`}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950 hover:border-emerald-800 transition-colors shrink-0"
        >
          {linkLabel} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
