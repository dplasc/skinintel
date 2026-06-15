import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
