import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Use a try-catch to prevent Edge Runtime crashes from taking down the connection
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || "iit_ropar_secr3t_k3y_for_nextauth" 
    });
    
    const { pathname } = req.nextUrl;

    // 1. PUBLIC ROUTES (Always allowed)
    if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/_next')) {
       // If logged in, don't show login page
       if (token && pathname === '/login') {
         return NextResponse.redirect(new URL("/", req.url));
       }
       return NextResponse.next();
    }

    // 2. AUTH CHECK (Redirect to login if no token)
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;

    // 3. ROLE PROTECTION
    // Admin only routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Home page redirects (Optional but helpful)
    if (pathname === "/") {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "JA") return NextResponse.redirect(new URL("/ja", req.url));
      if (role === "AR") return NextResponse.redirect(new URL("/ar", req.url));
      if (role === "CW") return NextResponse.redirect(new URL("/cw", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next(); // Fallback to allow connection if middleware fails
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api(?!/auth)|_next/static|_next/image|favicon.ico).*)',
  ],
};
