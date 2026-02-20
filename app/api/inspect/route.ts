import { NextRequest, NextResponse } from "next/server";
import { getCharacterData } from "@/lib/blizzard";
import { rateLimit } from "@/lib/rate-limit";

const VALID_REALMS = new Set([
  "crusader-strike",
  "dreamscythe",
  "living-flame",
  "lone-wolf",
  "nightslayer",
  "shadowstrike",
  "wild-growth",
]);

// Only letters, hyphens, and accented characters (WoW character names)
const NAME_PATTERN = /^[a-zA-ZÀ-ÖØ-öø-ÿ'-]{2,12}$/;

// 30 requests per IP per minute
const INSPECT_LIMIT = 30;
const INSPECT_WINDOW_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`inspect:${ip}`, INSPECT_LIMIT, INSPECT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const realm = searchParams.get("realm");
  const name = searchParams.get("name");

  if (!realm || !name) {
    return NextResponse.json(
      { error: "Missing realm or name parameter" },
      { status: 400 }
    );
  }

  if (!VALID_REALMS.has(realm)) {
    return NextResponse.json({ error: "Invalid realm" }, { status: 400 });
  }

  if (!NAME_PATTERN.test(name)) {
    return NextResponse.json(
      { error: "Invalid character name" },
      { status: 400 }
    );
  }

  try {
    const data = await getCharacterData(realm, name);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Inspect API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch character data" },
      { status: 502 }
    );
  }
}
