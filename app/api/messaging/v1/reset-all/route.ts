import { NextResponse } from "next/server";
import { resetAll } from "../_store";

export async function POST() {
  await resetAll();
  return NextResponse.json({ ok: true });
}
