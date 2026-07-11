export type PromoLinkInfo = {
  label: string;
  href: boolean;
  tone: "cta" | "active" | "won" | "muted" | "pending";
};

/** Map legacy/internal statuses to the three customer-facing states. */
export function normalizePromoStatus(status?: string | null): string {
  if (!status || status === "awaiting_post") return "awaiting_post";
  if (status === "under_review") return "submitted";
  if (status === "fulfilled") return "approved";
  return status;
}

export function getPromoLink(
  order: {
    instagram_promo_opt_in?: boolean;
    status?: string;
    promo_submission?: { status?: string } | null;
  }
): PromoLinkInfo | null {
  if (!order.instagram_promo_opt_in) return null;

  const promoStatus = normalizePromoStatus(order.promo_submission?.status);
  const orderStatus = order.status;

  if (orderStatus !== "delivered") {
    return {
      label: "Win a free decant after delivery",
      href: false,
      tone: "pending",
    };
  }

  const status = promoStatus || "awaiting_post";

  switch (status) {
    case "awaiting_post":
      return {
        label: "Post your video & enter the draw",
        href: true,
        tone: "cta",
      };
    case "submitted":
      return {
        label: "View your promo entry",
        href: true,
        tone: "active",
      };
    case "approved":
      return {
        label: "You won — view your gift",
        href: true,
        tone: "won",
      };
    case "rejected":
      return {
        label: "View promo result",
        href: true,
        tone: "muted",
      };
    case "expired":
      return {
        label: "Promo expired — view details",
        href: true,
        tone: "muted",
      };
    default:
      return {
        label: "Post your video & enter the draw",
        href: true,
        tone: "cta",
      };
  }
}

/** @deprecated Use getPromoLink */
export function getPromoChip(
  order: Parameters<typeof getPromoLink>[0]
): { label: string; className: string } | null {
  const link = getPromoLink(order);
  if (!link) return null;
  const classMap = {
    cta: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    active: "bg-amber-50 text-amber-800 border border-amber-200",
    won: "bg-green-50 text-green-700 border border-green-200",
    muted: "bg-gray-100 text-gray-600 border border-gray-200",
    pending: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return { label: link.label, className: classMap[link.tone] };
}

export function getPromoSteps(status: string) {
  const normalized = normalizePromoStatus(status);
  const decisionLabel =
    normalized === "approved"
      ? "Approved — you won!"
      : normalized === "rejected"
        ? "Not selected"
        : normalized === "submitted"
          ? "Awaiting decision"
          : "Approved or not selected";

  return [
    { key: "delivered", label: "Order delivered" },
    { key: "submitted", label: "Video submitted" },
    { key: "decision", label: decisionLabel },
  ] as const;
}

/** Index of the active progress step (steps before this are complete). */
export function promoStepIndex(status: string, orderDelivered: boolean): number {
  if (!orderDelivered) return 0;
  const normalized = normalizePromoStatus(status);
  switch (normalized) {
    case "awaiting_post":
      return 1;
    case "submitted":
      return 2;
    case "approved":
    case "rejected":
    case "expired":
      return 3;
    default:
      return 1;
  }
}
