import { handlers } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const { GET } = handlers;

// 5 login attempts per IP per 15-minute window
const AUTH_LIMIT = 5;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`auth:${ip}`, AUTH_LIMIT, AUTH_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  return handlers.POST(request);
}
