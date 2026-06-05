import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Moon Mart - Online Shopping in Pakistan | Best Deals & Prices",
    template: "%s | Moon Mart",
  },
  description:
    "Shop online at Moon Mart for electronics, fashion, beauty, home & living, and more. Get the best prices, fast delivery, and easy returns across Pakistan.",
  keywords: [
    "online shopping",
    "Pakistan",
    "electronics",
    "fashion",
    "Moon Mart",
    "best deals",
    "free delivery",
  ],
  openGraph: {
    title: "Moon Mart - Online Shopping in Pakistan",
    description:
      "Discover amazing deals on electronics, fashion, beauty, and more at Moon Mart.",
    type: "website",
    locale: "en_PK",
    siteName: "Moon Mart",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
