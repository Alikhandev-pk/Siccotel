import { NextResponse } from "next/server";

/** Keeps the admin area out of search engines. Authorisation happens on the server (src/lib/cms/auth.ts). */
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/preview/:path*"],
};
