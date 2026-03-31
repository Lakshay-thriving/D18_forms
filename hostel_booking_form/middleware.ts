export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (req.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;
  const path = req.nextUrl.pathname;

  // Protect specific dashboards
  if (path.startsWith("/ja") && role !== "JA") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/ar") && role !== "AR") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/cw") && role !== "CW") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  if (path === "/") {
    if (role === "JA") return NextResponse.redirect(new URL("/ja", req.url));
    if (role === "AR") return NextResponse.redirect(new URL("/ar", req.url));
    if (role === "CW") return NextResponse.redirect(new URL("/cw", req.url));
  }

  if (path === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/ja/:path*", "/ar/:path*", "/cw/:path*", "/status/:path*", "/login", "/apply"]
};
