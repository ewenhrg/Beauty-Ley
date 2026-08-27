import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, parseLocale } from "@/i18n/config";

function isLocale(value: string | null): value is (typeof LOCALES)[number] {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const fromQuery = url.searchParams.get("lang");

  if (isLocale(fromQuery)) {
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, fromQuery, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const response = NextResponse.next();
  if (!request.cookies.get(LOCALE_COOKIE)?.value) {
    response.cookies.set(LOCALE_COOKIE, parseLocale(DEFAULT_LOCALE), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  response.headers.set("Vary", "Cookie");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)"],
};
