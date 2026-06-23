import { NextRequest, NextResponse } from "next/server";
import { browseChannels } from "../_store";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? undefined;
  const channels = await browseChannels(query, req);
  return NextResponse.json({ channels, has_more: false });
}
