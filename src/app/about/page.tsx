import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Decume — India's curated destination for authentic perfume decants. Our story, mission, and commitment to making luxury fragrances accessible.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            About Decume
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            The truth of fragrance, one decant at a time.
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <p>
              Decume was born from a simple frustration: discovering that a ₹10,000
              bottle doesn't suit you — after you've already bought it. We believe
              everyone deserves to experience luxury fragrances before committing
              to a full bottle, without compromise on authenticity or quality.
            </p>

            <p>
              We source every decant directly from authentic, sealed bottles of
              designer and niche perfume houses. Each fragrance is carefully
              hand-decanted, labelled, and shipped from our facility in India.
              What you receive is the exact same juice that comes in the original
              bottle — just in a more accessible size.
            </p>

            <div className="border-l-2 border-emerald-600 pl-6 my-12">
              <p className="text-lg font-serif text-emerald-950 italic">
                "Fragrance is deeply personal. We're here to help you find yours
                — without the risk."
              </p>
            </div>

            <h2 className="text-2xl font-serif text-emerald-950 pt-4">
              What We Stand For
            </h2>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-emerald-600 font-bold mt-0.5">01</span>
                <div>
                  <span className="font-bold text-emerald-950">Authenticity First</span>
                  <span className="text-gray-500"> — Every decant is sourced from genuine, sealed bottles. No
                  imitations, no grey market. Ever.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 font-bold mt-0.5">02</span>
                <div>
                  <span className="font-bold text-emerald-950">Fair Pricing</span>
                  <span className="text-gray-500"> — You pay for the fragrance, not the packaging. Our per-ml
                  pricing is transparent and competitive.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 font-bold mt-0.5">03</span>
                <div>
                  <span className="font-bold text-emerald-950">Discovery Over Hype</span>
                  <span className="text-gray-500"> — We curate fragrances worth experiencing, not just the ones
                  that trend. Our collections are built on olfactory merit.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 font-bold mt-0.5">04</span>
                <div>
                  <span className="font-bold text-emerald-950">Pan-India Access</span>
                  <span className="text-gray-500"> — Luxury fragrance discovery shouldn't be limited to metro
                  cities. We ship across India, carefully and quickly.</span>
                </div>
              </li>
            </ul>

            <h2 className="text-2xl font-serif text-emerald-950 pt-4">
              Get In Touch
            </h2>

            <p>
              Have a question, suggestion, or just want to talk fragrance? We'd love
              to hear from you.
            </p>
            <p>
              Email us at{" "}
              <a
                href="mailto:abdullahansari9768@gmail.com"
                className="text-emerald-600 underline underline-offset-4"
              >
                abdullahansari9768@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
