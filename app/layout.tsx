import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAGI System — NERV Central Dogma",
  description: "Sistema supercomputer MAGI — Melchior, Balthasar, Casper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
