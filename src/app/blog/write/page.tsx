"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { blogApi } from "@/lib/api";
import {
  BlogPostEditor,
  type BlogPostEditorHandle,
} from "@/lib/blog/BlogPostEditor";
import type { EditorOutput } from "@/lib/blog/editorOutput";
import { createEmptyEditorDocument } from "@/lib/blog/editorOutput";
import { slugifyFromTitle } from "@/lib/blog/slugifyTitle";

export default function BlogWritePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.authHydrated);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<BlogPostEditorHandle>(null);
  const initialEditorData = useMemo(() => createEmptyEditorDocument(), []);

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?returnUrl=/blog/write");
    }
  }, [authHydrated, isAuthenticated, router]);

  const submit = async () => {
    if (!title.trim() || !slug.trim()) {
      window.alert("Title and slug are required.");
      return;
    }
    let blocks: EditorOutput;
    try {
      blocks = await editorRef.current!.save();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not read the editor.");
      return;
    }
    if (!blocks.blocks?.length) {
      window.alert("Add at least one block before saving.");
      return;
    }
    setSaving(true);
    try {
      await blogApi.createMy({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        excerpt: excerpt.trim() || null,
        blocks,
        seo: {},
      });
      router.push("/blog/me");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Could not save draft";
      window.alert(String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (!authHydrated) {
    return <div className="mx-auto max-w-xl px-4 py-20 text-center text-stone-500">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <div className="mx-auto max-w-xl px-4 py-20 text-center text-stone-500">Redirecting to sign in…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div>
        <Link href="/blog" className="text-sm font-bold text-emerald-800 hover:underline">
          ← Blog
        </Link>
        <h1 className="mt-4 font-serif text-3xl text-emerald-950">Write a post</h1>
        <p className="mt-2 text-stone-600">Drafts are reviewed before publication.</p>
      </div>
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <label className="block text-xs font-bold uppercase text-stone-500">
          Title
          <input
            className="mt-1 w-full rounded border border-stone-200 px-3 py-2"
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              setSlug(slugifyFromTitle(v));
            }}
          />
        </label>
        <label className="block text-xs font-bold uppercase text-stone-500">
          Slug
          <input
            className="mt-1 w-full rounded border border-stone-200 px-3 py-2 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label className="block text-xs font-bold uppercase text-stone-500">
          Excerpt
          <textarea
            className="mt-1 w-full rounded border border-stone-200 px-3 py-2"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>
        <div>
          <p className="mb-2 text-sm text-stone-600">
            Basic <strong className="text-stone-800">Editor.js</strong> — paragraph and headings. Your draft
            is stored as structured blocks.
          </p>
          <BlogPostEditor
            ref={editorRef}
            resetKey="write-new"
            initialData={initialEditorData}
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void submit()}
          className="rounded-full bg-emerald-900 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
      </div>
    </div>
  );
}
