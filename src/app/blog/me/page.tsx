"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Loader2,
  PenLine,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { blogApi } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

function statusMeta(status: string): { label: string; className: string } {
  switch (status) {
    case "draft":
      return { label: "Draft", className: "bg-slate-100 text-slate-700 ring-slate-200/80" };
    case "pending_review":
      return { label: "In review", className: "bg-amber-50 text-amber-900 ring-amber-200/80" };
    case "rejected":
      return { label: "Needs revision", className: "bg-rose-50 text-rose-800 ring-rose-200/80" };
    case "published":
      return { label: "Published", className: "bg-emerald-50 text-emerald-900 ring-emerald-200/80" };
    case "unpublished":
      return { label: "Unpublished", className: "bg-stone-100 text-stone-700 ring-stone-200/80" };
    default:
      return {
        label: status.replace(/_/g, " "),
        className: "bg-stone-100 text-stone-700 ring-stone-200/80",
      };
  }
}

export default function BlogMePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.authHydrated);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.listMy();
      setRows(res.data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?returnUrl=/blog/me");
      return;
    }
    void load();
  }, [authHydrated, isAuthenticated, load, router]);

  const submit = async (id: string) => {
    setBusyId(id);
    try {
      await blogApi.submitMy(id);
      await load();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Submit failed";
      window.alert(String(msg));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (r: Row) => {
    const extra =
      r.status === "published"
        ? " This will remove the live article from the blog."
        : r.status === "pending_review"
          ? " Your submission will be withdrawn from the review queue."
          : "";
    if (!window.confirm(`Delete “${r.title}”? This cannot be undone.${extra}`)) return;
    setBusyId(r.id);
    try {
      await blogApi.deleteMy(r.id);
      await load();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Delete failed";
      window.alert(String(msg));
    } finally {
      setBusyId(null);
    }
  };

  if (!authHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-700" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-stone-500">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-[55vh]">
      <section className="relative overflow-hidden border-b border-stone-200/90 bg-gradient-to-b from-white via-stone-50/50 to-[color:var(--surface-bg)] pb-10 pt-10 md:pb-14 md:pt-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/45 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-amber-100/35 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Journal
          </Link>

          <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-800 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Your writing
              </div>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">My posts</h1>
              <p className="mt-3 max-w-xl text-base text-slate-600">
                Drafts, submissions, and published pieces — manage or remove anything you own.
              </p>
            </div>
            <Link
              href="/blog/write"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 sm:self-auto"
            >
              <PenLine className="h-4 w-4" aria-hidden />
              New draft
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-9 w-9 animate-spin text-emerald-700" aria-label="Loading posts" />
            </div>
          ) : rows.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-stone-200 bg-white/70 px-8 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <BookOpen className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="mt-5 font-serif text-2xl text-emerald-950">No posts yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Start a draft — when you&apos;re ready, submit it for review before it goes live.
              </p>
              <Link
                href="/blog/write"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                <PenLine className="h-4 w-4" aria-hidden />
                Write something
              </Link>
            </div>
          ) : (
            <ul className="mx-auto grid max-w-4xl gap-5">
              {rows.map((r) => {
                const meta = statusMeta(r.status);
                const busy = busyId === r.id;
                return (
                  <li key={r.id}>
                    <article className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-black/[0.02] transition hover:border-emerald-200/80 hover:shadow-md md:p-7">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                          <h2 className="font-serif text-xl leading-snug text-emerald-950 sm:text-2xl">{r.title}</h2>
                          <p className="font-mono text-xs text-slate-500">/{r.slug}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          {r.status === "pending_review" ? (
                            <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                              Awaiting moderator
                            </span>
                          ) : null}

                          {(r.status === "draft" || r.status === "rejected") && (
                            <>
                              <Link
                                href={`/blog/me/edit/${r.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-800 shadow-sm transition hover:border-emerald-300 hover:bg-stone-50"
                              >
                                <PenLine className="h-3.5 w-3.5" aria-hidden />
                                Edit
                              </Link>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void submit(r.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-50"
                              >
                                <Send className="h-3.5 w-3.5" aria-hidden />
                                Submit for review
                              </button>
                            </>
                          )}

                          {r.status === "published" && (
                            <Link
                              href={`/blog/${r.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                              View live
                            </Link>
                          )}

                          {r.status === "unpublished" && (
                            <span className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">
                              Removed from public blog
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void remove(r)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
