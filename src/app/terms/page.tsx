import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing your use of Decume and purchases of perfume decants.",
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            Last updated: April 2026
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Decume website (decume.in) and placing
                orders, you agree to be bound by these Terms & Conditions. If you
                do not agree, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                2. Products
              </h2>
              <p>
                Decume sells perfume decants — smaller portions of authentic
                fragrances sourced from sealed, original bottles. We are not
                affiliated with, endorsed by, or officially connected to any
                fragrance brand. All brand names and trademarks are the property
                of their respective owners and are used for identification
                purposes only.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                3. Pricing & Payment
              </h2>
              <p>
                All prices are listed in Indian Rupees (₹) and are inclusive of
                applicable taxes unless stated otherwise. We reserve the right to
                update pricing at any time without prior notice. Payment is
                processed securely through Razorpay. We do not store your card or
                bank details.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                4. Orders & Cancellations
              </h2>
              <p>
                Once an order is placed and payment is confirmed, it enters our
                processing queue. You may cancel an order within{" "}
                <strong>24 hours</strong> of placing it, provided it has not
                already been dispatched. Cancellations can be initiated from the
                Track Order page or your Order History. Refunds for cancelled
                orders are processed to the original payment method within 5–7
                business days.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                5. Shipping & Delivery
              </h2>
              <p>
                We ship across India. Estimated delivery timelines are provided
                at checkout and are subject to courier partner availability and
                your location. Decume is not responsible for delays caused by
                courier services, natural disasters, or events beyond our
                control. Please refer to our{" "}
                <a
                  href="/shipping-policy"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Shipping Policy
                </a>{" "}
                for full details.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                6. Returns & Replacements
              </h2>
              <p>
                Due to the nature of our products, we do not accept returns based
                on fragrance preference. Replacements are offered for damaged,
                missing, tampered, or leaked products when reported within 24
                hours of delivery. Please see our{" "}
                <a
                  href="/return-policy"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Return & Replacement Policy
                </a>{" "}
                for details.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                7. User Accounts
              </h2>
              <p>
                You may create an account to manage orders and access additional
                features. You are responsible for maintaining the confidentiality
                of your account credentials. Guest checkout is also available
                without creating an account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                8. Intellectual Property
              </h2>
              <p>
                All content on the Decume website — including text, graphics,
                logos, images, and software — is the property of Decume and is
                protected by applicable intellectual property laws. You may not
                reproduce, distribute, or create derivative works without our
                written consent.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                9. Limitation of Liability
              </h2>
              <p>
                Decume shall not be liable for any indirect, incidental, or
                consequential damages arising from your use of our website or
                products. Our total liability in any claim shall not exceed the
                amount paid by you for the specific order in question.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                10. Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of India. Any disputes
                arising from these Terms shall be subject to the exclusive
                jurisdiction of the courts in India.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                11. Changes to Terms
              </h2>
              <p>
                We reserve the right to update these Terms at any time. Changes
                become effective upon posting to this page. Continued use of
                Decume after changes constitutes acceptance of the updated Terms.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <p className="text-sm text-gray-500">
                Questions about these terms? Contact us at{" "}
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
