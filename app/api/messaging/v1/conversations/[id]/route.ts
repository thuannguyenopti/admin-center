import { NextResponse } from "next/server";
import { getConversation, leaveConversation } from "../../_store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(conv);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = await leaveConversation(id, req);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
