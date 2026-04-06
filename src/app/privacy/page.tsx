import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Decume privacy policy — how we collect, use, and protect your personal information when you use our perfume decant store.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-16">
            Last updated: April 2026
          </p>

          <div className="space-y-10 text-[15px] text-gray-700 leading-[1.85]">
            <p>
              At Decume, we respect your privacy and are committed to protecting
              the personal information you share with us. This policy explains
              what data we collect, how we use it, and your rights.
            </p>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                We collect information that you provide directly when using our
                website:
              </p>
              <ul className="space-y-2">
                {[
                  "Name, email address, and phone number (during checkout or registration)",
                  "Shipping address",
                  "Order details and transaction history",
                  "Account credentials (email and hashed password)",
                  "Communications you send to us (e.g. support emails)",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We may also automatically collect technical data such as browser
                type, device information, IP address, and pages visited through
                cookies and analytics tools (Google Analytics).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                2. How We Use Your Information
              </h2>
              <ul className="space-y-2">
                {[
                  "To process and fulfill your orders",
                  "To communicate order updates, delivery notifications, and support responses",
                  "To manage your account and provide personalized features",
                  "To improve our website, products, and customer experience",
                  "To prevent fraud and ensure security",
                  "To comply with legal obligations",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                3. Payment Information
              </h2>
              <p>
                All payments are processed securely through <strong>Razorpay</strong>.
                We do <strong>not</strong> store your credit/debit card numbers,
                UPI IDs, or bank account details on our servers. Payment data is
                handled entirely by Razorpay under their own security standards
                and PCI-DSS compliance.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                4. Data Sharing
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. We may
                share limited data with:
              </p>
              <ul className="space-y-2 mt-3">
                {[
                  "Courier partners (name, address, phone) to fulfill deliveries",
                  "Payment processors (Razorpay) to complete transactions",
                  "Analytics providers (Google Analytics) in anonymized form",
                  "Law enforcement, if required by law",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                5. Cookies & Analytics
              </h2>
              <p>
                We use cookies and similar technologies to enhance your browsing
                experience and gather usage analytics. You can disable cookies in
                your browser settings, though some features of the website may not
                function optimally without them.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                6. Data Retention
              </h2>
              <p>
                We retain your personal data for as long as your account is
                active or as needed to provide services, comply with legal
                obligations, and resolve disputes. You may request deletion of
                your account data by contacting us.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                7. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="space-y-2 mt-3">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your data (subject to legal requirements)",
                  "Withdraw consent for marketing communications at any time",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                8. Security
              </h2>
              <p>
                We implement reasonable technical and organizational measures to
                protect your personal information. However, no method of
                transmission over the internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-3">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will
                be posted on this page with an updated revision date. Continued
                use of Decume after changes constitutes acceptance.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <p className="text-sm text-gray-500">
                For privacy-related queries or data requests, contact us at{" "}
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
