import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // 1. If no token and trying to access protected routes, redirect to login
  if (!token) {
    if (path.startsWith('/login')) {
      return NextResponse.next();
    }
    // Don't redirect if it's an API route (let the API handle auth)
    if (path.startsWith('/api')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;

  // 2. Protect Admin dashboard
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. Protect specific role dashboards
  if (path.startsWith("/ja") && role !== "JA") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/ar") && role !== "AR") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/cw") && role !== "CW") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  // 4. Role-based redirect for home page
  if (path === "/") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "JA") return NextResponse.redirect(new URL("/ja", req.url));
    if (role === "AR") return NextResponse.redirect(new URL("/ar", req.url));
    if (role === "CW") return NextResponse.redirect(new URL("/cw", req.url));
  }

  // 5. If already logged in, don't show login page
  if (path === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/ja/:path*", "/ar/:path*", "/cw/:path*", "/status/:path*", "/login", "/apply"]
};
