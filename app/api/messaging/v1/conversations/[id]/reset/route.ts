<<<<<<< HEAD
import { NextResponse } from "next/server";
import { resetConversation } from "../../../_store";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ok = await resetConversation(id);
  if (!ok) {
    return NextResponse.json(
      { error: "no such seeded conversation" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
=======
import { NextResponse } from "next/server";
import { resetConversation } from "../../../_store";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ok = await resetConversation(id);
  if (!ok) {
    return NextResponse.json(
      { error: "no such seeded conversation" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
>>>>>>> origin/main
