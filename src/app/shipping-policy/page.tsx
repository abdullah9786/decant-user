import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Decume shipping information — delivery timelines, charges, packaging details, and pan-India coverage for perfume decants.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Policy
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            Shipping Policy
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            Everything you need to know about how your order reaches you.
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Processing Time
              </h2>
              <p>
                All orders are processed within <strong>1–2 business days</strong>{" "}
                after payment confirmation. Orders placed on weekends or public
                holidays will be processed on the next business day.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Delivery Timeline
              </h2>
              <p>
                Once dispatched, standard delivery across India typically takes{" "}
                <strong>3–10 business days</strong> depending on your location.
                Metro cities may receive orders faster, while remote pin codes
                may take slightly longer.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Shipping Charges
              </h2>
              <p>
                Shipping charges, if applicable, are calculated at checkout based
                on your order value and delivery location. We occasionally offer
                free shipping promotions — keep an eye on our homepage for updates.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Packaging
              </h2>
              <p>
                Every decant is securely sealed, wrapped in bubble protection,
                and placed inside a rigid mailer or box to prevent leakage or
                damage during transit. We take packaging seriously — your
                fragrances arrive exactly as intended.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Order Tracking
              </h2>
              <p>
                Once your order is shipped, you can track it using your Order ID on
                our{" "}
                <a
                  href="/track-order"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Track Order
                </a>{" "}
                page. You will also receive email updates at key stages of delivery.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                Shipping Coverage
              </h2>
              <p>
                We currently ship to all serviceable pin codes across India. If
                your pin code is not serviceable by our courier partner, we will
                notify you and process a full refund.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <p className="text-sm text-gray-500">
                For any shipping-related queries, reach out to us at{" "}
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
