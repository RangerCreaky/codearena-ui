import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/onboarding"];
const authRoutes = ["/", "/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // Skip API routes and static files
  if (path.startsWith("/api/") || path.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // If authenticated and on the landing page, redirect to dashboard
  if (isLoggedIn && authRoutes.includes(path)) {
    const isNewUser = req.auth?.isNewUser;
    const redirectPath = isNewUser ? "/onboarding" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  // If not authenticated and trying to access protected routes
  if (!isLoggedIn && protectedRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)",
  ],
};
