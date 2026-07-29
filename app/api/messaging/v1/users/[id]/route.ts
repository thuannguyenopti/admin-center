import { NextRequest, NextResponse } from "next/server";
import { updateUserDisplayName } from "../../_store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  if (typeof body.display_name === "string" && body.display_name.trim()) {
    await updateUserDisplayName(id, body.display_name.trim());
  }
  return NextResponse.json({ ok: true });
}
