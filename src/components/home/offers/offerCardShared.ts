/** Fixed height so every offer card aligns in grid + horizontal rail. */
export const OFFER_CARD_HEIGHT = "h-[200px]";

export const offerCardArticleClass = (extra = "") =>
  `relative flex ${OFFER_CARD_HEIGHT} flex-col overflow-hidden rounded-2xl border shadow-sm ${extra}`.trim();

export const offerCardBodyClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden p-4";

export const offerCardTitleClass = (expanded: boolean) =>
  expanded
    ? "mt-1 font-serif text-xl leading-tight text-inherit md:text-2xl line-clamp-2"
    : "mt-0.5 font-serif text-base leading-snug line-clamp-1";

export const offerCardEyebrowClass =
  "text-[9px] font-bold uppercase tracking-[0.28em] opacity-80";

export const offerCardChipClass =
  "rounded-full border px-2 py-0.5 text-[9px] font-medium";

export const offerCardPrimaryCtaClass =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[9px] font-bold uppercase tracking-widest transition-colors";

export const offerCardSecondaryLinkClass =
  "inline-flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-widest border-b pb-0.5 transition-colors";
