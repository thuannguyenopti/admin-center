import { NextRequest, NextResponse } from "next/server";
import {
  addAgentReply,
  getCurrentUserId,
  getCoSAutoReply,
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

  // CoS interview auto-replies (all 3 variant convs)
  const COS_CONV_IDS = new Set(["conv-vau-chief-of-staff", "conv-vau-cos-empathetic", "conv-vau-cos-analytic"]);
  if (COS_CONV_IDS.has(id) && senderId !== "vau-chief-of-staff") {
    const reply = getCoSAutoReply(body.content ?? "", id);
    if (reply) {
      await new Promise((r) => setTimeout(r, 300));
      await addAgentReply(id, "vau-chief-of-staff", reply);
    }
  }

  return NextResponse.json(msg);
}
