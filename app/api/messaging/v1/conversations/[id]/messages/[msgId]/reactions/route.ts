import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, toggleReaction } from "../../../../../_store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> },
) {
  const { id, msgId } = await params;
  const body = await req.json();
  const me = getCurrentUserId(req);
  const msg = await toggleReaction(id, msgId, me, body.emoji);
  if (!msg) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(msg);
}
