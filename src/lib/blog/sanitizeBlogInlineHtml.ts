import DOMPurify from "isomorphic-dompurify";

/** Safe HTML for paragraph / header / list lines / quote fields saved from Editor.js. */
export function sanitizeBlogInlineHtml(dirty: string): string {
  const s = dirty.trim();
  if (!s) return "";
  return DOMPurify.sanitize(s, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ["a", "b", "strong", "i", "em", "u", "br", "mark", "span"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
}
