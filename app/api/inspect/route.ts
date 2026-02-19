import { NextRequest, NextResponse } from "next/server";
import { getCharacterData } from "@/lib/blizzard";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const realm = searchParams.get("realm");
  const name = searchParams.get("name");

  if (!realm || !name) {
    return NextResponse.json(
      { error: "Missing realm or name parameter" },
      { status: 400 }
    );
  }

  try {
    const data = await getCharacterData(realm, name);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
