import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ficusandfigs.com"),
  title: "Ficus and Figs — A Rustic 8-Bedroom Home",
  description:
    "A beautiful rustic 8-bedroom home sleeping 16 guests comfortably. Featuring a pool, garden, and perfect for big families, weddings, parties, and picnics.",
  keywords: [
    "Ficus and Figs",
    "Kiambu BnB",
    "8-bedroom house Kiambu",
    "rustic luxury home Kenya",
    "event venue Kiambu",
    "bridal pickup venue",
  ],
  icons: {
    icon: "/favicon-16x16.png",
    apple: "/android-chrome-192x192.png",
  },
  alternates: {
    canonical: "https://www.ficusandfigs.com/",
  },
  openGraph: {
    title: "Ficus and Figs — A Rustic 8-Bedroom Home",
    description:
      "A beautiful rustic 8-bedroom home sleeping 16 guests comfortably. Featuring a pool, garden, and perfect for big families, weddings, parties, and picnics.",
    url: "https://www.ficusandfigs.com/",
    siteName: "Ficus & Figs",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/IMG_9297.JPG.jpeg",
        width: 1200,
        height: 630,
        alt: "Ficus and Figs Luxury Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ficus and Figs — A Rustic 8-Bedroom Home",
    description:
      "A beautiful rustic 8-bedroom home sleeping 16 guests comfortably. Featuring a pool, garden, and perfect for big families, weddings, parties, and picnics.",
    images: ["/images/IMG_9297.JPG.jpeg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "name": "Ficus and Figs",
  "description":
    "A beautiful rustic 8-bedroom home sleeping 16 guests comfortably in Kiambu, Kenya. Featuring a pool, garden, and ideal for family retreats, weddings, and bridal pick-ups.",
  "url": "https://www.ficusandfigs.com/",
  "numberOfRooms": 8,
  "occupancy": {
    "@type": "QuantitativeValue",
    "maxValue": 16,
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Kiambu",
    "addressCountry": "KE",
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Private Pool", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Lush Gardens", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Event Venue", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Staff Quarters", "value": true },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="canonical" href="https://www.ficusandfigs.com/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-text font-body">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
