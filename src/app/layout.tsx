import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ClientToaster from "@/components/ui/ClientToaster";
import ScrollToTop from "@/components/ui/ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://decume.in"),
  title: {
    default: "Decume | Premium Perfume Decants India",
    template: "%s | Decume",
  },
  description:
    "Experience luxury fragrances with our curated collection of authentic perfume decants. Authentic, affordable, and accessible across India.",
  keywords: [
    "perfume decants",
    "perfume samples India",
    "fragrance decants",
    "designer perfume India",
    "niche perfume decant",
    "buy perfume decant online",
    "trial size perfume",
    "Decume",
  ],
  icons: {
    icon: "https://ik.imagekit.io/smhon4suw/image.png?updatedAt=1774281578448",
    apple:
      "https://ik.imagekit.io/smhon4suw/image.png?updatedAt=1774281578448",
  },
  authors: [{ name: "Decume" }],
  creator: "Decume",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://decume.in",
    siteName: "Decume",
    title: "Decume | Premium Perfume Decants India",
    description:
      "Authentic perfume decants from designer and niche houses. Trial sizes, fair pricing, pan-India delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decume | Premium Perfume Decants India",
    description:
      "Authentic perfume decants from designer and niche houses. Trial sizes, fair pricing, pan-India delivery.",
  },
  alternates: {
    canonical: "https://decume.in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans text-[color:var(--text-primary)] antialiased`}>
        <ScrollToTop />
        <Navbar />
        <ClientToaster />
        <main className="bg-[color:var(--surface-bg)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
