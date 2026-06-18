"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { blogApi } from "@/lib/api";
import {
  BlogPostEditor,
  type BlogPostEditorHandle,
} from "@/lib/blog/BlogPostEditor";
import {
  createEmptyEditorDocument,
  normalizeEditorDocument,
  type EditorOutput,
} from "@/lib/blog/editorOutput";
import { slugifyFromTitle } from "@/lib/blog/slugifyTitle";

export default function BlogMeEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.authHydrated);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const slugManuallyEdited = useRef(false);
  const editorRef = useRef<BlogPostEditorHandle>(null);
  const [postBlocks, setPostBlocks] = useState<EditorOutput | null>(null);

  const initialEditorData = useMemo(() => {
    if (!postBlocks) return createEmptyEditorDocument();
    return normalizeEditorDocument(postBlocks);
  }, [postBlocks]);

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=/blog/me/edit/${id}`);
      return;
    }
    if (!id) return;
    setLoading(true);
    let cancelled = false;
    void (async () => {
      try {
        const res = await blogApi.getMy(id);
        const p = res.data as {
          title: string;
          slug: string;
          excerpt?: string | null;
          blocks?: EditorOutput | null;
        };
        if (cancelled) return;
        slugManuallyEdited.current = false;
        setTitle(p.title);
        setSlug(p.slug);
        setExcerpt(p.excerpt || "");
        setPostBlocks((p.blocks as EditorOutput) ?? null);
      } catch {
        router.replace("/blog/me");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authHydrated, id, isAuthenticated, router]);

  const save = async () => {
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
      await blogApi.updateMy(id, {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        excerpt: excerpt.trim() || null,
        blocks,
        seo: {},
      });
      router.push("/blog/me");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Save failed";
      window.alert(String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (!authHydrated) {
    return <div className="px-4 py-20 text-center text-stone-500">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <div className="px-4 py-20 text-center text-stone-500">Redirecting…</div>;
  }

  if (loading) {
    return <div className="px-4 py-20 text-center text-stone-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <Link href="/blog/me" className="text-sm font-bold text-emerald-800 underline">
        ← My posts
      </Link>
      <h1 className="font-serif text-3xl text-emerald-950">Edit draft</h1>
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <label className="block text-xs font-bold uppercase text-stone-500">
          Title
          <input
            className="mt-1 w-full rounded border border-stone-200 px-3 py-2"
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              if (!slugManuallyEdited.current) {
                setSlug(slugifyFromTitle(v));
              }
            }}
          />
        </label>
        <label className="block text-xs font-bold uppercase text-stone-500">
          Slug
          <input
            className="mt-1 w-full rounded border border-stone-200 px-3 py-2 font-mono text-sm"
            value={slug}
            onChange={(e) => {
              slugManuallyEdited.current = true;
              setSlug(e.target.value);
            }}
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
            Basic <strong className="text-stone-800">Editor.js</strong> — paragraph and headings.
          </p>
          <BlogPostEditor
            ref={editorRef}
            resetKey={id}
            initialData={initialEditorData}
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-full bg-emerald-900 px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
