import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function createAuthMiddleware(publicPaths: string[] = []) {
  return clerkMiddleware((auth, req) => {
    const { userId } = auth();
    const path = req.nextUrl.pathname;

    // Check if path is public
    const isPublicPath = publicPaths.some(
      (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
    );

    // Allow public paths
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!userId) {
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  });
}

export { clerkMiddleware };
