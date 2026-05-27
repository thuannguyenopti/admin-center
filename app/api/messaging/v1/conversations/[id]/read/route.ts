import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, markRead } from "../../../_store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = getCurrentUserId(req);
  await markRead(id, me);
  return NextResponse.json({ ok: true });
}
