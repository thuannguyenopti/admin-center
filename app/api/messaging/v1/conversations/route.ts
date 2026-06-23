import { NextRequest, NextResponse } from "next/server";
import {
  createChannel,
  createDM,
  createGroup,
  getUserProfiles,
  listConversations,
} from "../_store";

export async function GET(req: NextRequest) {
  const conversations = await listConversations(req);
  const ids = new Set<string>();
  for (const c of conversations) {
    c.other_participant_ids.forEach((id) => ids.add(id));
    if (c.last_message_sender_id) ids.add(c.last_message_sender_id);
  }
  const user_profiles = await getUserProfiles([...ids]);
  return NextResponse.json({ conversations, user_profiles });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.type === "public_channel" || body.type === "private_channel") {
    if (!body.name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const conv = await createChannel(body.name, body.type, body.description, req);
    return NextResponse.json(conv);
  }
  if (body.participant_id) {
    const conv = await createDM(body.participant_id, req);
    return NextResponse.json(conv);
  }
  if (body.participant_ids && body.name) {
    const conv = await createGroup(body.name, body.participant_ids, req);
    return NextResponse.json(conv);
  }
  return NextResponse.json({ error: "unsupported" }, { status: 400 });
}
