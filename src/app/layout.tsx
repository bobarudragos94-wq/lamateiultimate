import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
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
    <html lang="ro" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster richColors position="top-center" closeButton />
        <PwaRegister />
      </body>
    </html>
  );
}
