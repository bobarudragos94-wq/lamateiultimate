import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

// Body face — humanist, warm, comfortable at small sizes.
const workSans = localFont({
  src: [
    { path: "../fonts/WorkSans-Regular.ttf", weight: "400" },
    { path: "../fonts/WorkSans-Bold.ttf", weight: "700" },
  ],
  variable: "--font-work-sans",
  display: "swap",
});

// Display face — condensed industrial signage type, used for headlines only.
const bigShoulders = localFont({
  src: [
    { path: "../fonts/BigShoulders-Regular.ttf", weight: "400" },
    { path: "../fonts/BigShoulders-Bold.ttf", weight: "700" },
  ],
  variable: "--font-big-shoulders",
  display: "swap",
});

// Utility face — inventory-tag mono for prices, codes and counts.
const plexMono = localFont({
  src: [
    { path: "../fonts/IBMPlexMono-Regular.ttf", weight: "400" },
    { path: "../fonts/IBMPlexMono-Bold.ttf", weight: "700" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (raw) {
    // tolerate a value without protocol (e.g. "myapp.vercel.app")
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      return new URL(candidate);
    } catch {
      console.warn(`Invalid NEXT_PUBLIC_APP_URL "${raw}", falling back to localhost`);
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Depozit Construct — Materiale de construcții",
    template: "%s | Depozit Construct",
  },
  description:
    "Comanzi materiale de construcții rapid, fără telefoane pierdute și mesaje uitate pe WhatsApp. Catalog complet, cereri de ofertă în câteva minute.",
  applicationName: "Depozit Construct",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Depozit Construct",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ro"
      className={`${workSans.variable} ${bigShoulders.variable} ${plexMono.variable}`}
    >
      <body className="font-sans">
        {children}
        <Toaster richColors position="top-center" closeButton />
        <PwaRegister />
      </body>
    </html>
  );
}
