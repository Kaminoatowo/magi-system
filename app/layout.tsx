import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAGI System — NERV Central Dogma",
  description: "MAGI supercomputer system — Melchior, Balthasar, Casper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
