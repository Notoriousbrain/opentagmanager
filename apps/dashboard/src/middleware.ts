import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = [
  "/signin",
  "/callback",
  "/verify",
  "/reset",
  "/forgot",
  "/magic",
];
const PROTECTED_PREFIXES = ["/dashboard", "/org", "/account"];

const isAuthRoute = (p: string) =>
  AUTH_ROUTES.some((r) => p === r || p.startsWith(r + "/"));
const isProtectedRoute = (p: string) =>
  PROTECTED_PREFIXES.some((r) => p === r || p.startsWith(r + "/"));

function hasSessionCookie(req: NextRequest): boolean {
  for (const { name } of req.cookies.getAll()) {
    if (name === "otm.session" || name === "otm.session_token") return true;
    const isOtmCookie =
      name.startsWith("otm.") ||
      name.startsWith("__Secure-otm.") ||
      name.startsWith("__Host-otm.");
    if (isOtmCookie && name.includes("session")) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const loggedIn = hasSessionCookie(req);

  if (loggedIn && isAuthRoute(pathname)) {
    const nextParam = req.nextUrl.searchParams.get("next");
    const dest =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? new URL(nextParam, req.nextUrl.origin)
        : new URL("/dashboard", req.nextUrl.origin);

    return NextResponse.redirect(dest);
  }

  if (!loggedIn && isProtectedRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    const next = pathname + (req.nextUrl.search || "");
    url.search = `?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!.+\\.[\\w]+$|_next/|api/).*)"] };
