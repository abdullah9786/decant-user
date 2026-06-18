import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_API = "http://localhost:8000/api/v1";

/** Allow axios to reach the FastAPI host (e.g. http://localhost:8000) from /blog pages. */
function connectSrcForBlog(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API;
  try {
    const origin = new URL(base).origin;
    return ["'self'", "https:", origin].join(" ");
  } catch {
    return "'self' https:";
  }
}

/**
 * Route-level CSP for blog (defense in depth with sanitized HTML).
 * Tune `connect-src` / `script-src` if third-party analytics must load on /blog.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/blog")) {
    return NextResponse.next();
  }
  const res = NextResponse.next();
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' https: data: blob:",
      "font-src 'self' https: data:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' https:",
      `connect-src ${connectSrcForBlog()}`,
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    ].join("; "),
  );
  return res;
}

export const config = {
  matcher: ["/blog/:path*"],
};
