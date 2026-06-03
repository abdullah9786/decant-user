import type { ReactNode } from 'react';

interface HomeSectionShellProps {
  children: ReactNode;
  /** Extra classes on the outer `<section>` (spacing) */
  className?: string;
}

/**
 * Wraps a homepage block (title + content) in one themed surface so the
 * header and grid feel like a single section, not two stacked pieces.
 */
export default function HomeSectionShell({
  children,
  className = '',
}: HomeSectionShellProps) {
  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="home-section-shell">{children}</div>
      </div>
    </section>
  );
}
