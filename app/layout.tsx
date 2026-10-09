import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paliaproperty.in"),
  title: {
    default: "Palia Property Hub — Buy & Sell Agriculture Land in Palia Kalan, Lakhimpur Kheri",
    template: "%s | Palia Property Hub",
  },
  description:
    "Find verified sugarcane farms, paddy fields, residential plots, farmhouses & commercial land for sale in Palia Kalan, Sampurna Nagar, Mailani, Tikunia — Lakhimpur Kheri, Uttar Pradesh. Free property listings.",
  keywords: [
    "agriculture land for sale Palia Kalan",
    "sugarcane land Lakhimpur Kheri",
    "farmhouse near Dudhwa National Park",
    "buy farmland Sampurna Nagar",
    "property in Palia Kalan UP",
    "bigha land Lakhimpur Kheri",
    "khet zameen bikri Palia",
    "residential plot Palia Kalan",
    "commercial land Mailani",
    "khatauni verified land Lakhimpur",
    "Tikunia land for sale",
    "Sarda canal land",
    "Terai farm land UP",
  ],
  authors: [{ name: "Palia Property Hub", url: "https://paliaproperty.in" }],
  creator: "Palia Property Hub",
  publisher: "Palia Property Hub",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://paliaproperty.in",
    siteName: "Palia Property Hub",
    title: "Palia Property Hub — Buy & Sell Agriculture Land in Palia Kalan",
    description:
      "Verified sugarcane farms, paddy fields, farmhouses & plots in Palia Kalan & Lakhimpur Kheri. Free listings. Direct farmer contact.",
    images: [
      {
        url: "https://paliaproperty.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Palia Property Hub — Agriculture Land Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Palia Property Hub — Buy & Sell Agricultural Land in UP",
    description:
      "Find sugarcane farms, farmhouses & plots in Palia Kalan. Free listings, direct owner contact, Khatauni verified.",
    images: ["https://paliaproperty.in/og-image.jpg"],
  },
  alternates: {
    canonical: "https://paliaproperty.in",
  },
  other: {
    "geo.region": "IN-UP",
    "geo.placename": "Palia Kalan, Lakhimpur Kheri",
    "geo.position": "28.4328;80.5889",
    "ICBM": "28.4328, 80.5889",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F5132",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body
        className="min-h-screen bg-slate-bg antialiased"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-agri-green focus:shadow-lg"
        >
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
