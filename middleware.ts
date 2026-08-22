import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login"]);
const PUBLIC_PATH_PREFIXES = [
  // Cross-origin lead-intake endpoints called directly by the public
  // Panna League marketing site (a separate deployment) — never carries
  // the session cookie, so it must stay outside the passcode gate.
  "/api/public/",
  // Fired by Vercel Cron, which can't carry a session cookie — the route
  // itself checks the Authorization header against CRON_SECRET.
  "/api/cron/",
  // A sponsor/club's own public self-service booking page and the
  // real-availability/booking routes it calls — no CRM login for them,
  // trust model matches /api/public/ (a valid sponsor/club id is required
  // to book anything real).
  "/book/",
  "/api/calendar/",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  if (!authenticated) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
