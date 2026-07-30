<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { addParticipant } from "../../../_store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  if (!body.user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }
  const conv = await addParticipant(id, body.user_id);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(conv);
}
=======
import { NextRequest, NextResponse } from "next/server";
import { addParticipant } from "../../../_store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  if (!body.user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }
  const conv = await addParticipant(id, body.user_id);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(conv);
}
>>>>>>> origin/main
