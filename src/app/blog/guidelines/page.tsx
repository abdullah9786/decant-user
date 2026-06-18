import Link from "next/link";

export const metadata = {
  title: "Blog guidelines | Decume",
  description: "How we handle community posts, moderation, and content safety on Decume.",
  alternates: { canonical: "https://decume.in/blog/guidelines" },
};

export default function BlogGuidelinesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-emerald-950">Community blog guidelines</h1>
      <p className="mt-4 text-stone-600">
        Posts you submit are reviewed before they appear publicly. By submitting content, you agree it may be
        edited for clarity, length, or policy compliance, and that you have the rights to share any text or images
        you include.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-stone-700">
        <li>No harassment, spam, or misleading claims about products or health.</li>
        <li>No affiliate links or promotional codes unless explicitly approved.</li>
        <li>Images must be yours or licensed for reuse; do not upload confidential or personal data.</li>
      </ul>
      <p className="mt-8 text-sm text-stone-500">
        See also our{" "}
        <Link href="/terms" className="font-semibold text-emerald-800 underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-semibold text-emerald-800 underline">
          Privacy
        </Link>
        .
      </p>
      <p className="mt-6">
        <Link href="/blog" className="font-bold text-emerald-800 underline">
          ← Back to blog
        </Link>
      </p>
    </div>
  );
}
