import Link from "next/link";
import { fetchProductForBlog } from "@/lib/server/blog";
import { sanitizeBlogInlineHtml } from "@/lib/blog/sanitizeBlogInlineHtml";

export type BlogBlocksPayload = { blocks?: Block[] } | null;

type Block = {
  type?: string;
  data?: Record<string, unknown>;
  id?: string;
};

function safeHttps(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const u = url.trim();
  return u.startsWith("https://") ? u : null;
}

const linkProse =
  "[&_a]:font-medium [&_a]:text-emerald-800 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-emerald-700/40 hover:[&_a]:text-emerald-900";

function paragraphText(data: Record<string, unknown> | undefined): string {
  const t = data?.text;
  return typeof t === "string" ? t : "";
}

function isFlatStringListItems(items: unknown[]): boolean {
  return items.length > 0 && items.every((x) => typeof x === "string");
}

type EditorListNode = { content?: string; items?: EditorListNode[] };

function EditorListNest({
  items,
  ordered,
  baseKey,
}: {
  items: EditorListNode[];
  ordered: boolean;
  baseKey: string;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="mt-1 list-outside space-y-1 pl-6 font-serif text-lg marker:text-emerald-800 [&>li>ol]:mt-2 [&>li>ul]:mt-2">
      {items.map((node, i) => {
        const raw = typeof node.content === "string" ? node.content : "";
        const html = sanitizeBlogInlineHtml(raw) || "\u00a0";
        const sub = Array.isArray(node.items) ? node.items : [];
        return (
          <li key={`${baseKey}-${i}`} className={`leading-relaxed text-stone-800 ${linkProse}`}>
            {/* eslint-disable-next-line react/no-danger */}
            <span dangerouslySetInnerHTML={{ __html: html }} />
            {sub.length > 0 ? (
              <EditorListNest items={sub} ordered={ordered} baseKey={`${baseKey}-${i}`} />
            ) : null}
          </li>
        );
      })}
    </Tag>
  );
}

