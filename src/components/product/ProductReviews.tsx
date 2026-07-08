"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, MessageSquare } from "lucide-react";
import { reviewApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { StarRating, InteractiveStarRating } from "@/components/product/StarRating";

export interface ReviewSummaryData {
  average_rating: number;
  review_count: number;
  rating_breakdown?: Record<number, number>;
}

export interface ReviewItem {
  _id?: string;
  id?: string;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase?: boolean;
  source?: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  initialReviews: ReviewItem[];
  initialSummary: ReviewSummaryData;
  onReviewsChange?: (reviews: ReviewItem[], summary: ReviewSummaryData) => void;
}

function formatReviewDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function ProductRatingHeader({
  summary,
  size = 14,
}: {
  summary: ReviewSummaryData;
  size?: number;
}) {
  if (!summary.review_count) {
    return (
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        No reviews yet
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={summary.average_rating} size={size} />
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        {summary.average_rating.toFixed(1)} · {summary.review_count} review
        {summary.review_count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export default function ProductReviews({
  productId,
  initialReviews,
  initialSummary,
  onReviewsChange,
}: ProductReviewsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [summary, setSummary] = useState<ReviewSummaryData>(initialSummary);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [eligibility, setEligibility] = useState<{
    can_review: boolean;
    has_reviewed: boolean;
    reason?: string;
  } | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  const refreshReviews = useCallback(async () => {
    const [reviewsRes, summaryRes] = await Promise.all([
      reviewApi.getByProduct(productId, { limit: 20 }),
      reviewApi.getSummary(productId),
    ]);
    const nextReviews = reviewsRes.data || [];
    const nextSummary = summaryRes.data || { average_rating: 0, review_count: 0 };
    setReviews(nextReviews);
    setSummary(nextSummary);
    onReviewsChange?.(nextReviews, nextSummary);
    return { reviews: nextReviews, summary: nextSummary };
  }, [productId, onReviewsChange]);

  useEffect(() => {
    setReviews(initialReviews);
    setSummary(initialSummary);
  }, [initialReviews, initialSummary]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEligibility(null);
      return;
    }

    let cancelled = false;
    setLoadingEligibility(true);
    reviewApi
      .getEligibility(productId)
      .then((res) => {
        if (!cancelled) setEligibility(res.data);
      })
      .catch(() => {
        if (!cancelled) setEligibility(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingEligibility(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (comment.trim().length < 10) {
      setFormError("Please write at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.create({
        product_id: productId,
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      setFormSuccess(true);
      setEligibility({ can_review: false, has_reviewed: true });
      await refreshReviews();
      router.refresh();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const breakdown = summary.rating_breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxBreakdown = Math.max(1, ...Object.values(breakdown));

  return (
    <section className="border-t border-emerald-100 bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            borderColor: "var(--section-shell-border)",
            background: "var(--section-shell-bg)",
          }}
        >
          <div
            className="px-4 py-5 md:px-6 md:py-6 border-b"
            style={{
              background: "var(--section-header-bg)",
              borderBottomColor: "var(--section-header-border)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">
              Customer voices
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-1">
              Reviews
            </h2>
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3 flex gap-3 items-start">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-950 leading-relaxed">
                  We keep reviews genuine. Only customers who purchased and
                  received this product can submit a review — one review per
                  product, with a Verified purchase badge on qualifying
                  submissions.
                </p>
                <Link
                  href="/reviews-policy"
                  className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-600/40 pb-0.5 hover:text-emerald-900 hover:border-emerald-800 transition-colors"
                >
                  How our reviews work
                </Link>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-6 pt-5 pb-5 md:pt-6 md:pb-6 grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            <div className="space-y-5">
              <div>
                <div className="text-5xl font-serif text-emerald-950">
                  {summary.review_count ? summary.average_rating.toFixed(1) : "—"}
                </div>
                <div className="mt-2">
                  <StarRating rating={summary.average_rating || 0} size={18} />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Based on {summary.review_count} review
                  {summary.review_count === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = breakdown[stars] || 0;
                  const width = `${Math.round((count / maxBreakdown) * 100)}%`;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-8">{stars}★</span>
                      <div className="flex-1 h-2 rounded-full bg-emerald-50 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width }}
                        />
                      </div>
                      <span className="w-6 text-right tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {isAuthenticated ? (
                loadingEligibility ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Checking review eligibility…
                  </div>
                ) : eligibility?.can_review ? (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-emerald-100 bg-white p-5 space-y-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-emerald-950">Write a review</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Only verified buyers who received this product can review.
                      </p>
                    </div>
                    <InteractiveStarRating value={rating} onChange={setRating} />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      placeholder="Share how it wears, longevity, and who you would recommend it to…"
                      className="w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                    {formError && (
                      <p className="text-sm text-red-600">{formError}</p>
                    )}
                    {formSuccess && (
                      <p className="text-sm text-emerald-700">
                        Thank you — your review has been published.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 bg-emerald-950 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      Submit review
                    </button>
                  </form>
                ) : eligibility?.has_reviewed ? (
                  <p className="text-sm text-slate-600 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                    You have already reviewed this product. Thank you for your feedback.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                    {eligibility?.reason ||
                      "Reviews are available after your order is delivered."}
                  </p>
                )
              ) : (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-slate-700">
                    Purchased this fragrance? Sign in to leave a verified review.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex justify-center bg-emerald-950 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <MessageSquare className="mx-auto mb-3 opacity-40" size={32} />
                  <p className="font-serif text-lg text-emerald-950">No reviews yet</p>
                  <p className="text-sm mt-1">Be the first to share your experience.</p>
                </div>
              ) : (
                <ul
                  className="review-list-scroll flex flex-col gap-4 max-h-[calc(5*9rem+4*1rem)] overflow-y-scroll pr-2"
                  aria-label="Customer reviews"
                >
                    {reviews.map((review) => {
                      const key = review._id || review.id || `${review.user_name}-${review.created_at}`;
                      return (
                        <li
                          key={key}
                          className="rounded-xl border border-emerald-100 bg-white p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                            <div>
                              <p className="font-medium text-emerald-950">{review.user_name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatReviewDate(review.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {review.is_verified_purchase && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-700">
                                  <ShieldCheck size={12} />
                                  Verified purchase
                                </span>
                              )}
                              <StarRating rating={review.rating} size={14} />
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-4 overflow-hidden">
                            {review.comment}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
