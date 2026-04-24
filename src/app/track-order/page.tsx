"use client";

import React, { useState, useEffect } from "react";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, PackageSearch, XCircle, AlertTriangle, Gift } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function safeDate(v: string | undefined | null): Date {
  if (!v) return new Date();
  if (!v.endsWith('Z') && !v.includes('+')) return new Date(v + 'Z');
  return new Date(v);
}

function isCancelEligible(order: any): boolean {
  if (!order) return false;
  if (!["pending", "processing"].includes(order.status)) return false;
  const created = safeDate(order.created_at).getTime();
  return Date.now() - created <= 24 * 60 * 60 * 1000;
}

function TrackOrderContent() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelEmail, setCancelEmail] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuthStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialId = searchParams.get("orderId");
    if (initialId) {
      setOrderId(initialId);
      handleTrackWithId(initialId);
    }
  }, [searchParams]);

  const handleTrackWithId = async (id: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const response = await orderApi.track(id.trim());
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTrackWithId(orderId);
  };

  const isOwner =
    isAuthenticated &&
    order &&
    order.user_id !== "guest" &&
    user &&
    String(order.user_id) === String((user as any)._id || (user as any).id);

  const needsEmail = !isOwner;

  const handleCancelConfirm = async () => {
    const oid = order?.id || order?._id;
    if (!oid) return;

    if (needsEmail && !cancelEmail.trim()) {
      setCancelError("Please enter the email used for this order.");
      return;
    }

    setCancelling(true);
    setCancelError(null);
    try {
      await orderApi.customerCancel(oid, needsEmail ? cancelEmail.trim() : undefined);
      setShowCancelModal(false);
      setCancelEmail("");
      await handleTrackWithId(oid);
    } catch (err: any) {
      setCancelError(err.response?.data?.detail || "Cancellation failed. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-emerald-950 mb-4">Track Your Order</h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs">
            Enter your order ID to see the latest status
          </p>
        </div>

        <form onSubmit={handleTrack} className="bg-gray-50 border border-gray-100 p-8 shadow-sm">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Order ID
          </label>
          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 65f1e2c4a9..."
              className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-950 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Track"}
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-500 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}
        </form>

        {order && (
          <div className="mt-12 border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Order ID</p>
                <p className="text-lg font-bold text-emerald-950">{order.id || order._id}</p>
              </div>
              <span
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  order.status === "cancelled"
                    ? "bg-red-50 text-red-600"
                    : order.status === "delivered"
                      ? "bg-green-50 text-green-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              {order.customer_name ? `Customer: ${order.customer_name} • ` : ""}
              Placed on {safeDate(order.created_at).toLocaleDateString()}
            </div>

            {order.status === "cancelled" && order.cancelled_by === "customer" && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-sm text-red-700">
                This order was cancelled by you.
                {order.payment_status === "refunded" && " A refund has been initiated."}
              </div>
            )}

            {order.free_decants_dropped_reason && (
              <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <p className="font-bold">Free decant removed</p>
                <p className="text-xs mt-0.5">
                  The free decant offer ended while your payment was being processed,
                  so your complimentary decant was removed. Your paid items are unaffected.
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {item.name} • {item.size_ml}ml × {item.quantity}
                    </span>
                    <span className="font-bold text-emerald-950">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {order.free_decants?.length > 0 && order.free_decants.map((fd: any, i: number) => (
                  <div key={`fd-${i}`} className="flex justify-between text-sm text-gray-700 bg-amber-50/60 -mx-2 px-2 py-1.5 rounded">
                    <span className="flex items-center space-x-2">
                      <Gift size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{fd.name} • {fd.size_ml}ml</span>
                    </span>
                    <span className="font-bold text-amber-600 text-xs uppercase tracking-widest flex items-center">
                      FREE
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-sm font-bold text-emerald-950">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>

            {isCancelEligible(order) && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setCancelError(null);
                    setShowCancelModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  <XCircle size={16} />
                  Cancel Order
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-wider">
                  Cancellation available within 24 hours of placing the order
                </p>
              </div>
            )}
          </div>
        )}

        {!order && !loading && !error && (
          <div className="mt-12 text-center text-gray-400 text-sm italic flex items-center justify-center space-x-2">
            <PackageSearch size={18} />
            <span>Enter your order ID above to track your order.</span>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md p-8 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-xl font-serif text-emerald-950">Cancel Order</h2>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            {order?.payment_status === "paid" && (
              <p className="text-sm text-gray-500 mb-4">
                A full refund will be initiated to your original payment method.
              </p>
            )}

            {needsEmail && (
              <div className="mt-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Confirm your email
                </label>
                <input
                  type="email"
                  value={cancelEmail}
                  onChange={(e) => setCancelEmail(e.target.value)}
                  placeholder="Email used for this order"
                  className="mt-2 w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}

            {cancelError && (
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-red-500">
                {cancelError}
              </p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelEmail("");
                  setCancelError(null);
                }}
                disabled={cancelling}
                className="flex-1 border border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-60"
              >
                {cancelling ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={null}>
      <TrackOrderContent />
    </React.Suspense>
  );
}
