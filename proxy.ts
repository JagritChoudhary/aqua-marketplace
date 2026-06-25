import {
  clerkMiddleware,
  createRouteMatcher,
  currentUser,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const ispublicRoutes = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/sign-up(.*)",
  "/sign-in(.*)",
]);
export default clerkMiddleware(async (auth, req) => {
  if (!ispublicRoutes(req)) {
    await auth.protect();
  }

  const user = await currentUser();
  const role = user?.publicMetadata.role as string | undefined;

  //admin roles redirection-
  if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
  //prevent non-admin users to access to admin routes
  if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  //redirect authenticated user trying to access public routes;they still can access sign-in -
  const { userId } = await auth();
  if (userId && ["/sign-up", "/sign-in"].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url),
    );
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
