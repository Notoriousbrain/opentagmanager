import { NextResponse } from "next/server";

export const runtime = "nodejs";

function expireCookie(name: string, path: string, secureNone = false) {
  const base = `${name}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  return [
    `${base}; SameSite=Lax`,
    ...(secureNone ? [`${base}; SameSite=None; Secure`] : []),
  ];
}

export async function POST() {
  const headers = new Headers();

  const names = [
    "otm.state",
    "otm.code_verifier",
    "otm.pkce_verifier",
    "otm.oauth_state",
  ];
  const paths = ["/", "/api", "/api/auth"];

  const setCookies: string[] = [];
  for (const n of names) {
    for (const p of paths) {
      setCookies.push(...expireCookie(n, p, false));
      setCookies.push(...expireCookie(n, p, true));
    }
  }

  for (const c of setCookies) headers.append("Set-Cookie", c);

  return new NextResponse(null, { status: 200, headers });
}
