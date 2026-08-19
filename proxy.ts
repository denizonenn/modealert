import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { LOCALES, resolveLocale, isLocale } from "@/lib/i18n/config";

const LOCALE_COOKIE = "modealert-locale";

// A year — this only holds an explicit language choice, so it should
// outlive a session.
const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// Paths that must never be locale-prefixed: API routes, and the
// machine-readable files whose URLs are referenced externally
// (crawlers, RSS readers, Riot's domain verification, security
// researchers). Redirecting these to /en/... would break consumers
// that already have the canonical URL.
const UNPREFIXED_PATHS = [
  "/api",
  "/feed.xml",
  "/sitemap.xml",
  "/robots.txt",
  "/riot.txt",
  "/.well-known",
  "/opengraph-image",
  "/icon",
  "/apple-icon",
  "/favicon.ico",
];

function isUnprefixed(pathname: string): boolean {
  return UNPREFIXED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUnprefixed(pathname)) {
    return NextResponse.next();
  }

  const hasLocale = LOCALES.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) {
    return NextResponse.next();
  }

  // An explicit choice (set by the language switcher) always beats
  // the browser's Accept-Language header — otherwise a Turkish
  // browser could never stay on the English site.
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;

  const locale =
    chosen && isLocale(chosen)
      ? chosen
      : resolveLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);

  // Remember the detected locale so the next request skips
  // Accept-Language negotiation entirely.
  if (!chosen) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  // Everything except Next's internals and files with an extension
  // (static assets in public/).
  matcher: ["/((?!_next|.*\\.[^/]+$).*)"],
};
