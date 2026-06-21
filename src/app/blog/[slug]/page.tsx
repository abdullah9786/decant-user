import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogBlocks, { type BlogBlocksPayload } from "@/components/blog/BlogBlocks";
import BlogHtmlBody from "@/components/blog/BlogHtmlBody";
import { fetchPublishedBlogPost } from "@/lib/server/blog";

const SITE = "https://decume.in";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedBlogPost(slug);
  if (!post) return { title: "Post not found" };
  const seo = post.seo || {};
  const title = seo.meta_title || post.title;
  const description = seo.meta_description || post.excerpt || undefined;
  const canonical = seo.canonical_path?.startsWith("http")
    ? seo.canonical_path
    : `${SITE}/blog/${post.slug}`;
  return {
    title: `${title} | Decume`,
    description: description || undefined,
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
    alternates: { canonical },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPublishedBlogPost(slug);
  if (!post) notFound();

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    image: post.seo?.og_image || undefined,
    ...(post.author_name
      ? { author: { "@type": "Person", name: post.author_name } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Decume",
      url: SITE,
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE}/blog/${post.slug}` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <nav className="text-sm text-stone-500">
        <Link href="/blog" className="font-semibold text-emerald-800 hover:underline">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{post.title}</span>
      </nav>
      <header className="mt-6 border-b border-stone-200 pb-8">
        <h1 className="font-serif text-4xl text-emerald-950">{post.title}</h1>
        {post.excerpt ? <p className="mt-4 text-lg text-stone-600">{post.excerpt}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-stone-400">
          {post.author_name ? (
            <span className="font-semibold text-stone-600 normal-case tracking-normal">
              By {post.author_name}
            </span>
          ) : null}
          {post.author_name && post.published_at ? <span aria-hidden className="text-stone-300">·</span> : null}
          {post.published_at ? (
            <time dateTime={post.published_at} suppressHydrationWarning>
              {new Date(post.published_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          ) : null}
        </div>
      </header>
      <div className="prose prose-stone mt-10 max-w-none">
        {post.content_mode === "admin_html" && post.html_body ? (
          <BlogHtmlBody html={post.html_body} />
        ) : post.blocks ? (
          <BlogBlocks blocks={post.blocks as BlogBlocksPayload} />
        ) : null}
      </div>
    </article>
  );
}
