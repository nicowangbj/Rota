import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the effective path
  const localePrefix = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  const effectivePath = localePrefix
    ? pathname.slice(`/${localePrefix}`.length) || "/"
    : pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login"];
  const isPublic = publicPaths.includes(effectivePath);
  const sessionCookie = request.cookies.get("session")?.value;

  // Unauthenticated user trying to access protected route -> login
  if (localePrefix && !isPublic && !sessionCookie) {
    return NextResponse.redirect(
      new URL(`/${localePrefix}/login`, request.url)
    );
  }

  // Authenticated user on /login -> redirect into app
  if (localePrefix && effectivePath === "/login" && sessionCookie) {
    return NextResponse.redirect(
      new URL(`/${localePrefix}/welcome`, request.url)
    );
  }

  // Let next-intl handle locale detection and root redirect
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
