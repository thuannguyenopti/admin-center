import { NextResponse } from "next/server";
import { archiveConversation } from "../../../_store";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conv = await archiveConversation(id);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(conv);
}
