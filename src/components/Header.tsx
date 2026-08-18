"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BookingButton } from "./BookingButton";
import { nav, salon } from "@/data/salon";
import { InstagramIcon } from "./SocialIcons";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const home = pathname === "/";

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = home && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 isolate transition-colors duration-300 ${
        light ? "bg-transparent text-cream" : "bg-cream/92 text-ink shadow-soft backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link
          href="/"
          aria-label="Beauty Ley, accueil"
          className="relative z-10 transition-transform duration-300 hover:scale-[1.03]"
        >
          <Logo inverted={light} compact />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className={`nav-link text-[11px] tracking-[0.22em] uppercase transition-colors ${
                  active ? "text-terracotta" : light ? "text-cream/80 hover:text-cream" : "text-ink-soft hover:text-rose"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={salon.social.instagram.href}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram Beauty Ley"
            className={light ? "text-cream/80 hover:text-cream" : "text-ink-soft hover:text-ink"}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <BookingButton variant={light ? "light" : "solid"} />
        </div>

        <button
          type="button"
          className="relative z-10 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-6 flex-col gap-1.5">
            <span className={`block h-px w-full origin-center transition ${light && !open ? "bg-cream" : "bg-ink"} ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-px w-full transition ${light && !open ? "bg-cream" : "bg-ink"} ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-full origin-center transition ${light && !open ? "bg-cream" : "bg-ink"} ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line bg-cream lg:hidden"
      >
        <nav className="flex flex-col px-6 py-8" aria-label="Navigation mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-line py-4 text-sm tracking-[0.2em] text-ink uppercase"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-8">
            <BookingButton className="w-full" />
          </div>
        </nav>
      </div>
    </header>
  );
}
