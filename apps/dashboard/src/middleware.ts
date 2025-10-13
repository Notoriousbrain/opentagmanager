import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const lock = process.env.OSSTAG_MARKETING_LOCK;
  const isLocked =
    typeof lock === "string" &&
    ["1", "true", "yes", "on"].includes(lock.toLowerCase());

  if (!isLocked) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  const isNextInternal = pathname.startsWith("/_next/");
  const isPublicAsset =
    /\.(?:ico|png|jpg|jpeg|svg|gif|webp|avif|css|js|map|txt|xml|json)$/.test(
      pathname
    );

  if (isNextInternal || isPublicAsset) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/trpc")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image")
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    "/:path*",
  ],
};
