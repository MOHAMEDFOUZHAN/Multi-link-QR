import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F172A",
};

export const metadata: Metadata = {
  title: "Maple Connect — Unit of Maple Pro | Agency SaaS QR Platform",
  description:
    "Connected by Maple Connect (Unit of Maple Pro). Manage 100+ business clients, monitor subscription dates, toggle active/unpaid status, and generate permanent printed QR codes.",
  icons: {
    icon: "/assets/logo.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase Cloud for sub-50ms API handshake */}
        <link rel="preconnect" href="https://igbqdesjyepguqrluxlu.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://igbqdesjyepguqrluxlu.supabase.co" />
      </head>
      <body>{children}</body>
    </html>
  );
}
