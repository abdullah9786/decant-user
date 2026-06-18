import { cacheFetchOptions } from "@/lib/cacheConfig";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type BlogSeo = {
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  canonical_path?: string | null;
  noindex?: boolean;
};

export type BlogPostDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  status: string;
  content_mode: "blocks" | "admin_html";
  blocks?: { blocks?: unknown[] } | null;
  html_body?: string | null;
  author_id: string;
  author_name?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  seo?: BlogSeo;
};

export type BlogListDTO = { items: BlogPostDTO[]; total: number };

function safeHttpsUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const t = url.trim();
  if (!t.startsWith("https://")) return null;
  return t;
}

function firstHttpsImgFromHtml(html: string | null | undefined): string | null {
  if (!html || typeof html !== "string") return null;
  const m = html.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);
  return m?.[1] ? safeHttpsUrl(m[1]) : null;
}

/** Cover image for listing cards: SEO og:image, else first https image block. */
export function getBlogCardImageUrl(post: BlogPostDTO): string | null {
  const og = safeHttpsUrl(post.seo?.og_image ?? undefined);
  if (og) return og;
  const blocks = post.blocks?.blocks;
  if (Array.isArray(blocks)) {
    for (const raw of blocks) {
      if (!raw || typeof raw !== "object") continue;
      const b = raw as { type?: string; data?: Record<string, unknown> };
      if (b.type !== "image") continue;
      const data = b.data ?? {};
      const file = data.file as { url?: string } | undefined;
      const fromFile = safeHttpsUrl(file?.url);
      if (fromFile) return fromFile;
      const fromData = safeHttpsUrl(typeof data.url === "string" ? data.url : undefined);
      if (fromData) return fromData;
    }
  }
  const fromHtml = firstHttpsImgFromHtml(post.html_body ?? undefined);
  if (fromHtml) return fromHtml;
  return null;
}

export async function fetchPublishedBlogPosts(): Promise<BlogListDTO> {
  try {
    const res = await fetch(`${API_URL}/blog?limit=50`, {
      ...cacheFetchOptions(["blog-list"]),
    });
    if (!res.ok) return { items: [], total: 0 };
    return res.json();
  } catch {
    return { items: [], total: 0 };
  }
}

export async function fetchPublishedBlogPost(slug: string): Promise<BlogPostDTO | null> {
  try {
    const res = await fetch(`${API_URL}/blog/${encodeURIComponent(slug)}`, {
      ...cacheFetchOptions(["blog-list", `blog-post-${slug}`]),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchProductForBlog(productId: string): Promise<{
  id?: string;
  slug?: string;
  name?: string;
  image_url?: string;
} | null> {
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(productId)}`, {
      ...cacheFetchOptions(["blog-list"]),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
