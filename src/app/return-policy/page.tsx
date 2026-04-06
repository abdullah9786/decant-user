import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Replacement Policy",
  description:
    "Decume replacement policy — how to request a replacement for damaged, missing, tampered, or leaked perfume decant orders.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Policy
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            Return & Replacement Policy
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            Your satisfaction is our priority. Here's how we handle issues with
            your order.
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <p className="text-sm text-gray-500">
              Due to the nature of our products (perfume decants), we do not
              offer returns or refunds on the basis of fragrance preference,
              scent dissatisfaction, or change of mind. However, we do offer
              free replacements for qualifying issues as described below.
            </p>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                When Is a Replacement Eligible?
              </h2>
              <p className="mb-4">
                We offer <strong>free replacements</strong> for orders affected
                by any of the following issues:
              </p>
              <ul className="space-y-3">
                {[
                  {
                    title: "Damaged Product",
                    desc: "Vial is cracked, broken, or arrived in unusable condition.",
                  },
                  {
                    title: "Missing Item",
                    desc: "One or more items from your order are missing from the package.",
                  },
                  {
                    title: "Tampered Package",
                    desc: "The package shows clear signs of being opened or tampered with before delivery.",
                  },
                  {
                    title: "Leakage Issue",
                    desc: "The decant has leaked during transit, resulting in significant product loss.",
                  },
                  {
                    title: "Product Not Received",
                    desc: "Tracking shows delivered but you have not received the package.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950">
                        {item.title}
                      </span>{" "}
                      <span className="text-gray-500">— {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                How to Request a Replacement
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Email us at{" "}
                    <a
                      href="mailto:abdullahansari9768@gmail.com"
                      className="text-emerald-600 underline underline-offset-4 font-medium"
                    >
                      abdullahansari9768@gmail.com
                    </a>{" "}
                    within <strong>24 hours</strong> of receiving your order.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Include your <strong>Order ID</strong>, a{" "}
                    <strong>clear photo or video</strong> of the issue, and a
                    brief description of the problem.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Our team will review your request and respond within{" "}
                    <strong>24–48 hours</strong>. If approved, a replacement will
                    be dispatched at no extra cost.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-emerald-600 pl-6 my-8">
              <p className="text-base font-serif text-emerald-950 italic">
                Replacement requests must be raised within 24 hours of delivery.
                Requests received after this window may not be eligible for a
                replacement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Order Cancellation
              </h2>
              <p>
                You can cancel your order within <strong>24 hours</strong> of
                placing it, provided it has not already been shipped. Cancellations
                can be initiated from the{" "}
                <a
                  href="/track-order"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Track Order
                </a>{" "}
                page or your{" "}
                <a
                  href="/orders"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Order History
                </a>
                . If payment was already captured, a full refund will be processed
                to your original payment method.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <p className="text-sm text-gray-500">
                For any queries regarding replacements, email us at{" "}
                <a
                  href="mailto:abdullahansari9768@gmail.com"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  abdullahansari9768@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
