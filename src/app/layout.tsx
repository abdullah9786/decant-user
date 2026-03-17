import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'react-hot-toast';
import ScrollToTop from "@/components/layout/ScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

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
        <Navbar />
        <Toaster position="top-right" />
        <ScrollToTop />
        <main className="bg-[color:var(--surface-bg)] backdrop-blur-2xl border-y border-[color:var(--surface-border)] shadow-[var(--surface-shadow)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
