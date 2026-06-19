import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";

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
      <body className="antialiased flex flex-col" style={{ height: "100dvh" }} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <Nav />
            <main className="flex-1 min-h-0">
              {children}
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
