import sanitizeHtml from "sanitize-html";

/** Safe HTML for paragraph / header / list lines / quote fields saved from Editor.js.
 *
 * Uses `sanitize-html` (pure JS) rather than DOMPurify so the server bundle
 * never pulls in `jsdom` — jsdom's transitive ESM deps crash the Vercel
 * serverless/Turbopack runtime with ERR_REQUIRE_ESM. */
export function sanitizeBlogInlineHtml(dirty: string): string {
  const s = dirty.trim();
  if (!s) return "";
  return sanitizeHtml(s, {
    allowedTags: ["a", "b", "strong", "i", "em", "u", "br", "mark", "span"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });
}
