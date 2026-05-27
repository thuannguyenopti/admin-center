import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "../../_store";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const users = await searchUsers(q);
  return NextResponse.json({ users });
}
