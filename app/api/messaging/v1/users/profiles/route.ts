<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { getUserProfiles } from "../../_store";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").filter(Boolean);
  const profiles = await getUserProfiles(ids);
  return NextResponse.json({ profiles });
}
=======
import { NextRequest, NextResponse } from "next/server";
import { getUserProfiles } from "../../_store";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").filter(Boolean);
  const profiles = await getUserProfiles(ids);
  return NextResponse.json({ profiles });
}
>>>>>>> origin/main
