import type { Metadata } from "next";
import Link from "next/link";
import { cormorant, outfit } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 · Beauty Ley Hurghada",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <main className="flex min-h-svh flex-col items-center justify-center px-5 text-center">
          <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">Beauty Ley</p>
          <h1 className="font-display mt-4 text-5xl">Page not found</h1>
          <Link
            href="/"
            className="mt-8 inline-block text-[11px] tracking-[0.22em] text-rose uppercase hover:text-ink"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
