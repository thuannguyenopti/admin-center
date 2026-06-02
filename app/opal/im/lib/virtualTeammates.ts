// Virtual teammate auto-reply engine for the IM prototype.
// When a human user posts a message in a conversation containing a VAU
// participant, the VAU replies on-brand after a short "thinking" delay.

import http from "./http";
import type { Conversation, IMMessage } from "./types";
import { VAUS } from "@/app/opal/data/vaus";

const MESSAGING_BASE = "";

// VAU user IDs are prefixed so the mock backend can distinguish them from humans.
export const VAU_ID_PREFIX = "vau-";

export type VirtualTeammate = {
  user_id: string;
  display_name: string;
  template_name: string;
  email: string;
  description: string;
  examples: string[];
};

export const VIRTUAL_TEAMMATES: VirtualTeammate[] = VAUS.map((v) => ({
  user_id: `${VAU_ID_PREFIX}${v.id}`,
  display_name: v.name,
  template_name: v.templateName,
  email: v.email,
  description: v.description,
  examples: (v.examples ?? []).map((e) => e.title),
}));

const VAU_BY_ID = new Map(VIRTUAL_TEAMMATES.map((v) => [v.user_id, v]));

export function isVAU(userId: string): boolean {
  return userId.startsWith(VAU_ID_PREFIX);
}

export function getVAU(userId: string): VirtualTeammate | undefined {
  return VAU_BY_ID.get(userId);
}

/**
 * Compose a context-aware reply for a VAU. Pulls phrasing from the VAU's
 * description + example titles so each persona feels distinct.
 */
function composeReply(vau: VirtualTeammate, incoming: IMMessage): string {
  const text = incoming.content.toLowerCase();
  const mentioned = text.includes(`@${vau.display_name.toLowerCase()}`);
  const askedQuestion = /\?$/.test(incoming.content.trim());
  const greeting = /\b(hi|hey|hello|yo|howdy)\b/.test(text);

  // Pick a representative example to anchor the reply.
  const example = vau.examples[Math.floor(Math.random() * vau.examples.length)] ??
    vau.description.split(".")[0];

  if (greeting && !askedQuestion) {
    return `Hey! ${vau.display_name} here. Want me to spin up a ${example.toLowerCase()}?`;
  }
  if (mentioned) {
    return `On it. I can pull together a ${example.toLowerCase()} — want me to ground it in any specific source or just go from what I know?`;
  }
  if (askedQuestion) {
    return `Good question. Off the top of my head, the lever I'd pull here is a ${example.toLowerCase()}. Want me to draft one?`;
  }
  // Default acknowledgement
  return `Tracking. If you want, I can turn this into a ${example.toLowerCase()} — say the word.`;
}

/**
 * Decide whether to trigger a bot reply and which VAU should respond.
 * Returns null if no VAU should reply (e.g. message sender IS a VAU, or no VAUs in conv).
 */
export function pickResponder(
  conversation: Conversation,
  incoming: IMMessage,
): VirtualTeammate | null {
  // Bots don't reply to bots
  if (isVAU(incoming.sender_id)) return null;

  const vauParticipants = conversation.participants
    .map((p) => getVAU(p.user_id))
    .filter((v): v is VirtualTeammate => !!v);

  if (vauParticipants.length === 0) return null;

  // If a VAU is @mentioned, that one responds. Otherwise, in DMs the lone VAU
  // responds; in group chats one of the VAUs is picked at random.
  const text = incoming.content.toLowerCase();
  const mentioned = vauParticipants.find((v) =>
    text.includes(`@${v.display_name.toLowerCase()}`),
  );
  if (mentioned) return mentioned;

  if (conversation.type === "dm") return vauParticipants[0];

  // ~70% chance a VAU chimes in on group/channel messages — keeps demos lively
  // without spamming every send.
  if (Math.random() > 0.7) return null;
  return vauParticipants[Math.floor(Math.random() * vauParticipants.length)];
}

/**
 * Send a message AS a specific VAU by overriding the X-Opal-User-ID header.
 * The mock backend accepts the override; a real backend would require server-side
 * service-account auth, but the shape stays identical. When `threadId` is set,
 * the reply lands inside that thread instead of the main feed.
 */
export async function sendMessageAsVAU(
  vauId: string,
  conversationId: string,
  content: string,
  threadId?: string,
): Promise<IMMessage> {
  const path = threadId
    ? `${MESSAGING_BASE}/conversations/${conversationId}/messages/${threadId}/thread`
    : `${MESSAGING_BASE}/conversations/${conversationId}/messages`;
  const resp = await http.post<IMMessage>(
    path,
    { content },
    { headers: { "X-Opal-User-ID": vauId } },
  );
  return resp.data;
}

/**
 * Public entry point: given an incoming message + the conversation it belongs to,
 * possibly schedule a VAU reply. Returns a promise that resolves to the reply
 * message ID if one was sent, or null if no reply was triggered. If the incoming
 * message is a thread reply, the VAU reply lands in the same thread; if the
 * incoming message starts a thread (has replies), the reply joins the thread too.
 */
export async function maybeReplyAsTeammate(
  conversation: Conversation,
  incoming: IMMessage,
): Promise<string | null> {
  const responder = pickResponder(conversation, incoming);
  if (!responder) return null;

  // Realistic "typing" delay: 1.2s base + 60ms per word, capped at 4s.
  const wordCount = incoming.content.split(/\s+/).length;
  const delay = Math.min(1200 + wordCount * 60, 4000);
  await new Promise((r) => setTimeout(r, delay));

  const reply = composeReply(responder, incoming);
  // Reply inside the thread when the trigger was a thread reply.
  const threadId = incoming.thread_id;
  const sent = await sendMessageAsVAU(
    responder.user_id,
    conversation.id,
    reply,
    threadId,
  );
  return sent.id;
}
