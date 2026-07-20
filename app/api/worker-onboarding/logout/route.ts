import { NextResponse } from "next/server";
import {
  onboardingCookieName,
  secureCookie,
  workerSessionCookieName
} from "@/lib/server/worker-session";

export async function POST() {
  const response = NextResponse.json({ disconnected: true });
  for (const name of [onboardingCookieName, workerSessionCookieName]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });
  }
  return response;
}
