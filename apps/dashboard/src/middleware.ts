// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/roadmap"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const allowed = PUBLIC_ROUTES.includes(pathname);

  if (!allowed) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
