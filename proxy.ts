import {
  clerkMiddleware,
  createRouteMatcher,
  currentUser,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/sign-in(.*)",
]);

const isWebhookRoute = createRouteMatcher(["/api/webhooks(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Bypass everything for webhooks — no auth, no currentUser, nothing
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const { userId } = await auth();

  if (userId) {
    const user = await currentUser();
    const role = user?.publicMetadata.role as string | undefined;

    if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (["/sign-up", "/sign-in"].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};