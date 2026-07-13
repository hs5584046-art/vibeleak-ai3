import type { Metadata, Viewport } from "next";
import "./globals.css";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "VibeLytix — Personality, Relationships, Career & Growth",
    template: "%s | VibeLytix"
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "Self discovery",
  keywords: [
    "personality test",
    "self discovery",
    "personality assessment",
    "relationship compatibility",
    "career strengths",
    "personal growth"
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "VibeLytix — Understand the pattern behind who you are",
    description: siteConfig.tagline,
    siteName: siteConfig.name,
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeLytix",
    description: siteConfig.tagline
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09070f" },
    { media: "(prefers-color-scheme: light)", color: "#f7f5fb" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
