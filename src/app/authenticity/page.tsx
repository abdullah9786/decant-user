import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authenticity & Sourcing Policy",
  description:
    "Every Decume decant is hand-poured from a genuine, sealed bottle of the original brand. We do not sell counterfeit, replica, fake, knock-off, imitation, or inspired-by products. Read our full authenticity and sourcing policy.",
  alternates: { canonical: "https://decume.in/authenticity" },
};

export default function AuthenticityPage() {
  return (
    <div className="bg-white">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Policy
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            Authenticity &amp; Sourcing
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            Last updated: April 2026
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <p className="text-base">
              Authenticity is the foundation of Decume. This page exists so
              customers, brand owners, and policy reviewers know exactly how we
              operate &mdash; from the bottle we buy to the vial we ship.
            </p>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                1. All Perfumes Are Authentic
              </h2>
              <p>
                Every fragrance offered on Decume is the genuine product of the
                brand named on its listing. We do not sell, manufacture, or
                relabel counterfeit, replica, knock-off, imitation, clone,
                faux, mirror-image, fake, or &ldquo;inspired-by&rdquo; products.
                If a product page references a fragrance by its brand name, the
                liquid inside the vial is exactly that fragrance &mdash; nothing
                else.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                2. Sourced from Original Retail Bottles
              </h2>
              <p>
                Decume purchases every bottle through authorised retail channels
                in India and abroad &mdash; including official boutiques,
                authorised distributors, and authorised online retailers.
                Bottles arrive sealed in their original brand packaging and are
                only opened in our facility for the decanting process. We never
                source from grey-market resellers, unauthorised inventory, or
                third-party refillers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                3. Hand-Poured into Smaller Decants
              </h2>
              <p>
                A &ldquo;decant&rdquo; is a small portion of a fragrance
                transferred from a larger original bottle into a smaller vial.
                Our process:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      Sealed original bottle
                    </span>{" "}
                    <span className="text-gray-500">
                      &mdash; we begin with a genuine, untampered bottle from
                      the brand.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      Hand-poured in-house
                    </span>{" "}
                    <span className="text-gray-500">
                      &mdash; the fragrance is transferred under hygienic
                      conditions into a Decume-branded glass vial.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      Decume packaging
                    </span>{" "}
                    <span className="text-gray-500">
                      &mdash; vial, label, and outer packaging are produced by
                      Decume. They are not the brand&rsquo;s official packaging
                      and are clearly marked as Decume&rsquo;s.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      Same fragrance, smaller size
                    </span>{" "}
                    <span className="text-gray-500">
                      &mdash; the only difference between our decant and the
                      retail bottle is the volume and the container. The
                      fragrance itself is unchanged.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 my-12">
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                4. No Counterfeit, Fake, or Replica Products
              </h2>
              <p className="mb-4">
                Decume does not sell, list, or distribute any of the following
                under any circumstance:
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                <li>&bull; Counterfeit goods</li>
                <li>&bull; Replicas</li>
                <li>&bull; Knock-offs</li>
                <li>&bull; Imitations</li>
                <li>&bull; Clones</li>
                <li>&bull; Faux fragrances</li>
                <li>&bull; Mirror-image products</li>
                <li>&bull; Fake or relabelled goods</li>
                <li>&bull; &ldquo;Inspired-by&rdquo; perfumes</li>
                <li>&bull; &ldquo;Smells-like&rdquo; alternatives</li>
                <li>&bull; &ldquo;Type-of&rdquo; or &ldquo;our-version-of&rdquo; products</li>
                <li>&bull; Unauthorised refills</li>
              </ul>
              <p className="mt-4 text-sm">
                If you ever believe a Decume listing falls into any of the
                above categories, please write to us immediately at{" "}
                <a
                  href="mailto:orders@decume.in"
                  className="text-emerald-600 underline underline-offset-4 font-medium"
                >
                  orders@decume.in
                </a>{" "}
                and we will investigate and remove the listing within 24 hours
                if substantiated.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                5. Trademarks &amp; Brand Names
              </h2>
              <p>
                All trademarks, brand names, logos, and product names referenced
                on the Decume website are the property of their respective
                owners. They are used solely to identify the original fragrance
                from which a decant is poured, in line with the principle of
                nominative fair use.
              </p>
              <p className="mt-4">
                Decume is an independent perfume decanting service.{" "}
                <strong>
                  We are not affiliated with, endorsed by, sponsored by, or
                  officially connected to any of the fragrance houses or brands
                  whose products we decant.
                </strong>{" "}
                The Decume vial, label, and packaging are produced by Decume
                and are not the brand&rsquo;s official packaging.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                6. Verification on Request
              </h2>
              <p>
                For any order, the customer (or the brand owner whose fragrance
                we have decanted) may request sourcing verification. Email{" "}
                <a
                  href="mailto:orders@decume.in"
                  className="text-emerald-600 underline underline-offset-4 font-medium"
                >
                  orders@decume.in
                </a>{" "}
                with the Order ID and we will share, where available:
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <span className="text-gray-600">
                    A photograph of the source bottle the decant was poured from.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <span className="text-gray-600">
                    The retail channel through which the bottle was procured.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                  <span className="text-gray-600">
                    A redacted purchase invoice (price and account details
                    removed) demonstrating legitimate sourcing.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                7. Reporting a Concern
              </h2>
              <p>
                Customers, rights holders, and platform reviewers can reach out
                to us at{" "}
                <a
                  href="mailto:orders@decume.in"
                  className="text-emerald-600 underline underline-offset-4 font-medium"
                >
                  orders@decume.in
                </a>{" "}
                or call{" "}
                <a
                  href="tel:+919768188453"
                  className="text-emerald-600 underline underline-offset-4 font-medium"
                >
                  +91 97681 88453
                </a>{" "}
                with any authenticity concern, takedown request, or
                clarification. We respond to authenticity-related queries
                within one business day and treat brand-owner requests with the
                highest priority.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <p className="text-sm text-gray-500">
                Questions about this policy? Contact us at{" "}
                <a
                  href="mailto:orders@decume.in"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  orders@decume.in
                </a>
                . For how we handle customer reviews and verified purchases, see
                our{" "}
                <Link
                  href="/reviews-policy"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Verified Customer Reviews policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
