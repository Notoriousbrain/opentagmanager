import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = [
  "/signin",
  "/callback",
  "/verify",
  "/reset",
  "/forgot",
  "/magic",
  "/post-signin",
];
const PROTECTED_PREFIXES = ["/dashboard", "/org", "/account"];

const isAuthRoute = (p: string) =>
  AUTH_ROUTES.some((r) => p === r || p.startsWith(r + "/"));
const isProtectedRoute = (p: string) =>
  PROTECTED_PREFIXES.some((r) => p === r || p.startsWith(r + "/"));

function hasSessionCookie(req: NextRequest): boolean {
  for (const c of req.cookies.getAll()) {
    const n = c.name;
    if (
      n === "otm.session_token" ||
      n === "otm.session" ||
      n.startsWith("otm.") ||
      n.startsWith("__Secure-otm.") ||
      n.startsWith("__Host-otm.")
    ) {
      return true;
    }
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/post-signin") return NextResponse.next();

  const loggedIn = hasSessionCookie(req);

  if (loggedIn && isAuthRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!loggedIn && isProtectedRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    const next = pathname + (search || "");
    url.search = `?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!.+\\.[\\w]+$|_next/|api/).*)"] };
