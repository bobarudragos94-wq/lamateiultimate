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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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