export default async function BlogBlocks({ blocks }: { blocks: BlogBlocksPayload }) {
  const list = blocks?.blocks || [];
  const productIds = list
    .filter((b) => b.type === "product")
    .map((b) => (typeof b.data?.product_id === "string" ? b.data.product_id : ""))
    .filter(Boolean);
  const unique = [...new Set(productIds)];
  const loaded = await Promise.all(unique.map((id) => fetchProductForBlog(id)));
  const productMap = new Map<string, Awaited<ReturnType<typeof fetchProductForBlog>>>();
  unique.forEach((id, i) => productMap.set(id, loaded[i]));

  return (
    <div className={`space-y-8 text-stone-800 ${linkProse}`}>
      {list.map((block, idx) => {
        const key = block.id || `b-${idx}`;
        const data = block.data || {};
        switch (block.type) {
          case "paragraph": {
            const html = sanitizeBlogInlineHtml(paragraphText(data));
            if (!html) return null;
            return (
              <p
                key={key}
                className={`font-serif text-lg leading-relaxed text-stone-800 ${linkProse}`}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
          case "header": {
            const raw = typeof data.text === "string" ? data.text : "";
            const lvl = typeof data.level === "number" ? data.level : 2;
            const level = Math.min(4, Math.max(2, lvl));
            const Tag = (`h${level}` as "h2" | "h3" | "h4") || "h2";
            const inner = sanitizeBlogInlineHtml(raw);
            if (!inner) return null;
            return (
              <Tag
                key={key}
                className={`font-serif font-semibold tracking-tight text-emerald-950 ${linkProse}`}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: inner }}
              />
            );
          }
          case "list": {
            const styleRaw = data.style;
            const ordered = styleRaw === "ordered";
            const items = Array.isArray(data.items) ? data.items : [];
            if (items.length === 0) return null;
            if (isFlatStringListItems(items)) {
              const Inner = ordered ? "ol" : "ul";
              return (
                <Inner
                  key={key}
                  className="list-inside space-y-2 font-serif text-lg marker:text-emerald-800"
                >
                  {(items as string[]).map((item, i) => (
                    <li key={i}>
                      {/* eslint-disable-next-line react/no-danger */}
                      <span
                        className={linkProse}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeBlogInlineHtml(item) || "\u00a0",
                        }}
                      />
                    </li>
                  ))}
                </Inner>
              );
            }
            return (
              <div key={key} className="font-serif text-lg text-stone-800">
                <EditorListNest
                  items={items as EditorListNode[]}
                  ordered={ordered}
                  baseKey={key}
                />
              </div>
            );
          }
          case "image": {
            const file = data.file as { url?: string } | undefined;
            const url = safeHttps(file?.url) || safeHttps(data.url as string | undefined);
            const caption = typeof data.caption === "string" ? data.caption : "";
            if (!url) return null;
            return (
              <figure key={key} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={caption || ""} className="w-full rounded-lg border border-stone-200" />
                {caption ? (
                  <figcaption className="text-center text-sm text-stone-500">{caption}</figcaption>
                ) : null}
              </figure>
            );
          }
          case "quote": {
            const text = typeof data.text === "string" ? data.text : "";
            const cap = typeof data.caption === "string" ? data.caption : "";
            const bodyHtml = sanitizeBlogInlineHtml(text);
            const capHtml = sanitizeBlogInlineHtml(cap);
            if (!bodyHtml && !capHtml) return null;
            return (
              <blockquote
                key={key}
                className={`border-l-4 border-emerald-700/40 bg-stone-50 py-3 pl-4 pr-2 font-serif text-lg italic text-stone-800 ${linkProse}`}
              >
                {bodyHtml ? (
                  // eslint-disable-next-line react/no-danger
                  <p dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                ) : null}
                {capHtml ? (
                  <footer className="mt-2 text-sm not-italic text-stone-500">
                    <span>— </span>
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: capHtml }} />
                  </footer>
                ) : null}
              </blockquote>
            );
          }
          case "delimiter":
            return <hr key={key} className="border-stone-200" />;
          case "embed": {
            const service = data.service;
            const embed = typeof data.embed === "string" ? data.embed : "";
            if (service === "youtube" && embed.includes("youtube")) {
              return (
                <div key={key} className="aspect-video w-full overflow-hidden rounded-lg border border-stone-200">
                  <iframe
                    title="YouTube embed"
                    src={embed.replace("http://", "https://")}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            if (embed && safeHttps(embed)) {
              return (
                <p key={key} className="text-sm">
                  <a href={embed} className="text-emerald-800 underline" rel="noopener noreferrer">
                    Open embed
                  </a>
                </p>
              );
            }
            return null;
          }
          case "table": {
            const content = Array.isArray(data.content) ? data.content : [];
            return (
              <div key={key} className="overflow-x-auto">
                <table className="min-w-full border border-stone-200 text-sm">
                  <tbody>
                    {content.map((row: unknown, ri: number) => (
                      <tr key={ri} className="odd:bg-stone-50">
                        {Array.isArray(row)
                          ? row.map((cell: unknown, ci: number) => {
                              const cellHtml =
                                sanitizeBlogInlineHtml(String(cell ?? "")) || "\u00a0";
                              return (
                                <td
                                  key={ci}
                                  className={`border border-stone-200 px-2 py-1 ${linkProse}`}
                                  // eslint-disable-next-line react/no-danger
                                  dangerouslySetInnerHTML={{ __html: cellHtml }}
                                />
                              );
                            })
                          : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          case "product": {
            const pid = typeof data.product_id === "string" ? data.product_id : "";
            const p = pid ? productMap.get(pid) : null;
            const hrefSlug = p?.slug || p?.id || pid;
            const name = p?.name || "Product";
            const img = safeHttps(p?.image_url);
            return (
              <aside
                key={key}
                className="flex flex-col gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-4 sm:flex-row sm:items-center"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-24 w-24 flex-shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-24 w-24 flex-shrink-0 rounded bg-stone-200" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-800">Featured product</div>
                  <div className="font-serif text-lg text-emerald-950">{name}</div>
                  {hrefSlug ? (
                    <Link
                      href={`/products/${hrefSlug}`}
                      className="inline-block text-sm font-bold text-emerald-800 underline"
                    >
                      View product
                    </Link>
                  ) : null}
                </div>
              </aside>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
