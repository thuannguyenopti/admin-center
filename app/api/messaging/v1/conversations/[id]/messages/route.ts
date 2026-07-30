<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUserId,
  getUserProfiles,
  listMessages,
  sendMessage,
} from "../../../_store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const messages = await listMessages(id);
  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  const user_profiles = await getUserProfiles(senderIds);
  return NextResponse.json({
    messages,
    has_more: false,
    user_profiles,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const senderId = getCurrentUserId(req);
  const msg = await sendMessage(
    id,
    senderId,
    body.content,
    body.reply_to_id,
    body.attachments,
  );
  return NextResponse.json(msg);
}
=======
import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUserId,
  getUserProfiles,
  listMessages,
  sendMessage,
} from "../../../_store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const messages = await listMessages(id);
  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  const user_profiles = await getUserProfiles(senderIds);
  return NextResponse.json({
    messages,
    has_more: false,
    user_profiles,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const senderId = getCurrentUserId(req);
  const msg = await sendMessage(
    id,
    senderId,
    body.content,
    body.reply_to_id,
    body.attachments,
  );
  return NextResponse.json(msg);
}
>>>>>>> origin/main
