"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

type OrderTrackingInfoProps = {
  order: {
    status?: string;
    tracking_id?: string | null;
    tracking_url?: string | null;
    courier_name?: string | null;
    id?: string;
    _id?: string;
  };
  compact?: boolean;
};

export function hasOrderTracking(order: OrderTrackingInfoProps["order"]) {
  return Boolean(
    (order.tracking_id || "").trim() || (order.tracking_url || "").trim(),
  );
}

export function showOrderTracking(order: OrderTrackingInfoProps["order"]) {
  if (!hasOrderTracking(order)) return false;
  return ["shipped", "delivered"].includes(order.status || "");
}

export default function OrderTrackingInfo({
  order,
  compact = false,
}: OrderTrackingInfoProps) {
  if (!showOrderTracking(order)) return null;

  const trackingId = (order.tracking_id || "").trim();
  const trackingUrl = (order.tracking_url || "").trim();
  const courierName = (order.courier_name || "").trim();

  const copyTrackingId = async () => {
    if (!trackingId) return;
    try {
      await navigator.clipboard.writeText(trackingId);
      toast.success("Tracking ID copied", {
        duration: 1500,
        style: {
          borderRadius: "10px",
          background: "#022c22",
          color: "#fff",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },
      });
    } catch {
      toast.error("Could not copy");
    }
  };

  if (compact) {
    if (trackingUrl) {
      return (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950"
        >
          Track shipment
          <ExternalLink size={11} />
        </a>
      );
    }
    const orderId = order.id || order._id;
    if (orderId) {
      return (
        <Link
          href={`/track-order?orderId=${encodeURIComponent(String(orderId))}`}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950"
        >
          View tracking
        </Link>
      );
    }
    return null;
  }

  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
        Shipment tracking
      </p>
      {courierName ? (
        <p className="mt-2 text-sm text-emerald-950">
          <span className="text-slate-500">Courier:</span> {courierName}
        </p>
      ) : null}
      {trackingId ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm text-emerald-950">
            <span className="text-slate-500">Tracking ID:</span>{" "}
            <span className="font-mono font-semibold">{trackingId}</span>
          </p>
          <button
            type="button"
            onClick={copyTrackingId}
            className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 hover:bg-emerald-50"
          >
            <Copy size={11} />
            Copy
          </button>
        </div>
      ) : null}
      {trackingUrl ? (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-950 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-black"
        >
          Track on courier site
          <ExternalLink size={12} />
        </a>
      ) : null}
    </div>
  );
}
