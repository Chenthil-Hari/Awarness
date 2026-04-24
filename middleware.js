import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminPath = req.nextUrl.pathname.startsWith("/admin");

    // If it's an admin path, ensure user has admin role
    if (isAdminPath && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/leaderboard/:path*",
    "/inbox/:path*",
    "/wiki/:path*",
    "/admin/:path*",
  ],
};
