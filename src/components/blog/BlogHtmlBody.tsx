"use client";

import { useEffect, useState } from "react";

export default function BlogHtmlBody({ html }: { html: string }) {
  const [safe, setSafe] = useState("");

  useEffect(() => {
    let cancelled = false;
    void import("dompurify").then(({ default: DOMPurify }) => {
      if (cancelled) return;
      setSafe(
        DOMPurify.sanitize(html, {
          USE_PROFILES: { html: true },
          FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [html]);

  if (!safe) {
    return <div className="min-h-[12rem] animate-pulse rounded bg-stone-100" />;
  }

  return (
    <div
      className="prose prose-stone max-w-none prose-headings:font-serif prose-a:text-emerald-800"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
