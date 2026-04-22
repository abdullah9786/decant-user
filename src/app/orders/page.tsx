"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Loader2,
  Copy,
  RefreshCw,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

function safeDate(v: string | undefined | null): Date {
  if (!v) return new Date();
  if (!v.endsWith('Z') && !v.includes('+')) return new Date(v + 'Z');
  return new Date(v);
}

function isCancelEligible(order: any): boolean {
  if (!["pending", "processing"].includes(order.status)) return false;
  const created = safeDate(order.created_at).getTime();
  return Date.now() - created <= 24 * 60 * 60 * 1000;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await orderApi.getUserOrders(
        user?.id || (user as any)?._id
      );
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      await orderApi.syncGuestOrders();
      const response = await orderApi.getUserOrders(
        user?.id || (user as any)?._id
      );
      setOrders(response.data);
      toast.success("Orders synced", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#022c22",
          color: "#fff",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },
      });
    } catch (err) {
      console.error("Error syncing orders", err);
      toast.error("Sync failed", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#991b1b",
          color: "#fff",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },
      });
    } finally {
      setSyncing(false);
    }
  };

  const openCancelModal = (order: any) => {
    setCancelTarget(order);
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const oid = cancelTarget.id || cancelTarget._id;
    setCancellingId(oid);
    setCancelError(null);
    try {
      await orderApi.customerCancel(oid);
      setShowCancelModal(false);
      setCancelTarget(null);
      toast.success("Order cancelled", {
        duration: 2500,
        style: {
          borderRadius: "10px",
          background: "#022c22",
          color: "#fff",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },
      });
      await fetchOrders();
    } catch (err: any) {
      setCancelError(
        err.response?.data?.detail || "Cancellation failed. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-serif text-emerald-950 mb-4">
          Please login to view your orders.
        </h2>
        <Link
          href="/login"
          className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const statusClasses = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-600";
      case "cancelled":
      case "refunded":
        return "bg-red-50 text-red-600";
      default:
        return "bg-emerald-50 text-emerald-600";
    }
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/profile">Account</Link> /{" "}
              <span className="text-emerald-600">Order History</span>
            </nav>
            <h1 className="text-4xl font-serif text-emerald-950">Your Orders</h1>
          </div>
          <button
            onClick={handleSyncOrders}
            disabled={syncing}
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600 disabled:opacity-60"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "Syncing..." : "Sync Guest Orders"}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 uppercase tracking-widest">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-xs">No orders found.</p>
            <Link
              href="/products"
              className="mt-4 inline-block text-[10px] font-bold text-emerald-600 border-b border-emerald-600 pb-1"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="border border-gray-100 overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-6 bg-gray-50 p-6 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>Order ID</span>
              <span>Date</span>
              <span>Total</span>
              <span>Items</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div
                  key={order.id || order._id}
                  className="grid grid-cols-1 md:grid-cols-6 p-6 hover:bg-gray-50 transition-colors items-center text-sm group"
                >
                  <div className="flex items-center space-x-2 mb-2 md:mb-0 group/id md:pr-8">
                    <span className="font-bold text-emerald-950 truncate max-w-[120px] md:max-w-full">
                      {order.id || order._id}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = order.id || order._id;
                        navigator.clipboard.writeText(id);
                        toast.success("ID Copied", {
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
                      }}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover/id:opacity-100"
                      title="Copy Order ID"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <span className="text-gray-500 mb-2 md:mb-0">
                    {safeDate(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-emerald-950 mb-2 md:mb-0">
                    ₹{order.total_amount}
                  </span>
                  <span className="text-gray-500 mb-2 md:mb-0 truncate pr-4 italic">
                    {order.items?.[0]?.name}
                    {order.items?.length > 1
                      ? ` + ${order.items.length - 1} more`
                      : ""}
                  </span>
                  <div className="mb-2 md:mb-0">
                    <span
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    {isCancelEligible(order) && (
                      <button
                        onClick={() => openCancelModal(order)}
                        disabled={cancellingId === (order.id || order._id)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === (order.id || order._id) ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md p-8 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-xl font-serif text-emerald-950">Cancel Order</h2>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to cancel order{" "}
              <span className="font-bold break-all">
                #{cancelTarget.id || cancelTarget._id}
              </span>
              ?
            </p>
            {cancelTarget.payment_status === "paid" && (
              <p className="text-sm text-gray-500 mt-1">
                A full refund will be initiated to your original payment method.
              </p>
            )}

            {cancelError && (
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-red-500">
                {cancelError}
              </p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelTarget(null);
                  setCancelError(null);
                }}
                disabled={!!cancellingId}
                className="flex-1 border border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={!!cancellingId}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-60"
              >
                {cancellingId ? (
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
