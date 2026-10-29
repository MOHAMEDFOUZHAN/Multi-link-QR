import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maple Connect QR — Multi-Client SaaS Agency Platform",
  description:
    "Manage 100+ business clients, monitor subscription dates, toggle active/unpaid status, and generate permanent printed QR codes.",
  icons: {
    icon: "/assets/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

