"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Instagram,
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { promoSubmissionApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { getPromoSteps, normalizePromoStatus, promoStepIndex } from "@/lib/promoStatus";
import { toast } from "react-hot-toast";

function safeDate(v: string | undefined | null): string {
  if (!v) return "";
  const d = !v.endsWith("Z") && !v.includes("+") ? new Date(v + "Z") : new Date(v);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PromoContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const { isAuthenticated, user } = useAuthStore();

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [guestEmail, setGuestEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);

  const [postUrl, setPostUrl] = useState("");
  const [posterHandle, setPosterHandle] = useState("");
  const [postedByNote, setPostedByNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailForRequest = isAuthenticated
    ? user?.email || verifiedEmail
    : verifiedEmail;

  const fetchStatus = async (oid: string, email?: string) => {
    if (!oid.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await promoSubmissionApi.getByOrder(oid.trim(), email || undefined);
      setData(res.data);
      setNeedsEmail(false);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (
        typeof detail === "string" &&
        detail.toLowerCase().includes("email verification")
      ) {
        setNeedsEmail(true);
        setData(null);
        setError(null);
      } else {
        setError(typeof detail === "string" ? detail : "Could not load promo status.");
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      setOrderIdInput(initialOrderId);
      if (isAuthenticated) {
        void fetchStatus(initialOrderId);
      } else {
        setNeedsEmail(true);
      }
    }
  }, [initialOrderId, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const oid = orderIdInput.trim();
    if (!oid) return;
    setOrderId(oid);
    if (!isAuthenticated && !verifiedEmail) {
      setNeedsEmail(true);
      return;
    }
    void fetchStatus(oid, emailForRequest || undefined);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = guestEmail.trim();
    if (!email || !orderId) return;
    setVerifiedEmail(email);
    void fetchStatus(orderId, email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !data?.can_submit) return;
    setSubmitting(true);
    try {
      const res = await promoSubmissionApi.submit({
        order_id: orderId,
        email: isAuthenticated ? undefined : verifiedEmail || guestEmail.trim(),
        post_url: postUrl.trim(),
        poster_instagram_username: posterHandle.trim(),
        posted_by_note: postedByNote.trim() || undefined,
      });
      setData(res.data);
      toast.success("Promo video submitted", {
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
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Submission failed", {
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#991b1b",
          color: "#fff",
          fontSize: "12px",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const rules = data?.campaign_rules;
  const promoStatus = data ? normalizePromoStatus(data.status) : "awaiting_post";
  const promoSteps = getPromoSteps(data?.status || "awaiting_post");
  const stepIdx = data
    ? promoStepIndex(data.status, data.order_delivered)
    : 0;

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-4">
          <Instagram className="text-emerald-600" size={28} />
          <h1 className="text-3xl font-serif text-emerald-950">Instagram Promo</h1>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Post a short promo video after your order is delivered for a chance to win a free
          decant.{" "}
          <Link href="/instagram-promo/how-to-enter" className="text-emerald-700 hover:underline">
            Read how to enter
          </Link>
          .
        </p>

        <form onSubmit={handleLookup} className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Order ID"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="flex-1 border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="bg-emerald-950 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            Look up
          </button>
        </form>

        {needsEmail && orderId && !isAuthenticated && (
          <form
            onSubmit={handleVerifyEmail}
            className="mb-8 p-6 bg-white border border-gray-100 shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-4">
              Enter the email used for order <span className="font-mono text-xs">{orderId}</span> to
              view or submit your promo.
            </p>
            <input
              type="email"
              required
              placeholder="Order email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm mb-4 focus:outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              className="w-full bg-emerald-950 text-white py-3 text-xs font-bold uppercase tracking-widest"
            >
              Continue
            </button>
          </form>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-8">
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Order
              </p>
              <p className="font-mono text-sm text-emerald-950 break-all">{data.order_id}</p>

              {!data.instagram_promo_opt_in && (
                <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 p-3">
                  Instagram promo is not currently available for this order.
                </p>
              )}

              {data.instagram_promo_opt_in && !data.order_delivered && (
                <p className="mt-4 text-sm text-gray-600">
                  Promo opens once your order is marked delivered.
                </p>
              )}
            </div>

            {data.instagram_promo_opt_in && data.order_delivered && (
              <>
                <div className="bg-white border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                    Progress
                  </h2>
                  <div className="space-y-4">
                    {promoSteps.map((step, i) => {
                      const done = i < stepIdx;
                      const current = i === stepIdx;
                      const Icon = done ? CheckCircle2 : Circle;
                      return (
                        <div key={step.key} className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={
                              done
                                ? "text-emerald-600"
                                : current
                                  ? "text-emerald-600"
                                  : "text-gray-300"
                            }
                          />
                          <span
                            className={`text-sm ${
                              done || current ? "text-emerald-950 font-medium" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {data.deadline_at && data.status === "awaiting_post" && (
                    <p className="mt-6 text-xs text-gray-500">
                      Submit by: <strong>{safeDate(data.deadline_at)}</strong>
                    </p>
                  )}
                </div>

                {promoStatus === "approved" && (
                  <div className="p-4 bg-green-50 border border-green-100 text-green-800 text-sm">
                    <strong>Your video is approved — you&apos;ve won!</strong>
                    {data.prize_label ? (
                      <p className="mt-1">Gift: {data.prize_label}. We will ship it to your order address.</p>
                    ) : (
                      <p className="mt-1">We will ship your gift to your order address.</p>
                    )}
                  </div>
                )}

                {promoStatus === "rejected" && (
                  <div className="p-4 bg-gray-50 border border-gray-200 text-gray-700 text-sm">
                    <strong>Not selected this time.</strong>
                    {data.rejection_reason && (
                      <p className="mt-1 text-xs text-gray-500">{data.rejection_reason}</p>
                    )}
                  </div>
                )}

                {(promoStatus === "submitted" ||
                  promoStatus === "approved" ||
                  promoStatus === "rejected") &&
                  data.post_url && (
                  <div className="bg-white border border-gray-100 p-6 shadow-sm space-y-3 text-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Your submission
                    </p>
                    {data.poster_instagram_username && (
                      <p>
                        Posted by:{" "}
                        <a
                          href={`https://instagram.com/${data.poster_instagram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-medium inline-flex items-center gap-1"
                        >
                          @{data.poster_instagram_username}
                          <ExternalLink size={12} />
                        </a>
                      </p>
                    )}
                    <p>
                      <a
                        href={data.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 underline break-all"
                      >
                        View post
                      </a>
                    </p>
                    {promoStatus === "submitted" && (
                      <p className="text-gray-500 text-xs">We&apos;ll email you when reviewed.</p>
                    )}
                  </div>
                )}

                {data.can_submit && rules && (
                  <div className="bg-white border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                      Rules
                    </h2>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6 list-disc pl-4">
                      <li>Public account with at least {rules.min_followers} followers</li>
                      {rules.required_mention && <li>Tag {rules.required_mention}</li>}
                      {(rules.required_hashtags || []).length > 0 && (
                        <li>Use {(rules.required_hashtags || []).join(", ")}</li>
                      )}
                      <li>Prize ships to your order address, not the poster&apos;s</li>
                    </ul>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Instagram post / reel URL
                        </label>
                        <input
                          required
                          type="url"
                          placeholder="https://instagram.com/reel/..."
                          value={postUrl}
                          onChange={(e) => setPostUrl(e.target.value)}
                          className="mt-1 w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Instagram account that posted (yours or friend&apos;s)
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="username"
                          value={posterHandle}
                          onChange={(e) =>
                            setPosterHandle(e.target.value.replace(/^@+/, ""))
                          }
                          className="mt-1 w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Note (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Posted by my friend"
                          value={postedByNote}
                          onChange={(e) => setPostedByNote(e.target.value)}
                          className="mt-1 w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-emerald-950 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Submit for review"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}

            <p className="text-center text-xs text-gray-400">
              <Link href="/orders" className="text-emerald-700 hover:underline">
                Back to orders
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstagramPromoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      }
    >
      <PromoContent />
    </Suspense>
  );
}
