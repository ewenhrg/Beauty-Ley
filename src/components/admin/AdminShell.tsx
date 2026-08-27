"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/Logo";
import { ADMIN_NAV, type AdminPageId } from "@/server/admin-pages";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useT } from "@/i18n/I18nProvider";
import { adminNavKey } from "@/i18n/keys";

export function AdminShell({
  children,
  name,
  pages,
  homeHref,
}: {
  children: ReactNode;
  name: string;
  pages: AdminPageId[];
  homeHref: string;
}) {
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const allowed = new Set(pages);
  const links = ADMIN_NAV.filter((link) => allowed.has(link.id));

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const current = links.find((link) => isActive(link.href));

  return (
    <div className="min-h-svh lg:flex">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
        <Link href={homeHref} className="min-w-0">
          <Logo compact />
        </Link>
        <p className="min-w-0 truncate text-[11px] tracking-[0.16em] text-ink-soft uppercase">
          {current ? t(adminNavKey(current.id)) : "Admin"}
        </p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-line px-3 text-[10px] tracking-[0.18em] text-ink uppercase"
        >
          {open ? t("admin.close") : t("admin.menu")}
        </button>
      </header>

      {open ? (
        <button
          type="button"
          aria-label={t("admin.closeMenu")}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      ) : null}

      <nav
        id="admin-nav"
        aria-label={t("admin.navAria")}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,86vw)] flex-col overflow-y-auto border-r border-line bg-cream px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-soft transition-transform duration-300 lg:static lg:z-auto lg:h-svh lg:w-64 lg:shrink-0 lg:translate-x-0 lg:px-5 lg:py-7 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link href={homeHref} className="hidden lg:block" onClick={() => setOpen(false)}>
          <Logo compact />
        </Link>
        <p className="mt-4 hidden truncate text-[11px] tracking-[0.16em] text-ink-soft uppercase lg:block">
          {name}
        </p>

        <ul className="mt-0 space-y-1 lg:mt-9">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-[12px] tracking-[0.16em] uppercase transition-colors ${
                    active
                      ? "bg-terracotta text-cream"
                      : "text-ink-soft hover:bg-blush/35 hover:text-ink"
                  }`}
                >
                  <NavIcon name={link.icon} />
                  {t(adminNavKey(link.id))}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto space-y-1 border-t border-line pt-5">
          <div className="px-1 pb-3">
            <LanguageSwitcher compact />
          </div>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-[12px] tracking-[0.16em] text-ink-soft uppercase transition-colors hover:text-ink"
          >
            {t("admin.viewSite")}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] tracking-[0.16em] text-ink-soft uppercase transition-colors hover:text-rose"
            >
              {t("admin.logout")}
            </button>
          </form>
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-10">
        {children}
      </main>
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
    team: <path d="M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20a7 7 0 0 1 14 0" />,
    settings: (
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.5 12c0-.5-.05-1-.15-1.45l1.75-1.3-1.9-3.3-2.05.8a7.5 7.5 0 0 0-2.5-1.45L14.4 3h-3.8l-.25 2.3a7.5 7.5 0 0 0-2.5 1.45l-2.05-.8-1.9 3.3 1.75 1.3a7.6 7.6 0 0 0 0 2.9l-1.75 1.3 1.9 3.3 2.05-.8a7.5 7.5 0 0 0 2.5 1.45L10.6 21h3.8l.25-2.3a7.5 7.5 0 0 0-2.5-1.45l2.05.8 1.9-3.3-1.75-1.3c.1-.45.15-.95.15-1.45z" />
    ),
    users: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
