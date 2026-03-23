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
  title: "Decume | Premium Perfume Decants India",
  description: "Experience luxury fragrances with our curated collection of authentic perfume decants. Authentic, affordable, and accessible across India.",
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
