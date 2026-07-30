<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { deleteMessage, editMessage } from "../../../../_store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> },
) {
  const { id, msgId } = await params;
  const body = await req.json();
  const msg = await editMessage(id, msgId, body.content);
  if (!msg) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(msg);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> },
) {
  const { id, msgId } = await params;
  const ok = await deleteMessage(id, msgId);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
=======
import { NextRequest, NextResponse } from "next/server";
import { deleteMessage, editMessage } from "../../../../_store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> },
) {
  const { id, msgId } = await params;
  const body = await req.json();
  const msg = await editMessage(id, msgId, body.content);
  if (!msg) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(msg);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> },
) {
  const { id, msgId } = await params;
  const ok = await deleteMessage(id, msgId);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
>>>>>>> origin/main
