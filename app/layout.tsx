import { LoadingProvider } from "@/contexts/LoadingContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkinIntel",
  description: "AI analiza kože i edukativne preporuke za njegu kože.",
  metadataBase: new URL("https://skinintel.app"),
  openGraph: {
    title: "SkinIntel",
    description: "AI analiza kože i edukativne preporuke za njegu kože.",
    url: "https://skinintel.app",
    siteName: "SkinIntel",
    images: [
      {
        url: "https://skinintel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SkinIntel",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkinIntel",
    description: "AI analiza kože i edukativne preporuke za njegu kože.",
    images: ["https://skinintel.app/og-image.jpg"],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
