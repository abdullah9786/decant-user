import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, PenLine, Sparkles } from "lucide-react";
import { fetchPublishedBlogPosts, getBlogCardImageUrl } from "@/lib/server/blog";

export const metadata = {
  title: "Journal | Decume",
  description: "Fragrance decants, authenticity, and stories from Decume.",
  alternates: { canonical: "https://decume.in/blog" },
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const { items, total } = await fetchPublishedBlogPosts();

  return (
    <div className="min-h-[55vh]">
      {/* Hero — same horizontal rhythm as Navbar / Footer / homepage sections */}
      <section className="relative overflow-hidden border-b border-stone-200/90 bg-gradient-to-b from-white via-stone-50/40 to-[color:var(--surface-bg)] pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl md:h-96 md:w-96" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-100/40 blur-3xl" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-800 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Decume journal
              </div>
              <h1 className="mt-5 font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
                Stories, guides &amp; drops
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Notes on fragrance, authenticity, and community. Read the latest — or share your own after a quick
                review.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                <Link href="/blog/guidelines" className="font-semibold text-emerald-800 underline decoration-emerald-600/30 underline-offset-4 hover:decoration-emerald-700">
                  Community guidelines
                </Link>
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <Link
                href="/blog/write"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-900/20 sm:min-w-[11rem]"
              >
                <PenLine className="h-4 w-4 opacity-90" aria-hidden />
                Write a post
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/blog/me"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white/90 px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-sm backdrop-blur-sm transition hover:border-emerald-300/80 hover:bg-white sm:min-w-[11rem]"
              >
                <BookOpen className="h-4 w-4 text-emerald-700" aria-hidden />
                My posts
              </Link>
            </div>
          </div>

          {total > 0 ? (
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {total} {total === 1 ? "article" : "articles"}
            </p>
          ) : null}
        </div>
      </section>

      {/* Listing */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-stone-200 bg-white/60 px-8 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <BookOpen className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="mt-6 font-serif text-2xl text-emerald-950">Nothing published yet</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                We&apos;re lining up the first pieces. Check back soon — or start a draft and submit it for review.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/blog/write"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  <PenLine className="h-4 w-4" aria-hidden />
                  Write a post
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:border-emerald-300"
                >
                  Back to shop
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {items.map((post) => {
                const dateLabel = formatDate(post.published_at);
                const coverUrl = getBlogCardImageUrl(post);
                return (
                  <li key={post.id} className="min-w-0">
                    <article className="h-full">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-black/[0.02] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200/90 hover:shadow-lg hover:shadow-emerald-950/[0.06]"
                      >
                        {coverUrl ? (
                          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-stone-100">
                            <Image
                              src={coverUrl}
                              alt={post.title}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-1 flex-col p-6 md:p-7">
                          {post.author_name ? (
                            <span className="text-[11px] font-semibold text-slate-600">By {post.author_name}</span>
                          ) : null}
                          {dateLabel ? (
                            <time
                              dateTime={post.published_at ?? undefined}
                              className={`text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 ${post.author_name ? "mt-1" : ""}`}
                            >
                              {dateLabel}
                            </time>
                          ) : (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 ${post.author_name ? "mt-1" : ""}`}
                            >
                              Journal
                            </span>
                          )}
                          <h2 className="mt-3 font-serif text-xl leading-snug text-emerald-950 underline-offset-4 transition group-hover:text-emerald-900 group-hover:underline md:text-[1.35rem]">
                            {post.title}
                          </h2>
                          {post.excerpt ? (
                            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                              {post.excerpt}
                            </p>
                          ) : (
                            <p className="mt-3 flex-1 text-sm italic text-slate-400">Open to read more</p>
                          )}
                          <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800">
                            Read article
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                          </span>
                        </div>
                      </Link>
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
