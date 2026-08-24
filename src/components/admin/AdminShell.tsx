"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { href: "/admin/calendrier", label: "Calendrier", icon: "calendar" },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: "list" },
  { href: "/admin/clients", label: "Clientes", icon: "people" },
  { href: "/admin/prestations", label: "Prestations", icon: "sparkle" },
  { href: "/admin/equipe", label: "Équipe", icon: "team" },
  { href: "/admin/parametres", label: "Paramètres", icon: "settings" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-svh lg:flex">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="scale-90 origin-left">
          <Logo compact />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="rounded-xl border border-line px-3 py-2 text-[10px] tracking-[0.18em] text-ink-soft uppercase"
        >
          {open ? "Fermer" : "Menu"}
        </button>
      </header>

      <nav
        id="admin-nav"
        aria-label="Navigation administration"
        className={`${open ? "block" : "hidden"} border-b border-line bg-cream/95 px-4 py-4 lg:sticky lg:top-0 lg:block lg:h-svh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 lg:px-5 lg:py-7`}
      >
        <Link href="/admin" className="hidden lg:block">
          <Logo compact />
        </Link>

        <ul className="mt-0 space-y-1 lg:mt-9">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[11px] tracking-[0.16em] uppercase transition-colors ${
                    active
                      ? "bg-terracotta text-cream"
                      : "text-ink-soft hover:bg-blush/35 hover:text-ink"
                  }`}
                >
                  <NavIcon name={link.icon} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 space-y-1 border-t border-line pt-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[11px] tracking-[0.16em] text-ink-soft uppercase transition-colors hover:text-ink"
          >
            Voir le site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[11px] tracking-[0.16em] text-ink-soft uppercase transition-colors hover:text-rose"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    dashboard: <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z" />,
    calendar: (
      <path d="M7 2v3M17 2v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5z" />
    ),
    list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
    people: (
      <path d="M16 19v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V19M9.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1.5a4 4 0 0 0-3-3.87M16 3.63a4 4 0 0 1 0 7.75" />
    ),
    sparkle: <path d="M12 4l1.8 4.7L18.5 10.5 13.8 12.3 12 17l-1.8-4.7L5.5 10.5l4.7-1.8L12 4z" />,
    team: (
      <path d="M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20a7 7 0 0 1 14 0" />
    ),
    settings: (
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.5 12c0-.5-.05-1-.15-1.45l1.75-1.3-1.9-3.3-2.05.8a7.5 7.5 0 0 0-2.5-1.45L14.4 3h-3.8l-.25 2.3a7.5 7.5 0 0 0-2.5 1.45l-2.05-.8-1.9 3.3 1.75 1.3a7.6 7.6 0 0 0 0 2.9l-1.75 1.3 1.9 3.3 2.05-.8a7.5 7.5 0 0 0 2.5 1.45L10.6 21h3.8l.25-2.3a7.5 7.5 0 0 0 2.5-1.45l2.05.8 1.9-3.3-1.75-1.3c.1-.45.15-.95.15-1.45z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
