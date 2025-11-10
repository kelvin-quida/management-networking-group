import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup", "/register", "/pending", "/intentions", "/intentions/status", "/api/auth", "/api/intentions", "/api/intentions/status"];

const memberRoutes = ["/dashboard", "/meetings", "/notices", "/profile", "/thanks", "/one-on-ones"];

const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const isMemberRoute = memberRoutes.some((route) => pathname.startsWith(route));

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  const sessionToken = request.cookies.get("better-auth.session_token");

  if ((isMemberRoute || isAdminRoute) && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
