import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

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
      <body className="antialiased flex flex-col" style={{ height: "100dvh" }}>
        <Nav />
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
