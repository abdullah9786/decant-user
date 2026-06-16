import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verified Customer Reviews Policy",
  description:
    "Decume customer reviews are limited to verified buyers who received their order. Learn how we keep reviews genuine — one review per product, delivered-order requirement, and clear verified purchase badges.",
  alternates: { canonical: "https://decume.in/reviews-policy" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who can leave a review on Decume?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only logged-in customers who purchased the product and received a delivered order can submit a review. Guest checkout orders must be linked to the account before reviewing.",
      },
    },
    {
      "@type": "Question",
      name: "When can I review a product I bought?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reviews unlock after your order status is marked delivered and payment is confirmed. You cannot review items still in processing or transit.",
      },
    },
    {
      "@type": "Question",
      name: "How many reviews can I leave for one fragrance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One review per customer per product. Repeat purchases of the same fragrance do not create additional review slots.",
      },
    },
    {
      "@type": "Question",
      name: "What does the Verified purchase badge mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reviews with a Verified purchase badge are tied to a real delivered order on Decume. They are submitted by customers who bought and received that product.",
      },
    },
  ],
};

export default function ReviewsPolicyPage() {
  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Policy
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            Verified Customer Reviews
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            Last updated: April 2026
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <p className="text-base">
              We keep reviews useful by limiting them to real customers. Decume
              does not sell review placement, and we do not allow anonymous or
              unverified submissions on product pages.
            </p>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
              <p className="text-emerald-950 font-medium">
                In short: customer reviews require a verified purchase and a
                delivered order. Each customer may submit one review per
                product.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                1. Verified purchase only
              </h2>
              <p>
                A customer review can only be submitted by a logged-in user whose
                account has at least one <strong>paid, delivered</strong> order
                containing that product. We verify this on our servers before a
                review is accepted — the browser cannot bypass this check.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                2. Delivered orders
              </h2>
              <p>
                Reviews unlock after delivery, not at checkout. This gives you
                time to wear the fragrance and share an honest experience. Orders
                that are pending, processing, shipped-but-not-delivered, cancelled,
                or refunded do not qualify.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                3. One review per customer, per product
              </h2>
              <p>
                If you buy the same fragrance again, you may not submit a second
                review for that product. Your original review remains visible on
                the product page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                4. Verified purchase badge
              </h2>
              <p>
                Reviews from qualifying customer orders display a{" "}
                <strong>Verified purchase</strong> badge. That badge means the
                review is linked to a real order on Decume — not a third-party
                incentive or imported rating.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                5. Editorial reviews (if shown)
              </h2>
              <p>
                From time to time we may publish editorial or seeded reviews for
                products with no customer feedback yet. These are clearly
                distinguished from customer submissions and do not carry a Verified
                purchase badge. They are never presented as paid customer ratings.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                6. Moderation
              </h2>
              <p>
                We may hide or remove reviews that are abusive, spam, off-topic,
                or clearly unrelated to the product purchased. We do not edit
                review text to change the customer&apos;s rating or sentiment.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                7. Report a concern
              </h2>
              <p>
                If you believe a review is misleading or violates this policy,
                contact us at{" "}
                <a
                  href="mailto:orders@decume.in"
                  className="text-emerald-600 underline underline-offset-4 font-medium"
                >
                  orders@decume.in
                </a>{" "}
                with the product name and review details.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-10 space-y-4">
              <p className="text-sm text-gray-500">
                Product authenticity (sourcing, decanting, and brand disclaimers)
                is covered separately in our{" "}
                <Link
                  href="/authenticity"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Authenticity &amp; Sourcing policy
                </Link>
                .
              </p>
              <p className="text-sm text-gray-500">
                Questions about reviews? Email{" "}
                <a
                  href="mailto:orders@decume.in"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  orders@decume.in
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
