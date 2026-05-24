'use client';

import { useEffect } from 'react';

interface MobileOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Accessible label for the dialog. */
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * Generic full-screen mobile overlay shell.
 *
 * Why this exists instead of an in-navbar slide-down panel:
 *   - A slide-down panel anchored to a `position: sticky` navbar has to
 *     coexist with the navbar's stacking context, the marquee/banner
 *     above it, body scroll locking, and the mobile browser's
 *     auto-hiding URL bar. We tried — it produced layout-shift bugs and
 *     forced touch-event hacks just to keep the chrome from sliding away.
 *   - A `position: fixed; inset: 0` overlay sidesteps all of that. It
 *     fills the *visible viewport*, so the browser's URL bar appearing
 *     or disappearing just resizes the modal automatically — no cut-off.
 *     There's no sticky element underneath to preserve, so we can use
 *     the standard `body { overflow: hidden }` scroll lock without any
 *     side effects.
 *
 * Responsibilities:
 *   - Lock body scroll while open (and restore the previous value on
 *     close, so we never leave the page in a stuck state).
 *   - Close on Escape.
 *   - Mark itself as `role="dialog" aria-modal` for accessibility.
 *
 * Animation, header, and content are all up to the caller — this
 * component only owns the modal *shell*.
 */
export default function MobileOverlay({
  open,
  onClose,
  ariaLabel,
  children,
}: MobileOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col animate-in fade-in duration-150"
    >
      {children}
    </div>
  );
}
